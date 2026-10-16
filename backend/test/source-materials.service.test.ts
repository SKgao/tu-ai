import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { SourceMaterialsService } from '../src/modules/source-materials/source-materials.service';

type PrismaMock = Record<string, unknown>;

/** 外部依赖相关的环境变量，测试前一律清空，保证「未配置」分支可复现。 */
const EXTERNAL_ENV_KEYS = [
  'SEND2LINE_BASE_URL',
  'SOURCE_AUDIO_DOWNLOAD_BASE_URL',
  'SUBJECT_SOURCE_IMPORT_BASE_URL',
];

beforeEach(() => {
  EXTERNAL_ENV_KEYS.forEach((key) => {
    delete process.env[key];
  });
});

afterEach(() => {
  EXTERNAL_ENV_KEYS.forEach((key) => {
    delete process.env[key];
  });
});

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    sourceMaterial: {
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

function createMaterialRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 11,
    textbookId: 3,
    text: 'apple',
    icon: null,
    audio: null,
    translation: null,
    explainsArray: null,
    createdAt: new Date('2026-04-10T08:00:00.000Z'),
    updatedAt: new Date('2026-04-10T08:00:00.000Z'),
    ...overrides,
  };
}

test('SourceMaterialsService.listSourceMaterials 返回分页结构并回传 textbookId', async () => {
  const seen: { findMany?: { skip: number; take: number; where: unknown } } = {};
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async () => 21,
      findMany: async (args: { skip: number; take: number; where: unknown }) => {
        seen.findMany = args;
        return [createMaterialRow()];
      },
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  const result = await service.listSourceMaterials({ pageNum: 2, pageSize: 10 });

  assert.equal(result.code, 0);
  assert.equal(result.data.totalCount, 21);
  assert.equal(result.data.totalPages, 3);
  assert.equal(result.data.pageNum, 2);
  assert.equal(result.data.pageSize, 10);
  assert.equal(result.data.data.length, 1);

  // skip 按 pageNum/pageSize 计算
  assert.equal(seen.findMany?.skip, 10);
  assert.equal(seen.findMany?.take, 10);

  const row = result.data.data[0];
  // 列表必须回传 textbookId，否则编辑弹窗的教材下拉为空
  assert.equal(row.textbookId, 3);
  assert.equal(row.text, 'apple');
  // 可空列统一兜底为空串
  assert.equal(row.icon, '');
  assert.equal(row.audio, '');
  assert.equal(row.translation, '');
  assert.equal(row.explainsArray, '');
  assert.equal(row.createdAt, '2026-04-10T08:00:00.000Z');
});

test('SourceMaterialsService.listSourceMaterials 缺省 openLike 走模糊（contains）', async () => {
  const seen: { where?: unknown } = {};
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async (args: { where: unknown }) => {
        seen.where = args.where;
        return 0;
      },
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  await service.listSourceMaterials({ text: 'app' });

  // 前端模糊搜索时 compactPayload 会剔除 openLike，所以「不传」必须等于模糊
  assert.deepEqual(seen.where, { text: { contains: 'app' } });
});

test('SourceMaterialsService.listSourceMaterials openLike 为空串时仍是模糊', async () => {
  const seen: { where?: unknown } = {};
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async (args: { where: unknown }) => {
        seen.where = args.where;
        return 0;
      },
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  await service.listSourceMaterials({ text: 'app', openLike: '' });

  assert.deepEqual(seen.where, { text: { contains: 'app' } });
});

test('SourceMaterialsService.listSourceMaterials openLike=1 走精确匹配', async () => {
  const seen: { where?: unknown } = {};
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async (args: { where: unknown }) => {
        seen.where = args.where;
        return 0;
      },
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  await service.listSourceMaterials({ text: 'app', openLike: 1 });

  assert.deepEqual(seen.where, { text: 'app' });
});

test('SourceMaterialsService.listSourceMaterials 支持时间筛选且不受 textbookId 影响', async () => {
  const seen: { where?: Record<string, unknown> } = {};
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async () => 0,
      findMany: async (args: { where: Record<string, unknown> }) => {
        seen.where = args.where;
        return [];
      },
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  await service.listSourceMaterials({
    startTime: '2026-04-01T00:00:00.000Z',
    endTime: '2026-04-30T23:59:59.000Z',
    // 非契约字段：即使被传入也不应该变成筛选条件（素材是跨教材的全局库）
    textbookId: 9,
  } as never);

  assert.deepEqual(seen.where?.createdAt, {
    gte: new Date('2026-04-01T00:00:00.000Z'),
    lte: new Date('2026-04-30T23:59:59.000Z'),
  });
  assert.equal('textbookId' in (seen.where || {}), false);
});

test('SourceMaterialsService.createSourceMaterial 拒绝不存在的教材', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(
    () => service.createSourceMaterial({ text: 'apple', textbookId: 99 }),
    /教材不存在/,
  );
});

test('SourceMaterialsService.createSourceMaterial 写入默认空串并 trim 文本', async () => {
  let created: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    sourceMaterial: {
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

  const service = new SourceMaterialsService(prisma as never);
  const result = await service.createSourceMaterial({ text: ' apple ', textbookId: 3 });

  assert.equal(result.code, 0);
  assert.equal(result.message, '素材创建成功');
  const data = created as unknown as Record<string, unknown>;
  assert.equal(data.text, 'apple');
  assert.equal(data.textbookId, 3);
  assert.equal(data.icon, '');
  assert.equal(data.audio, '');
  assert.equal(data.translation, '');
  assert.equal(data.explainsArray, '');
});

test('SourceMaterialsService.createSourceMaterial 缺少素材内容时直接报错', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(
    () => service.createSourceMaterial({ text: '   ', textbookId: 3 }),
    /素材内容不能为空/,
  );
});

test('SourceMaterialsService.updateSourceMaterial 只更新传入字段且不写 textbookId', async () => {
  let updated: Record<string, unknown> | null = null;
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 11 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updated = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  const result = await service.updateSourceMaterial({
    id: 11,
    text: ' banana ',
    icon: '',
    // 非契约字段：whitelist 会剥掉它，服务层也绝不会写入
    textbookId: 42,
  } as never);

  assert.equal(result.message, '素材更新成功');
  const data = updated as unknown as Record<string, unknown>;
  assert.equal(data.text, 'banana');
  assert.equal(data.icon, '');
  assert.equal('textbookId' in data, false);
  assert.equal('audio' in data, false);
});

test('SourceMaterialsService.updateSourceMaterial 对不存在的素材报错', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(() => service.updateSourceMaterial({ id: 404, text: 'x' }), /素材不存在/);
});

test('SourceMaterialsService.deleteSourceMaterial 删除不存在的素材时报错', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(() => service.deleteSourceMaterial(404), /素材不存在/);
});

test('SourceMaterialsService.deleteSourceMaterial 删除成功', async () => {
  let deletedWhere: unknown = null;
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 11 }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: { where: unknown }) => {
        deletedWhere = args.where;
        return { count: 1 };
      },
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  const result = await service.deleteSourceMaterial(11);

  assert.equal(result.message, '素材删除成功');
  assert.deepEqual(deletedWhere, { id: 11 });
});

test('SourceMaterialsService.batchDeleteSourceMaterials 接受裸数组并归一化 id', async () => {
  let deletedWhere: unknown = null;
  const prisma = createPrismaMock({
    sourceMaterial: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: { where: unknown }) => {
        deletedWhere = args.where;
        return { count: 2 };
      },
    },
  });

  const service = new SourceMaterialsService(prisma as never);
  const result = await service.batchDeleteSourceMaterials(['1', '2'] as unknown as number[]);

  assert.equal(result.code, 0);
  assert.equal(result.deletedCount, 2);
  assert.deepEqual(deletedWhere, { id: { in: [1, 2] } });
});

test('SourceMaterialsService.batchDeleteSourceMaterials 拒绝空数组', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(() => service.batchDeleteSourceMaterials([]), /请选择要删除的素材/);
});

test('SourceMaterialsService.syncSourceMaterialsToLine 未配置 SEND2LINE_BASE_URL 时报错', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(
    () => service.syncSourceMaterialsToLine([1, 2]),
    /未配置 SEND2LINE_BASE_URL，无法同步/,
  );
});

test('SourceMaterialsService.batchDownloadSourceMaterialAudio 未配置地址时报错', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(
    () => service.batchDownloadSourceMaterialAudio([1]),
    /未配置 SOURCE_AUDIO_DOWNLOAD_BASE_URL，无法批量下载音频/,
  );
});

test('SourceMaterialsService.importSubjectSources 未配置地址时报错', async () => {
  const prisma = createPrismaMock({
    course: {
      findUnique: async () => ({ textbookId: 3 }),
    },
  });
  const service = new SourceMaterialsService(prisma as never);

  await assert.rejects(
    () =>
      service.importSubjectSources({
        textbookId: 3,
        audioArray: ['a.mp3'],
        imageArray: ['a.png'],
        sentensArray: ['s.mp3'],
      }),
    /未配置 SUBJECT_SOURCE_IMPORT_BASE_URL，无法导入题目素材/,
  );
});

test('SourceMaterialsService.importSubjectSources 缺少教材时报错', async () => {
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(() => service.importSubjectSources({} as never), /请选择教材/);
});

test('SourceMaterialsService 外部依赖已配置时不会静默假装成功', async () => {
  process.env.SEND2LINE_BASE_URL = 'http://example.invalid';
  const service = new SourceMaterialsService(createPrismaMock() as never);

  await assert.rejects(() => service.syncSourceMaterialsToLine([1]), /外部服务的调用协议不在本仓库内/);
});
