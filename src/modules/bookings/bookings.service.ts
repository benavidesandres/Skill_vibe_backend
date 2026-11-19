import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Skill } from '../skills/entities/skill.entity';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enums/booking-status.enum';
import { CreateBookingDto } from './dto/create-booking.dto';
import { VideoRoomProvider } from '../video/video-room.provider';

// Cambios de estado permitidos para cada parte de la reserva
const TUTOR_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED],
};
const STUDENT_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  [BookingStatus.PENDING]: [BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly videoRoomProvider: VideoRoomProvider,
  ) {}

  async create(dto: CreateBookingDto, student: User): Promise<Booking> {
    const skill = await this.skillsRepository.findOne({
      where: { id: dto.skillId },
    });
    if (!skill) {
      throw new NotFoundException(`Oferta con id ${dto.skillId} no encontrada`);
    }
    if (!skill.isActive) {
      throw new BadRequestException('La oferta no está disponible');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha de la sesión debe ser futura');
    }

    const booking = this.bookingsRepository.create({
      skillId: skill.id,
      studentId: student.id,
      scheduledAt,
      hours: dto.hours,
      totalPrice: Math.round(skill.pricePerHour * dto.hours * 100) / 100,
      message: dto.message ?? null,
    });
    const saved = await this.bookingsRepository.save(booking);
    return this.findOne(saved.id, student);
  }

  /**
   * Estudiante: las reservas que hizo.
   * Tutor: las reservas que le hicieron a sus ofertas.
   */
  findMine(user: User): Promise<Booking[]> {
    const qb = this.withDetails();
    if (user.role === UserRole.TUTOR) {
      qb.where('skill.tutorId = :userId', { userId: user.id });
    } else {
      qb.where('booking.studentId = :userId', { userId: user.id });
    }
    return qb.orderBy('booking.scheduledAt', 'DESC').getMany();
  }

  // Solo la ven el estudiante que reservó y el tutor de la oferta
  async findOne(id: string, user: User): Promise<Booking> {
    const booking = await this.withDetails()
      .where('booking.id = :id', { id })
      .getOne();
    if (!booking) {
      throw new NotFoundException(`Reserva con id ${id} no encontrada`);
    }
    if (booking.studentId !== user.id && booking.skill.tutorId !== user.id) {
      throw new ForbiddenException('No participas en esta reserva');
    }
    return booking;
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    user: User,
  ): Promise<Booking> {
    const booking = await this.findOne(id, user);

    const transitions =
      booking.skill.tutorId === user.id
        ? TUTOR_TRANSITIONS
        : STUDENT_TRANSITIONS;
    const allowed = transitions[booking.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `No puedes cambiar la reserva de ${booking.status} a ${status}`,
      );
    }

    // Al confirmar se crea el link de la videollamada, solo si no existe ya.
    // Se guarda junto con el estado en la misma operación
    const changes: Partial<Booking> = { status };
    if (status === BookingStatus.CONFIRMED && !booking.meetingLink) {
      changes.meetingLink = this.videoRoomProvider.generateMeetingLink(
        booking.id,
      );
    }

    // update() en vez de save() para no tocar las relaciones cargadas a medias
    await this.bookingsRepository.update(booking.id, changes);
    return this.findOne(id, user);
  }

  // Une la oferta, el tutor y el estudiante con solo sus datos públicos
  private withDetails(): SelectQueryBuilder<Booking> {
    return this.bookingsRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.skill', 'skill')
      .leftJoin('skill.tutor', 'tutor')
      .addSelect(['tutor.id', 'tutor.fullName'])
      .leftJoin('booking.student', 'student')
      .addSelect(['student.id', 'student.fullName']);
  }
}
