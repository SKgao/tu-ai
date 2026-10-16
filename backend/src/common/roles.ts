const SUPER_ADMIN_ROLE_IDS_KEY = 'SUPER_ADMIN_ROLE_IDS';

/**
 * 超级管理员角色 ID 的默认值。
 * 与 prisma/seed.ts 中先创建的角色（id = 1）保持一致。
 */
const DEFAULT_SUPER_ADMIN_ROLE_IDS = [1];

function parseRoleIds(raw: string): number[] {
  return raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

/**
 * 解析超级管理员角色 ID。
 *
 * 通过环境变量 `SUPER_ADMIN_ROLE_IDS` 覆盖（逗号分隔），
 * 避免把“id = 1 即超管”这个隐式约定散落在业务代码里。
 */
export function getSuperAdminRoleIds(): number[] {
  const raw = (process.env[SUPER_ADMIN_ROLE_IDS_KEY] || '').trim();
  if (!raw) {
    return DEFAULT_SUPER_ADMIN_ROLE_IDS;
  }

  const parsed = parseRoleIds(raw);
  return parsed.length ? parsed : DEFAULT_SUPER_ADMIN_ROLE_IDS;
}

export function isSuperAdminRole(roleId: unknown): boolean {
  const id = Number(roleId);
  if (!Number.isInteger(id)) {
    return false;
  }

  return getSuperAdminRoleIds().includes(id);
}
