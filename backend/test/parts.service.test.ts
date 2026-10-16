import assert from 'node:assert/strict';
import test from 'node:test';
import { PartsService } from '../src/modules/parts/parts.service';

type PrismaMock = Record<string, unknown>;

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    part: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    unit: {
      findUnique: async () => null,
    },
    ...overrides,
  };
}

test('PartsService.listParts 把筛选参数 unitId 映射到列 unitsId', async () => {
  const seen: { where?: unknown; skip?: number; take?: number } = {};
  const prisma = createPrismaMock({
    part: {
      count: async () => 1,
      findMany: async (args: { where: unknown; skip: number; take: number }) => {
        seen.where = args.where;
        seen.skip = args.skip;
        seen.take = args.take;
        return [
          {
            id: 9,
            title: 'Part A',
            icon: null,
            tips: null,
            sort: 0,
            canLock: 1,
            unitsId: 4,
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

  const service = new PartsService(prisma as never);
  const result = await service.listParts({ unitId: 4, pageNum: 3, pageSize: 5 });

  assert.deepEqual(seen.where, { unitsId: 4 });
  assert.equal(seen.skip, 10);
  assert.equal(seen.take, 5);

  const row = result.data.data[0];
  assert.equal(row.unitsId, 4);
  assert.equal(row.tips, '');
  assert.equal(row.icon, '');
  assert.equal(result.data.totalPages, 1);
});

test('PartsService.createPart 拒绝不存在的单元', async () => {
  const service = new PartsService(createPrismaMock() as never);
  await assert.rejects(() => service.createPart({ title: 'Part A', unitsId: 77 }), /单元不存在/);
});

test('PartsService.updatePart 支持只传 id + canLock 的锁定切换（部分更新）', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    part: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 9 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new PartsService(prisma as never);
  await service.updatePart({ id: 9, canLock: 2 });

  // 只应更新 canLock，不能把未传字段覆盖成空值
  assert.deepEqual(updated, { canLock: 2 });
});

test('PartsService.updatePart 全量编辑时更新所有传入字段', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    part: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 9 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
    unit: {
      findUnique: async () => ({ id: 4 }),
    },
  });

  const service = new PartsService(prisma as never);
  await service.updatePart({
    id: 9,
    title: ' Part B ',
    icon: '',
    tips: ' 描述 ',
    sort: 3,
    unitsId: 4,
    canLock: 1,
  });

  assert.deepEqual(updated, {
    title: 'Part B',
    icon: '',
    tips: '描述',
    sort: 3,
    canLock: 1,
    unitsId: 4,
  });
});

test('PartsService.updatePart 对不存在的 Part 报错', async () => {
  const service = new PartsService(createPrismaMock() as never);
  await assert.rejects(() => service.updatePart({ id: 404, canLock: 2 }), /Part 不存在/);
});

test('PartsService.deletePart 对不存在的 Part 报错', async () => {
  const service = new PartsService(createPrismaMock() as never);
  await assert.rejects(() => service.deletePart(404), /Part 不存在/);
});
