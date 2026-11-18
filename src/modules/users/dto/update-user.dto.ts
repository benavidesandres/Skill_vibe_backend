import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType hereda las validaciones de CreateUserDto pero vuelve todos los campos opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {}
