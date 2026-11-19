import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enums/booking-status.enum';
import { User } from '../users/entities/user.entity';
import { VideoRoomProvider } from '../video/video-room.provider';

const TUTOR_ID = '11111111-1111-4111-8111-111111111111';
const STUDENT_ID = '22222222-2222-4222-8222-222222222222';
const AJENO_ID = '33333333-3333-4333-8333-333333333333';
const BOOKING_ID = '44444444-4444-4444-8444-444444444444';
const LINK = 'http://localhost:3000/sala.html?room=abc123';

const usuario = (id: string) => ({ id }) as User;

// Reserva en memoria con el estado que pida cada test
function crearReserva(
  status: BookingStatus,
  meetingLink: string | null = null,
): Booking {
  return Object.assign(new Booking(), {
    id: BOOKING_ID,
    studentId: STUDENT_ID,
    status,
    meetingLink,
    skill: { tutorId: TUTOR_ID },
  });
}

// Repositorio falso: el query builder devuelve siempre la misma reserva
// y update() aplica los cambios sobre ella, como haría la base
function crearServicio(reserva: Booking) {
  const qb: Record<string, jest.Mock> = {};
  for (const metodo of [
    'innerJoinAndSelect',
    'leftJoin',
    'addSelect',
    'where',
  ]) {
    qb[metodo] = jest.fn().mockReturnValue(qb);
  }
  qb.getOne = jest.fn().mockResolvedValue(reserva);

  const bookingsRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(qb),
    update: jest.fn((_id: string, cambios: Partial<Booking>) => {
      Object.assign(reserva, cambios);
      return Promise.resolve();
    }),
  };
  const videoRoomProvider: VideoRoomProvider = {
    generateMeetingLink: jest.fn().mockReturnValue(LINK),
  };
  const service = new BookingsService(
    bookingsRepository as never,
    {} as never,
    videoRoomProvider,
  );
  return { service, bookingsRepository, videoRoomProvider };
}

describe('BookingsService - videollamada', () => {
  describe('al confirmar', () => {
    it('genera el link con el id de la reserva y lo guarda junto con el estado', async () => {
      const reserva = crearReserva(BookingStatus.PENDING);
      const { service, bookingsRepository, videoRoomProvider } =
        crearServicio(reserva);

      const respuesta = await service.updateStatus(
        BOOKING_ID,
        BookingStatus.CONFIRMED,
        usuario(TUTOR_ID),
      );

      expect(videoRoomProvider.generateMeetingLink).toHaveBeenCalledWith(
        BOOKING_ID,
      );
      // Una sola operación de escritura con estado y link
      expect(bookingsRepository.update).toHaveBeenCalledTimes(1);
      expect(bookingsRepository.update).toHaveBeenCalledWith(BOOKING_ID, {
        status: BookingStatus.CONFIRMED,
        meetingLink: LINK,
      });
      expect(respuesta.meetingLink).toBe(LINK);
    });

    it('confirmar dos veces no cambia el link', async () => {
      const reserva = crearReserva(BookingStatus.PENDING);
      const { service, videoRoomProvider } = crearServicio(reserva);
      const tutor = usuario(TUTOR_ID);

      await service.updateStatus(BOOKING_ID, BookingStatus.CONFIRMED, tutor);
      // La segunda confirmación la rechazan las reglas de transición (400)
      await expect(
        service.updateStatus(BOOKING_ID, BookingStatus.CONFIRMED, tutor),
      ).rejects.toThrow(BadRequestException);

      expect(reserva.meetingLink).toBe(LINK);
      expect(videoRoomProvider.generateMeetingLink).toHaveBeenCalledTimes(1);
    });

    it('no regenera el link si la reserva ya tenía uno', async () => {
      const reserva = crearReserva(BookingStatus.PENDING, 'http://viejo/link');
      const { service, bookingsRepository, videoRoomProvider } =
        crearServicio(reserva);

      await service.updateStatus(
        BOOKING_ID,
        BookingStatus.CONFIRMED,
        usuario(TUTOR_ID),
      );

      expect(videoRoomProvider.generateMeetingLink).not.toHaveBeenCalled();
      expect(bookingsRepository.update).toHaveBeenCalledWith(BOOKING_ID, {
        status: BookingStatus.CONFIRMED,
      });
      expect(reserva.meetingLink).toBe('http://viejo/link');
    });
  });

  describe('en otros estados', () => {
    it('al rechazar no genera link', async () => {
      const reserva = crearReserva(BookingStatus.PENDING);
      const { service, videoRoomProvider } = crearServicio(reserva);

      await service.updateStatus(
        BOOKING_ID,
        BookingStatus.REJECTED,
        usuario(TUTOR_ID),
      );

      expect(videoRoomProvider.generateMeetingLink).not.toHaveBeenCalled();
      expect(reserva.meetingLink).toBeNull();
    });

    it('al cancelar (estudiante) no genera link', async () => {
      const reserva = crearReserva(BookingStatus.PENDING);
      const { service, videoRoomProvider } = crearServicio(reserva);

      await service.updateStatus(
        BOOKING_ID,
        BookingStatus.CANCELLED,
        usuario(STUDENT_ID),
      );

      expect(videoRoomProvider.generateMeetingLink).not.toHaveBeenCalled();
    });
  });

  describe('respuesta serializada', () => {
    // La respuesta HTTP pasa por ClassSerializerInterceptor, que usa instanceToPlain
    it('muestra meetingLink solo si la reserva está confirmada', () => {
      const confirmada = crearReserva(BookingStatus.CONFIRMED, LINK);
      expect(instanceToPlain(confirmada).meetingLink).toBe(LINK);
    });

    it.each([
      BookingStatus.PENDING,
      BookingStatus.REJECTED,
      BookingStatus.CANCELLED,
      BookingStatus.COMPLETED,
    ])('devuelve null en estado %s aunque haya un link guardado', (estado) => {
      const reserva = crearReserva(estado, LINK);
      expect(instanceToPlain(reserva).meetingLink).toBeNull();
    });

    it('la reserva completada que devuelve updateStatus sale con null', async () => {
      const reserva = crearReserva(BookingStatus.CONFIRMED, LINK);
      const { service } = crearServicio(reserva);

      const respuesta = await service.updateStatus(
        BOOKING_ID,
        BookingStatus.COMPLETED,
        usuario(TUTOR_ID),
      );

      expect(instanceToPlain(respuesta).meetingLink).toBeNull();
      // El valor guardado no se borra, solo se oculta en la respuesta
      expect(reserva.meetingLink).toBe(LINK);
    });
  });

  describe('acceso', () => {
    it('un usuario ajeno recibe 403 al consultar la reserva', async () => {
      const reserva = crearReserva(BookingStatus.CONFIRMED, LINK);
      const { service } = crearServicio(reserva);

      await expect(
        service.findOne(BOOKING_ID, usuario(AJENO_ID)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('un usuario ajeno recibe 403 al intentar confirmar y no se genera link', async () => {
      const reserva = crearReserva(BookingStatus.PENDING);
      const { service, bookingsRepository, videoRoomProvider } =
        crearServicio(reserva);

      await expect(
        service.updateStatus(
          BOOKING_ID,
          BookingStatus.CONFIRMED,
          usuario(AJENO_ID),
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(videoRoomProvider.generateMeetingLink).not.toHaveBeenCalled();
      expect(bookingsRepository.update).not.toHaveBeenCalled();
    });
  });
});
