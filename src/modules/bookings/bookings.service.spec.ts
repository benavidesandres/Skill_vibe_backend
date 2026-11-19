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
  });
});
