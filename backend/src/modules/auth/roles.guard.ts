import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isSuperAdminRole } from '../../common/roles';
import { ROLES_METADATA_KEY, SUPER_ADMIN_ONLY_KEY } from './roles.decorator';

/**
 * 授权守卫：在 `TokenAuthGuard` 完成身份认证之后，判断当前角色是否有权访问。
 *
 * 未标注 `@Roles()` / `@SuperAdminOnly()` 的接口保持“登录即可访问”，
 * 这样既堵住了越权入口，又不会影响其余业务接口的现有行为。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    const superAdminOnly = this.reflector.getAllAndOverride<boolean>(SUPER_ADMIN_ONLY_KEY, targets);
    const allowedRoleIds = this.reflector.getAllAndOverride<number[]>(ROLES_METADATA_KEY, targets);

    if (!superAdminOnly && !allowedRoleIds?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { roleId?: number } }>();
    const roleId = request.user?.roleId;

    if (superAdminOnly && isSuperAdminRole(roleId)) {
      return true;
    }

    if (allowedRoleIds?.length && allowedRoleIds.map(Number).includes(Number(roleId))) {
      return true;
    }

    throw new ForbiddenException('没有权限执行该操作');
  }
}
