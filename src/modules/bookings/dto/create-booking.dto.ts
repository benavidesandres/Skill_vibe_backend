import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsUUID('4', { message: 'skillId debe ser un UUID' })
  skillId!: string;

  // Fecha y hora de la sesión en formato ISO, ej. "2026-12-01T15:00:00Z"
  @IsDateString({}, { message: 'scheduledAt debe ser una fecha ISO válida' })
  scheduledAt!: string;

  @IsInt()
  @Min(1, { message: 'La reserva debe ser de al menos 1 hora' })
  @Max(4, { message: 'La reserva puede ser de máximo 4 horas' })
  hours!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
