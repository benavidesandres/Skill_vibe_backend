import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas: si no hay token o es inválido responde 401.
 * Uso: @UseGuards(JwtAuthGuard) en un controlador o en un método.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
