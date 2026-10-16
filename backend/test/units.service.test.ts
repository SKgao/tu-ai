import assert from 'node:assert/strict';
import test from 'node:test';
import { UnitsService } from '../src/modules/units/units.service';

type PrismaMock = Record<string, unknown>;

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    unit: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    course: {
      findUnique: async () => null,
    },
    ...overrides,
  };
}

test('UnitsService.listUnits 返回分页结构并拼装教材名', async () => {
  const prisma = createPrismaMock({
    unit: {
      count: async () => 1,
      findMany: async () => [
        {
          id: 5,
          text: 'Unit 1',
          icon: null,
          sort: 0,
          canLock: 1,
          status: 1,
          textbookId: 3,
          createdAt: new Date('2026-04-10T08:00:00.000Z'),
          updatedAt: new Date('2026-04-10T08:00:00.000Z'),
          course: { textbookName: '三年级上册' },
        },
      ],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new UnitsService(prisma as never);
  const result = await service.listUnits({ pageNum: 1, pageSize: 10 });

  assert.equal(result.code, 0);
  assert.equal(result.data.totalCount, 1);
  assert.equal(result.data.pageNum, 1);
  assert.equal(result.data.pageSize, 10);
  assert.equal(result.data.totalPages, 1);
  assert.equal(result.data.data.length, 1);

  const row = result.data.data[0];
  // 数据库列名 textbookId 需要映射为接口字段 textBookId
  assert.equal(row.textBookId, 3);
  assert.equal(row.textBookName, '三年级上册');
  assert.equal(row.icon, '');
  assert.equal(row.createdAt, '2026-04-10T08:00:00.000Z');
});

test('UnitsService.listUnits 会把筛选条件传给 count 与 findMany', async () => {
  const seen: { count?: unknown; findMany?: unknown } = {};
  const prisma = createPrismaMock({
    unit: {
      count: async (args: unknown) => {
        seen.count = args;
        return 0;
      },
      findMany: async (args: unknown) => {
        seen.findMany = args;
        return [];
      },
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new UnitsService(prisma as never);
  await service.listUnits({ textBookId: 7, pageNum: 2, pageSize: 20 });

  assert.deepEqual((seen.count as { where: unknown }).where, { textbookId: 7 });
  const findManyArgs = seen.findMany as { where: unknown; skip: number; take: number };
  assert.deepEqual(findManyArgs.where, { textbookId: 7 });
  assert.equal(findManyArgs.skip, 20);
  assert.equal(findManyArgs.take, 20);
});

test('UnitsService.createUnit 拒绝不存在的教材', async () => {
  const prisma = createPrismaMock();
  const service = new UnitsService(prisma as never);

  await assert.rejects(
    () => service.createUnit({ text: 'Unit 1', textBookId: 99 }),
    /教材不存在/,
  );
});

test('UnitsService.createUnit 使用默认排序与解锁状态', async () => {
  let created: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    unit: {
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
    course: {
      findUnique: async () => ({ textbookId: 3 }),
    },
  });

  const service = new UnitsService(prisma as never);
  const result = await service.createUnit({ text: ' Unit 1 ', textBookId: 3 });

  assert.equal(result.code, 0);
  assert.equal(result.message, '单元创建成功');
  const data = created as unknown as Record<string, unknown>;
  assert.equal(data.text, 'Unit 1');
  assert.equal(data.icon, '');
  assert.equal(data.sort, 0);
  assert.equal(data.canLock, 1);
  assert.equal(data.textbookId, 3);
});

test('UnitsService.deleteUnit 对不存在的单元报错', async () => {
  const prisma = createPrismaMock();
  const service = new UnitsService(prisma as never);

  await assert.rejects(() => service.deleteUnit(123), /单元不存在/);
});

test('UnitsService.lockUnit 按 canLock 返回对应提示', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    unit: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 5 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new UnitsService(prisma as never);

  const locked = await service.lockUnit({ unitId: 5, canLock: 2 });
  assert.equal(locked.message, '单元已锁定');
  assert.deepEqual(updated, { canLock: 2 });

  const unlocked = await service.lockUnit({ unitId: 5, canLock: 1 });
  assert.equal(unlocked.message, '单元已解锁');
  assert.deepEqual(updated, { canLock: 1 });
});
