import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType hereda las validaciones de CreateUserDto pero vuelve todos los campos opcionales.
// El rol se elige solo al registrarse: si un tutor se pasara a estudiante,
// sus ofertas y reservas quedarían colgando.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role'] as const),
) {}
