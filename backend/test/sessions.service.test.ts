import assert from 'node:assert/strict';
import test from 'node:test';
import { SessionsService } from '../src/modules/sessions/sessions.service';

type PrismaMock = Record<string, unknown>;

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    session: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    sessionCustomPass: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    course: {
      findUnique: async () => null,
    },
    pass: {
      findUnique: async () => null,
    },
    ...overrides,
  };
}

const SESSION_ROW = {
  id: 11,
  textbookId: 3,
  title: '大关卡一',
  icon: null,
  sort: 0,
  status: 1,
  createdAt: new Date('2026-04-10T08:00:00.000Z'),
  updatedAt: new Date('2026-04-11T08:00:00.000Z'),
};

test('SessionsService.listSessions 返回裸数组并序列化字段', async () => {
  let seen: unknown = null;
  const prisma = createPrismaMock({
    session: {
      findMany: async (args: unknown) => {
        seen = args;
        return [SESSION_ROW];
      },
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.listSessions(3);

  assert.equal(result.code, 0);
  // 契约要求裸数组：data 本身是数组，而不是 { data, totalCount } 分页结构
  assert.ok(Array.isArray(result.data));
  assert.equal(result.data.length, 1);
  assert.equal((result.data as unknown as Record<string, unknown>).totalCount, undefined);

  const row = result.data[0];
  assert.equal(row.id, 11);
  assert.equal(row.title, '大关卡一');
  // 数据库中的 null 需要回退为空字符串
  assert.equal(row.icon, '');
  assert.equal(row.status, 1);
  assert.equal(row.sort, 0);
  assert.equal(row.createdAt, '2026-04-10T08:00:00.000Z');

  const args = seen as { where: unknown; orderBy: unknown };
  assert.deepEqual(args.where, { textbookId: 3 });
  assert.deepEqual(args.orderBy, [{ sort: 'asc' }, { id: 'asc' }]);
});

test('SessionsService.createSession 拒绝不存在的教材', async () => {
  const prisma = createPrismaMock();
  const service = new SessionsService(prisma as never);

  await assert.rejects(
    () => service.createSession({ id: 11, textbookId: 99, title: '大关卡一' }),
    /教材不存在/,
  );
});

test('SessionsService.createSession 拒绝已存在的大关卡 ID', async () => {
  const prisma = createPrismaMock({
    course: { findUnique: async () => ({ textbookId: 3 }) },
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });
  const service = new SessionsService(prisma as never);

  await assert.rejects(
    () => service.createSession({ id: 11, textbookId: 3, title: '大关卡一' }),
    /大关卡 ID 已存在/,
  );
});

test('SessionsService.createSession 使用默认图标/排序/启用状态', async () => {
  let created: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    course: { findUnique: async () => ({ textbookId: 3 }) },
    session: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        created = args.data;
        return {};
      },
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.createSession({ id: 11, textbookId: 3, title: ' 大关卡一 ' });

  assert.equal(result.code, 0);
  assert.equal(result.message, '大关卡创建成功');
  const data = created as unknown as Record<string, unknown>;
  assert.equal(data.id, 11);
  assert.equal(data.textbookId, 3);
  assert.equal(data.title, '大关卡一');
  assert.equal(data.icon, '');
  assert.equal(data.sort, 0);
  assert.equal(data.status, 1);
});

test('SessionsService.updateSession 对不存在的大关卡报错', async () => {
  const prisma = createPrismaMock();
  const service = new SessionsService(prisma as never);

  await assert.rejects(
    () => service.updateSession({ id: 11, textbookId: 3, title: '大关卡一' }),
    /大关卡不存在/,
  );
});

test('SessionsService.updateSession 写入标题图标排序与教材', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    course: { findUnique: async () => ({ textbookId: 3 }) },
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 3 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.updateSession({
    id: 11,
    textbookId: 3,
    title: '新标题',
    icon: 'icon.png',
    sort: 4,
  });

  assert.equal(result.message, '大关卡更新成功');
  assert.deepEqual(updated, {
    textbookId: 3,
    title: '新标题',
    icon: 'icon.png',
    sort: 4,
  });
});

test('SessionsService.deleteSession 对不存在的大关卡报错', async () => {
  const prisma = createPrismaMock();
  const service = new SessionsService(prisma as never);

  await assert.rejects(() => service.deleteSession(11), /大关卡不存在/);
});

test('SessionsService.deleteSession 先删绑定行再删大关卡', async () => {
  const deletedBindings: unknown[] = [];
  const deletedSessions: unknown[] = [];
  const prisma = createPrismaMock({
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 3 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: unknown) => {
        deletedSessions.push(args);
        return { count: 1 };
      },
    },
    sessionCustomPass: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: unknown) => {
        deletedBindings.push(args);
        return { count: 2 };
      },
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.deleteSession(11);

  assert.equal(result.message, '大关卡删除成功');
  assert.deepEqual(deletedBindings, [{ where: { sessionId: 11 } }]);
  assert.deepEqual(deletedSessions, [{ where: { id: 11 } }]);
});

test('SessionsService.changeStatus 只改 status 并返回对应提示', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 3 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);

  const disabled = await service.changeStatus({ id: 11, status: 2 });
  assert.equal(disabled.message, '大关卡已禁用');
  assert.deepEqual(updated, { status: 2 });

  const enabled = await service.changeStatus({ id: 11, status: 1 });
  assert.equal(enabled.message, '大关卡已启用');
  assert.deepEqual(updated, { status: 1 });
});

test('SessionsService.changeStatus 拒绝非 1/2 的状态值', async () => {
  const prisma = createPrismaMock();
  const service = new SessionsService(prisma as never);

  await assert.rejects(() => service.changeStatus({ id: 11, status: 9 }), /状态值只能为/);
});

test('SessionsService.bindCustomPass 成功写入绑定行（sort 默认 0）', async () => {
  let created: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 3 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    pass: { findUnique: async () => ({ id: 22 }) },
    sessionCustomPass: {
      findMany: async () => [],
      // 未绑定过 → 唯一键查询为空
      findUnique: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        created = args.data;
        return {};
      },
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.bindCustomPass({ textbookId: 3, sessionId: 11, customPassId: 22 });

  assert.equal(result.code, 0);
  assert.equal(result.message, '小关卡绑定成功');
  const data = created as unknown as Record<string, unknown>;
  assert.deepEqual(data, { sessionId: 11, customPassId: 22, sort: 0 });
});

test('SessionsService.bindCustomPass 重复绑定时明确报错（非幂等静默）', async () => {
  const prisma = createPrismaMock({
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 3 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    pass: { findUnique: async () => ({ id: 22 }) },
    sessionCustomPass: {
      findMany: async () => [],
      findUnique: async () => ({ id: 33 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);

  await assert.rejects(
    () => service.bindCustomPass({ textbookId: 3, sessionId: 11, customPassId: 22 }),
    /请勿重复绑定/,
  );
});

test('SessionsService.bindCustomPass 校验大关卡归属教材与小关卡存在性', async () => {
  const otherTextbook = createPrismaMock({
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 4 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });
  await assert.rejects(
    () => new SessionsService(otherTextbook as never).bindCustomPass({
      textbookId: 3,
      sessionId: 11,
      customPassId: 22,
    }),
    /大关卡不属于该教材/,
  );

  const missingPass = createPrismaMock({
    session: {
      findMany: async () => [],
      findUnique: async () => ({ id: 11, textbookId: 3 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    pass: { findUnique: async () => null },
  });
  await assert.rejects(
    () => new SessionsService(missingPass as never).bindCustomPass({
      textbookId: 3,
      sessionId: 11,
      customPassId: 22,
    }),
    /小关卡不存在/,
  );
});

test('SessionsService.listCustomPasses 返回裸数组并映射绑定行 id 与小关卡标题', async () => {
  let seen: unknown = null;
  const prisma = createPrismaMock({
    sessionCustomPass: {
      findMany: async (args: unknown) => {
        seen = args;
        return [
          {
            id: 33,
            sessionId: 11,
            customPassId: 22,
            sort: 1,
            createdAt: new Date('2026-04-10T08:00:00.000Z'),
            updatedAt: new Date('2026-04-10T08:00:00.000Z'),
            customPass: { id: 22, title: '小关卡一', icon: null },
          },
        ];
      },
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.listCustomPasses({ textbookId: 3, sessionId: 11 });

  assert.ok(Array.isArray(result.data));
  const row = result.data[0];
  // id 是绑定行 id，不是小关卡 id
  assert.equal(row.id, 33);
  assert.equal(row.customPassId, 22);
  assert.equal(row.customTitle, '小关卡一');
  assert.equal(row.title, '小关卡一');
  assert.equal(row.icon, '');
  assert.equal(row.sort, 1);

  const args = seen as { where: unknown; orderBy: unknown };
  assert.deepEqual(args.where, { sessionId: 11, session: { textbookId: 3 } });
  assert.deepEqual(args.orderBy, [{ sort: 'asc' }, { id: 'asc' }]);
});

test('SessionsService.unbindCustomPass 对不存在的绑定行报错，成功时删除绑定行', async () => {
  const notFound = createPrismaMock();
  await assert.rejects(
    () => new SessionsService(notFound as never).unbindCustomPass(33),
    /绑定关系不存在/,
  );

  const deleted: unknown[] = [];
  const prisma = createPrismaMock({
    sessionCustomPass: {
      findMany: async () => [],
      findUnique: async () => ({ id: 33 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: unknown) => {
        deleted.push(args);
        return { count: 1 };
      },
    },
  });

  const result = await new SessionsService(prisma as never).unbindCustomPass(33);

  assert.equal(result.message, '小关卡解绑成功');
  assert.deepEqual(deleted, [{ where: { id: 33 } }]);
});

test('SessionsService.changeCustomPassSort 只改绑定行 sort', async () => {
  const notFound = createPrismaMock();
  await assert.rejects(
    () => new SessionsService(notFound as never).changeCustomPassSort({ id: 33, sort: 5 }),
    /绑定关系不存在/,
  );

  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    sessionCustomPass: {
      findMany: async () => [],
      findUnique: async () => ({ id: 33 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SessionsService(prisma as never);
  const result = await service.changeCustomPassSort({ id: 33, sort: 5 });

  assert.equal(result.message, '小关卡排序更新成功');
  assert.deepEqual(updated, { sort: 5 });
});
