import assert from 'node:assert/strict';
import test from 'node:test';
import { PassesService } from '../src/modules/passes/passes.service';

type PrismaMock = Record<string, unknown>;

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    pass: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    part: { findUnique: async () => null },
    course: { findUnique: async () => null },
    subjectType: { findMany: async () => [] },
    ...overrides,
  };
}

test('PassesService.listPasses 带 partsId 时按 Part 过滤（关卡页）', async () => {
  const seen: { where?: unknown } = {};
  const prisma = createPrismaMock({
    pass: {
      count: async () => 1,
      findMany: async (args: { where: unknown }) => {
        seen.where = args.where;
        return [
          {
            id: 1,
            title: '关卡 A',
            tmpTitle: null,
            icon: null,
            sort: 0,
            partsId: 4,
            textbookId: null,
            subject: 2,
            customerNumber: 0,
            totalScore: 0,
            createdAt: new Date('2026-04-10T08:00:00.000Z'),
            updatedAt: new Date('2026-04-10T08:00:00.000Z'),
          },
        ];
      },
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new PassesService(prisma as never);
  const result = await service.listPasses({ partsId: 4, pageNum: 1, pageSize: 10 });

  assert.deepEqual(seen.where, { partsId: 4 });
  const row = result.data.data[0];
  assert.equal(row.partsId, 4);
  // textbookId 为 NULL 时以空串返回，前端表格不会显示 "null"
  assert.equal(row.textbookId, '');
  assert.equal(row.icon, '');
  assert.equal(result.data.totalCount, 1);
});

test('PassesService.listPasses 带 textbookId 时按教材过滤（小关卡页）', async () => {
  const seen: { where?: unknown } = {};
  const prisma = createPrismaMock({
    pass: {
      count: async () => 0,
      findMany: async (args: { where: unknown }) => {
        seen.where = args.where;
        return [];
      },
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new PassesService(prisma as never);
  await service.listPasses({ textbookId: 9 });

  assert.deepEqual(seen.where, { textbookId: 9 });
});

test('PassesService.listPasses 两个维度都缺失时明确报错，而不是猜一个', async () => {
  const service = new PassesService(createPrismaMock() as never);
  await assert.rejects(() => service.listPasses({}), /缺少 partsId 或 textbookId/);
});

test('PassesService.createPass 关卡：服务端自增，不带 id，要求题型', async () => {
  let created: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    pass: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        created = args.data;
        return {};
      },
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    part: { findUnique: async () => ({ id: 4 }) },
  });

  const service = new PassesService(prisma as never);
  const result = await service.createPass({ title: ' 关卡 A ', partsId: 4, subject: 2 });

  assert.equal(result.message, '关卡创建成功');
  const data = created as unknown as Record<string, unknown>;
  assert.equal(data.title, '关卡 A');
  assert.equal(data.partsId, 4);
  assert.equal(data.subject, 2);
  assert.equal(data.icon, '');
  assert.equal(data.sort, 0);
  // 关卡由服务端自增，不能带 id
  assert.equal('id' in data, false);
});

test('PassesService.createPass 关卡缺少题型时报错', async () => {
  const prisma = createPrismaMock({
    part: { findUnique: async () => ({ id: 4 }) },
  });
  const service = new PassesService(prisma as never);
  await assert.rejects(() => service.createPass({ title: '关卡 A', partsId: 4 }), /请选择题型/);
});

test('PassesService.createPass 小关卡：id 由客户端指定，带 tmpTitle', async () => {
  let created: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    pass: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        created = args.data;
        return {};
      },
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    course: { findUnique: async () => ({ textbookId: 9 }) },
  });

  const service = new PassesService(prisma as never);
  const result = await service.createPass({
    id: 501,
    title: '小关卡 A',
    tmpTitle: '过渡标题',
    textbookId: 9,
  });

  assert.equal(result.message, '小关卡创建成功');
  const data = created as unknown as Record<string, unknown>;
  assert.equal(data.id, 501);
  assert.equal(data.tmpTitle, '过渡标题');
  assert.equal(data.textbookId, 9);
});

test('PassesService.createPass 小关卡缺少 id 时报错', async () => {
  const prisma = createPrismaMock({
    course: { findUnique: async () => ({ textbookId: 9 }) },
  });
  const service = new PassesService(prisma as never);
  await assert.rejects(() => service.createPass({ title: '小关卡', textbookId: 9 }), /小关卡 ID/);
});

test('PassesService.createPass 小关卡 id 已存在时报错', async () => {
  const prisma = createPrismaMock({
    pass: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 501 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    course: { findUnique: async () => ({ textbookId: 9 }) },
  });
  const service = new PassesService(prisma as never);
  await assert.rejects(
    () => service.createPass({ id: 501, title: '小关卡', textbookId: 9 }),
    /小关卡 ID 已存在/,
  );
});

test('PassesService.createPass 同时传两个维度时报错（不猜）', async () => {
  const service = new PassesService(createPrismaMock() as never);
  await assert.rejects(
    () => service.createPass({ title: 'X', partsId: 1, textbookId: 2 }),
    /必须且只能指定/,
  );
});

test('PassesService.updatePass 只更新传入字段', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    pass: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 1 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new PassesService(prisma as never);
  await service.updatePass({ id: 1, sort: 5 });

  assert.deepEqual(updated, { sort: 5 });
});

test('PassesService.updatePass 对不存在的关卡报错', async () => {
  const service = new PassesService(createPrismaMock() as never);
  await assert.rejects(() => service.updatePass({ id: 404, title: 'x' }), /关卡不存在/);
});

test('PassesService.deletePassByQuery 走与路径删除相同的逻辑', async () => {
  const deleted: unknown[] = [];
  const prisma = createPrismaMock({
    pass: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 1 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: unknown) => {
        deleted.push(args);
        return { count: 1 };
      },
    },
  });

  const service = new PassesService(prisma as never);
  const result = await service.deletePassByQuery({ id: 1, textbookId: 9 });

  assert.equal(result.code, 0);
  assert.deepEqual(deleted, [{ where: { id: 1 } }]);
});

test('PassesService.listSubjectTypes 返回双层 data（前端读 response.data.data.data）', async () => {
  const prisma = createPrismaMock({
    subjectType: {
      findMany: async () => [
        { id: 1, name: '听力' },
        { id: 2, name: '口语' },
      ],
    },
  });

  const service = new PassesService(prisma as never);
  const result = await service.listSubjectTypes();

  assert.equal(result.code, 0);
  // 关键是 data.data 才是数组
  assert.deepEqual(result.data.data, [
    { id: 1, name: '听力' },
    { id: 2, name: '口语' },
  ]);
});
