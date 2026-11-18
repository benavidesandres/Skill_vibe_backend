import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Todas las rutas requieren token. La creación de usuarios se hace
 * por POST /auth/register (ruta pública).
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/v1/users
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // GET /api/v1/users/:id  (ParseUUIDPipe responde 400 si el id no es un UUID)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // PATCH /api/v1/users/:id  -> solo el dueño de la cuenta
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    this.assertIsOwner(id, currentUser);
    return this.usersService.update(id, dto);
  }

  // DELETE /api/v1/users/:id  -> 204 No Content, solo el dueño de la cuenta
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    this.assertIsOwner(id, currentUser);
    return this.usersService.remove(id);
  }

  private assertIsOwner(id: string, currentUser: User): void {
    if (currentUser.id !== id) {
      throw new ForbiddenException('Solo puedes modificar tu propia cuenta');
    }
  }
}
