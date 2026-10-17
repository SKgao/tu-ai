import { SetMetadata } from '@nestjs/common';

export const ROLES_METADATA_KEY = 'authz:roles';
export const SUPER_ADMIN_ONLY_KEY = 'authz:super-admin-only';
export const IS_PUBLIC_KEY = 'authz:public';

/**
 * 标记接口为公开访问（无需登录）。
 *
 * 守卫是全局注册的，因此除显式标注 `@Public()` 的接口外，所有路由都必须带 token。
 * 目前只有登录接口使用它。
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * 限定允许访问的角色 ID，例如 `@Roles(1, 2)`。
 *
 * 需要配合 `RolesGuard` 使用，并且必须排在 `TokenAuthGuard` 之后，
 * 否则 `request.user` 还没被赋值。
 */
export const Roles = (...roleIds: number[]) => SetMetadata(ROLES_METADATA_KEY, roleIds);

/**
 * 仅允许超级管理员访问。
 *
 * 超管角色 ID 由 `SUPER_ADMIN_ROLE_IDS` 配置（默认 1），
 * 这样就不用在每个 controller 上硬编码角色 ID。
 */
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_ONLY_KEY, true);
