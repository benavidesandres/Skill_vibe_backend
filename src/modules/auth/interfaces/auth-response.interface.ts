import { User } from '../../users/entities/user.entity';

/** Respuesta de /auth/register y /auth/login */
export class AuthResponse {
  accessToken!: string;
  user!: User;
}
