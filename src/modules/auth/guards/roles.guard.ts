import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { UserRole } from '../../users/types/user-role.type';

/**
 * Guard to enforce role-based access control using custom `@Roles()` decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  /**
   * Determines whether the current request can proceed based on user roles.
   * @param context - The execution context of the request
   * @returns true if the user's role is allowed or no roles are required
   */
  canActivate(context: ExecutionContext): boolean {
    // Retrieve required roles defined via `@Roles()` decorator (if any)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Method-level metadata
      context.getClass(),   // Class-level metadata
    ]);

    // If no roles are specified, allow access by default
    if (!requiredRoles) return true;

    // Get the authenticated user from the request object
    const { user } = context.switchToHttp().getRequest();

    // Allow access only if the user's role is among the required roles
    return requiredRoles.includes(user.role);
  }
}
