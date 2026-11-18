import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Indica qué roles pueden usar una ruta. Se combina con RolesGuard.
 * Uso: @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.TUTOR)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
