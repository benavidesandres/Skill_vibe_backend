import { IsEnum } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, {
    message: `El estado debe ser uno de: ${Object.values(BookingStatus).join(', ')}`,
  })
  status!: BookingStatus;
}
