import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export type Role = 'owner' | 'administrator' | 'user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some(role => this.hasRole(user.role, role));
  }

  private hasRole(userRole: string, requiredRole: Role): boolean {
    // Role hierarchy: owner > administrator > user
    const roleHierarchy = {
      owner: ['owner', 'administrator', 'user'],
      administrator: ['administrator', 'user'],
      user: ['user'],
    };

    return roleHierarchy[userRole]?.includes(requiredRole) || false;
  }
}