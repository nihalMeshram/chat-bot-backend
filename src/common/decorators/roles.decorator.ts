import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/types/user-role.type';

/**
 * Constant key used to store metadata for roles on route handlers or controllers.
 * This key is later used by the RolesGuard to retrieve role requirements.
 */
export const ROLES_KEY = 'roles';

/**
 * Custom decorator to specify required user roles for a route.
 * It attaches metadata to route handlers that is later used in authorization logic.
 *
 * @param roles - One or more roles that are allowed to access the route
 * @returns A decorator function that sets metadata using NestJS's SetMetadata
 *
 * @example
 * \@Roles(UserRole.ADMIN)
 * \@UseGuards(JwtAuthGuard, RolesGuard)
 * \@Get('admin')
 * getAdminData() {
 *   // Accessible only to ADMIN users
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
