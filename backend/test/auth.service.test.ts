import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../src/modules/auth/auth.service';
import { hashPassword } from '../src/common/password';

// 测试不加载 .env，这里显式提供一个仅用于测试的密钥，
// 避免依赖开发者本机的 JWT_SECRET 配置。
process.env.JWT_SECRET = 'unit-test-secret-not-for-production-use';

type FakeUser = {
  id: number;
  account: string;
  username: string;
  avatar: string;
  roleId: number;
  status: number;
  tokenVersion: number;
  passwordHash: string;
};

/**
 * verifyToken 现在会回查数据库，所以 mock 必须提供 findUnique。
 * 传入同一个对象引用，方便测试中直接改字段来模拟“库里被改了”。
 */
function createPrisma(user: FakeUser | null) {
  const calls: { update: unknown[] } = { update: [] };

  return {
    calls,
    prisma: {
      user: {
        findFirst: async () => user,
        findUnique: async () => user,
        update: async (args: unknown) => {
          calls.update.push(args);
          return user;
        },
      },
    },
  };
}

async function buildUser(overrides: Partial<FakeUser> = {}): Promise<FakeUser> {
  return {
    id: 7,
    account: 'admin',
    username: 'admin',
    avatar: '',
    roleId: 2,
    status: 1,
    tokenVersion: 0,
    passwordHash: await hashPassword('secret123'),
    ...overrides,
  };
}

test('AuthService.login rejects missing credentials', async () => {
  const { prisma } = createPrisma(null);
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: '', password: '' });

  assert.equal(result.code, 1);
  assert.equal(result.message, '请输入用户名和密码');
});

test('AuthService.login returns token for a valid user', async () => {
  const user = await buildUser();
  const { prisma } = createPrisma(user);
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: 'admin', password: 'secret123' });

  assert.equal(result.code, 0);
  assert.equal(typeof result.data.token, 'string');

  const payload = await service.verifyToken(result.data.token);
  assert.equal(payload.sub, 7);
  assert.equal(payload.account, 'admin');
  assert.equal(payload.roleId, 2);
});

test('AuthService.verifyToken 拒绝伪造/损坏的 token', async () => {
  const user = await buildUser();
  const { prisma } = createPrisma(user);
  const service = new AuthService(prisma as never);

  await assert.rejects(() => service.verifyToken('not-a-jwt'), /登录已失效/);
});

test('AuthService.verifyToken 账号被禁用后立即失效', async () => {
  const user = await buildUser();
  const { prisma } = createPrisma(user);
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: 'admin', password: 'secret123' });
  const token = result.data.token;

  // 签发后把库里状态改成“禁用”，旧 token 必须立刻不可用
  user.status = 2;

  await assert.rejects(() => service.verifyToken(token), /账号已被禁用/);
});

test('AuthService.verifyToken 账号被删除后立即失效', async () => {
  const user = await buildUser();
  let current: FakeUser | null = user;
  const prisma = {
    user: {
      findFirst: async () => current,
      findUnique: async () => current,
      update: async () => current,
    },
  };
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: 'admin', password: 'secret123' });
  const token = result.data.token;

  current = null;

  await assert.rejects(() => service.verifyToken(token), /登录已失效/);
});

test('AuthService.verifyToken 角色以数据库为准（改角色立即生效）', async () => {
  const user = await buildUser({ roleId: 2 });
  const { prisma } = createPrisma(user);
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: 'admin', password: 'secret123' });
  const token = result.data.token;

  const before = await service.verifyToken(token);
  assert.equal(before.roleId, 2);

  // 只改库里的角色，token 里的 roleId 仍是 2
  user.roleId = 1;

  const after = await service.verifyToken(token);
  assert.equal(after.roleId, 1, '角色变更必须立即生效，不能沿用 token 里的旧值');
});

test('AuthService.logout 自增 tokenVersion 让旧 token 立即失效', async () => {
  const user = await buildUser();
  const { prisma, calls } = createPrisma(user);
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: 'admin', password: 'secret123' });
  const token = result.data.token;

  await service.logout(7);

  assert.deepEqual(calls.update[0], {
    where: { id: 7 },
    data: { tokenVersion: { increment: 1 } },
  });

  // 模拟数据库自增结果
  user.tokenVersion = 1;

  await assert.rejects(() => service.verifyToken(token), /登录已失效/);
});

test('AuthService.verifyToken 在 tokenVersion 不匹配时失效', async () => {
  const user = await buildUser({ tokenVersion: 3 });
  const { prisma } = createPrisma(user);
  const service = new AuthService(prisma as never);

  const result = await service.login({ account: 'admin', password: 'secret123' });
  const token = result.data.token;

  // 签发时 ver=3，之后又退出过一次
  user.tokenVersion = 4;

  await assert.rejects(() => service.verifyToken(token), /登录已失效/);
});
