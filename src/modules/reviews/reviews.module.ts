import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  // Booking se registra para verificar que la reserva exista y esté completada
  imports: [TypeOrmModule.forFeature([Review, Booking])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
