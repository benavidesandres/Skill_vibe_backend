import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Reservas de tutorías. Todas las rutas requieren token.
 */
@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // POST /api/v1/bookings  -> solo estudiantes
  @ApiOperation({ summary: 'Reservar una oferta (estudiante)' })
  @Post()
  @Roles(UserRole.STUDENT)
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() student: User,
  ): Promise<Booking> {
    return this.bookingsService.create(dto, student);
  }

  // GET /api/v1/bookings/mine
  @ApiOperation({ summary: 'Mis reservas (estudiante: hechas / tutor: recibidas)' })
  @Get('mine')
  findMine(@CurrentUser() user: User): Promise<Booking[]> {
    return this.bookingsService.findMine(user);
  }

  // GET /api/v1/bookings/:id
  @ApiOperation({ summary: 'Ver una reserva en la que participo' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return this.bookingsService.findOne(id, user);
  }

  // PATCH /api/v1/bookings/:id/status
  @ApiOperation({ summary: 'Cambiar estado: tutor confirma/rechaza/completa, estudiante cancela' })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: User,
  ): Promise<Booking> {
    return this.bookingsService.updateStatus(id, dto.status, user);
  }
}
