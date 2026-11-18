import { CreateUserDto } from '../../users/dto/create-user.dto';

/**
 * Datos para registrarse. Reutiliza las validaciones de CreateUserDto
 * (fullName, email, password y role opcional).
 */
export class RegisterDto extends CreateUserDto {}
