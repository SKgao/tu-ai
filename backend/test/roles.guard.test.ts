import assert from 'node:assert/strict';
import test from 'node:test';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles, SuperAdminOnly } from '../src/modules/auth/roles.decorator';
import { RolesGuard } from '../src/modules/auth/roles.guard';
import { getSuperAdminRoleIds, isSuperAdminRole } from '../src/common/roles';

// 守卫直接读取 process.env，这里显式固定，避免依赖开发者本机配置。
process.env.SUPER_ADMIN_ROLE_IDS = '1';

class DemoController {
  @SuperAdminOnly()
  adminOnly() {}

  @Roles(2, 3)
  limitedToOpsAndEditor() {}

  openToAnyLoggedInUser() {}
}

function createContext(handler: () => void, roleId?: number): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => DemoController,
    switchToHttp: () => ({
      getRequest: () => (roleId === undefined ? {} : { user: { roleId } }),
    }),
  } as unknown as ExecutionContext;
}

function guard() {
  return new RolesGuard(new Reflector());
}

test('未标注的接口对所有已登录角色开放', () => {
  assert.equal(guard().canActivate(createContext(DemoController.prototype.openToAnyLoggedInUser, 9)), true);
});

test('@SuperAdminOnly 允许超级管理员', () => {
  assert.equal(guard().canActivate(createContext(DemoController.prototype.adminOnly, 1)), true);
});

test('@SuperAdminOnly 拒绝非超级管理员', () => {
  assert.throws(
    () => guard().canActivate(createContext(DemoController.prototype.adminOnly, 2)),
    (error: unknown) =>
      error instanceof ForbiddenException && error.message === '没有权限执行该操作',
  );
});

test('@SuperAdminOnly 在缺少用户信息时也拒绝', () => {
  assert.throws(() => guard().canActivate(createContext(DemoController.prototype.adminOnly)), ForbiddenException);
});

test('@Roles 只放行列出的角色', () => {
  assert.equal(guard().canActivate(createContext(DemoController.prototype.limitedToOpsAndEditor, 2)), true);
  assert.equal(guard().canActivate(createContext(DemoController.prototype.limitedToOpsAndEditor, 3)), true);
  assert.throws(
    () => guard().canActivate(createContext(DemoController.prototype.limitedToOpsAndEditor, 1)),
    ForbiddenException,
  );
});

test('SUPER_ADMIN_ROLE_IDS 可覆盖超管角色', () => {
  process.env.SUPER_ADMIN_ROLE_IDS = '7,8';
  try {
    assert.deepEqual(getSuperAdminRoleIds(), [7, 8]);
    assert.equal(isSuperAdminRole(7), true);
    assert.equal(isSuperAdminRole(1), false);
    assert.equal(guard().canActivate(createContext(DemoController.prototype.adminOnly, 7)), true);
    assert.throws(
      () => guard().canActivate(createContext(DemoController.prototype.adminOnly, 1)),
      ForbiddenException,
    );
  } finally {
    process.env.SUPER_ADMIN_ROLE_IDS = '1';
  }
});

test('SUPER_ADMIN_ROLE_IDS 非法值时回退到默认值 1', () => {
  process.env.SUPER_ADMIN_ROLE_IDS = 'abc, -3';
  try {
    assert.deepEqual(getSuperAdminRoleIds(), [1]);
  } finally {
    process.env.SUPER_ADMIN_ROLE_IDS = '1';
  }
});
