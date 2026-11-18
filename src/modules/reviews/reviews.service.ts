import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../bookings/enums/booking-status.enum';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

// Código de PostgreSQL para violación de restricción UNIQUE
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateReviewDto, student: User): Promise<Review> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: dto.bookingId },
    });
    if (!booking) {
      throw new NotFoundException(
        `Reserva con id ${dto.bookingId} no encontrada`,
      );
    }
    if (booking.studentId !== student.id) {
      throw new ForbiddenException('Solo puedes reseñar tus propias reservas');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Solo se pueden reseñar reservas completadas',
      );
    }
    if (await this.reviewsRepository.exists({ where: { bookingId: booking.id } })) {
      throw new ConflictException('Ya dejaste una reseña para esta reserva');
    }

    try {
      // La reseña y el nuevo promedio de la oferta se guardan juntos o no se guarda nada
      return await this.dataSource.transaction(async (manager) => {
        const review = await manager.save(
          manager.create(Review, {
            bookingId: booking.id,
            skillId: booking.skillId,
            studentId: student.id,
            rating: dto.rating,
            comment: dto.comment ?? null,
          }),
        );

        const stats = await manager
          .createQueryBuilder(Review, 'review')
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(review.id)', 'count')
          .where('review.skillId = :skillId', { skillId: booking.skillId })
          .getRawOne<{ average: string; count: string }>();

        await manager.update(Skill, booking.skillId, {
          averageRating: Math.round(Number(stats?.average ?? 0) * 100) / 100,
          reviewsCount: Number(stats?.count ?? 0),
        });

        return review;
      });
    } catch (error) {
      // Dos peticiones al mismo tiempo para la misma reserva
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException('Ya dejaste una reseña para esta reserva');
      }
      throw error;
    }
  }

  // Reseñas de una oferta, con el nombre del estudiante y sin datos privados
  findBySkill(skillId: string): Promise<Review[]> {
    return this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoin('review.student', 'student')
      .addSelect(['student.id', 'student.fullName'])
      .where('review.skillId = :skillId', { skillId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }
}
