import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  fullName!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72) // bcrypt solo usa los primeros 72 bytes
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser student o tutor' })
  role?: UserRole;
}
