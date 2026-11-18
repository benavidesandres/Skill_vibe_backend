import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { Skill } from '../skills/entities/skill.entity';

@Module({
  // Skill se registra aquí para leer el precio y el estado de la oferta al reservar
  imports: [TypeOrmModule.forFeature([Booking, Skill])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
