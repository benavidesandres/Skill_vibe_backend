import { UserRole } from '../../users/enums/user-role.enum';

/**
 * Información que viaja dentro del token JWT.
 * `sub` (subject) es el estándar para el id del usuario.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
