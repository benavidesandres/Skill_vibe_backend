import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { Skill } from '../skills/entities/skill.entity';
import { VideoModule } from '../video/video.module';

@Module({
  // Skill se registra aquí para leer el precio y el estado de la oferta al reservar.
  // VideoModule aporta el VideoRoomProvider que crea el link al confirmar
  imports: [TypeOrmModule.forFeature([Booking, Skill]), VideoModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
