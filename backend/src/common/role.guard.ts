import { CanActivate, ExecutionContext, ForbiddenException, Type } from '@nestjs/common';

/** Must run after JwtAuthGuard — relies on request.user already being set. */
export function RoleGuard(role: 'buyer' | 'seller'): Type<CanActivate> {
  class RoleGuardImpl implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const { user } = context.switchToHttp().getRequest();
      if (user?.role !== role) {
        throw new ForbiddenException({ detail: [`Only ${role}s can do this.`] });
      }
      return true;
    }
  }
  return RoleGuardImpl;
}
