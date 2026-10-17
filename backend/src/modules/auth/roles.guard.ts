import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isSuperAdminRole } from '../../common/roles';
import { IS_PUBLIC_KEY, ROLES_METADATA_KEY, SUPER_ADMIN_ONLY_KEY } from './roles.decorator';

/**
 * 授权守卫：在 `TokenAuthGuard` 完成身份认证之后，判断当前角色是否有权访问。
 *
 * 该守卫通过 `APP_GUARD` **全局注册**，`request.user.roleId` 来自数据库实时查询，
 * 所以角色调整会立刻生效。
 *
 * 判定规则（顺序从上到下）：
 *  1. `@Public()`            → 放行（无需登录，交给 TokenAuthGuard 之外处理）
 *  2. `@SuperAdminOnly()`    → 必须超管
 *  3. `@Roles(1, 2, ...)`    → 必须是列出的角色之一
 *  4. 未标注任何装饰器        → 「登录即可访问」（与改造前行为一致，避免误伤现有业务）
 *
 * 第 4 条是当前的宽松默认值；若要收紧为「默认拒绝」，把最后那个 `return true`
 * 换成抛 `ForbiddenException` 即可，但需要先给所有接口补上 `@Roles` 标注。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    if (isPublic) {
      return true;
    }

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
