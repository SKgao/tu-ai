import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../src/modules/auth/auth.service';
import { hashPassword } from '../src/common/password';

test('AuthService.login rejects missing credentials', async () => {
  const prisma = {
    user: {
      findFirst: async () => null,
      update: async () => null,
    },
  };

  const service = new AuthService(prisma as never);
  const result = await service.login({ account: '', password: '' });

  assert.equal(result.code, 1);
  assert.equal(result.message, '请输入用户名和密码');
});

test('AuthService.login returns token for a valid user', async () => {
  const passwordHash = await hashPassword('secret123');
  const user = {
    id: 7,
    account: 'admin',
    username: 'admin',
    avatar: '',
    roleId: 2,
    status: 1,
    passwordHash,
  };

  const prisma = {
    user: {
      findFirst: async () => user,
      update: async () => null,
    },
  };

  const service = new AuthService(prisma as never);
  const result = await service.login({ account: 'admin', password: 'secret123' });

  assert.equal(result.code, 0);
  assert.equal(typeof result.data.token, 'string');

  const payload = service.verifyToken(result.data.token);
  assert.equal(payload.sub, 7);
  assert.equal(payload.account, 'admin');
  assert.equal(payload.roleId, 2);
});
