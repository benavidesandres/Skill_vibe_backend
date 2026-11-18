import { User } from '../../users/entities/user.entity';

/** Respuesta de /auth/register y /auth/login */
export interface AuthResponse {
  accessToken: string;
  user: User;
}
