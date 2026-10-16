import assert from 'node:assert/strict';
import test from 'node:test';
import { SubjectsService } from '../src/modules/subjects/subjects.service';

type PrismaMock = Record<string, unknown>;

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    pass: {
      findUnique: async () => null,
    },
    sourceMaterial: {
      findMany: async () => [],
    },
    ...overrides,
  };
}

function subjectRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    customsPassId: 2,
    partId: 7,
    sessionId: 9,
    subject: 3,
    sourceIds: '2,1',
    sort: 1,
    showIndex: '1 2',
    icon: null,
    audio: null,
    sentenceAudio: null,
    sceneGraph: 'https://cdn.test/scene.png',
    createdAt: new Date('2026-04-10T08:00:00.000Z'),
    updatedAt: new Date('2026-04-10T08:00:00.000Z'),
    ...overrides,
  };
}

test('SubjectsService.listSubjects 拼装跨两层 join 的展示字段', async () => {
  const prisma = createPrismaMock({
    subject: {
      count: async () => 2,
      findMany: async () => [
        subjectRow({
          customPass: {
            id: 2,
            title: '小关卡 A',
            partsId: 7,
            part: { id: 7, title: 'Part 1', tips: 'Part 描述', unitsId: 4, unit: { id: 4, text: 'Unit 1' } },
          },
        }),
        subjectRow({
          id: 6,
          customsPassId: 8,
          // Pass.partsId = NULL：小关卡行，part / unit 都不存在
          customPass: { id: 8, title: '小关卡 B', partsId: null, part: null },
        }),
      ],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SubjectsService(prisma as never);
  const result = await service.listSubjects({ pageNum: 1, pageSize: 10 });

  assert.equal(result.code, 0);
  assert.equal(result.data.totalCount, 2);
  assert.equal(result.data.totalPages, 1);
  assert.equal(result.data.pageNum, 1);
  assert.equal(result.data.pageSize, 10);
  assert.equal(result.data.data.length, 2);

  const first = result.data.data[0];
  assert.equal(first.unitsName, 'Unit 1');
  assert.equal(first.partsTitle, 'Part 1');
  assert.equal(first.partsTips, 'Part 描述');
  assert.equal(first.customsPassName, '小关卡 A');
  assert.equal(first.customsPassId, 2);
  assert.equal(first.sceneGraph, 'https://cdn.test/scene.png');
  assert.equal(first.createdAt, '2026-04-10T08:00:00.000Z');

  const second = result.data.data[1];
  // partsId 为 NULL 时这几个 join 字段返回空串
  assert.equal(second.unitsName, '');
  assert.equal(second.partsTitle, '');
  assert.equal(second.partsTips, '');
  assert.equal(second.customsPassName, '小关卡 B');
});

test('SubjectsService.listSubjects 把筛选条件传给 count 与 findMany', async () => {
  const seen: { count?: unknown; findMany?: unknown } = {};
  const prisma = createPrismaMock({
    subject: {
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

  const service = new SubjectsService(prisma as never);
  await service.listSubjects({
    startTime: '2026-04-01',
    endTime: '2026-04-30',
    customsPassId: '7',
    customsPassName: '关卡',
    sourceIds: 'apple',
    pageNum: 2,
    pageSize: 20,
  });

  const expectedWhere = {
    createdAt: { gte: new Date('2026-04-01'), lte: new Date('2026-04-30') },
    customsPassId: 7,
    customPass: { title: { contains: '关卡' } },
    sourceIds: { contains: 'apple' },
  };
  assert.deepEqual((seen.count as { where: unknown }).where, expectedWhere);
  const findManyArgs = seen.findMany as { where: unknown; skip: number; take: number };
  assert.deepEqual(findManyArgs.where, expectedWhere);
  assert.equal(findManyArgs.skip, 20);
  assert.equal(findManyArgs.take, 20);
});

test('SubjectsService.getSubjectDetail 返回单个对象并拼装 sourceVOS', async () => {
  const prisma = createPrismaMock({
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => subjectRow({ sourceIds: '2,1' }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    sourceMaterial: {
      // 故意打乱顺序，验证按 sourceIds 顺序输出
      findMany: async () => [
        { id: 1, text: 'apple', icon: null, audio: 'a.mp3' },
        { id: 2, text: 'banana', icon: 'b.png', audio: null },
      ],
    },
  });

  const service = new SubjectsService(prisma as never);
  const result = await service.getSubjectDetail(5);

  assert.equal(result.code, 0);
  assert.equal(Array.isArray(result.data), false);
  const detail = result.data as Record<string, unknown>;
  assert.equal(detail.id, 5);
  assert.equal(detail.sourceIds, '2,1');
  // 字符串 'null' 原样透传，读取时不做假设
  assert.equal(detail.sceneGraph, 'https://cdn.test/scene.png');
  assert.deepEqual(detail.sourceVOS, [
    { id: 2, text: 'banana', icon: 'b.png', audio: '' },
    { id: 1, text: 'apple', icon: '', audio: 'a.mp3' },
  ]);
});

test('SubjectsService.getSubjectDetail 对正文型 sourceIds 不误当素材 id', async () => {
  let queried = false;
  const prisma = createPrismaMock({
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => subjectRow({ sourceIds: '有 3 个苹果', sceneGraph: 'null' }),
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    sourceMaterial: {
      findMany: async () => {
        queried = true;
        return [];
      },
    },
  });

  const service = new SubjectsService(prisma as never);
  const result = await service.getSubjectDetail(5);

  const detail = result.data as Record<string, unknown>;
  assert.deepEqual(detail.sourceVOS, []);
  assert.equal(queried, false);
  assert.equal(detail.sceneGraph, 'null');
});

test('SubjectsService.getSubjectDetail 对不存在的题目报错', async () => {
  const prisma = createPrismaMock();
  const service = new SubjectsService(prisma as never);

  await assert.rejects(() => service.getSubjectDetail(123), /题目不存在/);
});

test('SubjectsService.updateSubject 只更新实际传入的字段', async () => {
  const updates: Record<string, unknown>[] = [];
  const prisma = createPrismaMock({
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => ({ id: 5 }),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updates.push(args.data);
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
    pass: {
      findUnique: async () => ({ id: 9 }),
    },
  });

  const service = new SubjectsService(prisma as never);

  await service.updateSubject({ id: 5, sort: 2 });
  assert.deepEqual(updates[0], { sort: 2 });

  await service.updateSubject({ id: 5, sourceIds: 'apple' });
  assert.deepEqual(updates[1], { sourceIds: 'apple' });

  await service.updateSubject({ id: 5, customsPassId: 9 });
  assert.deepEqual(updates[2], { customsPassId: 9 });

  // customsPassName 是 join 出来的展示别名，不落库，也不该产生任何列更新
  await service.updateSubject({ id: 5, customsPassName: '改个名' });
  assert.deepEqual(updates[3], {});
});

test('SubjectsService.updateSubject 校验题目与关卡是否存在', async () => {
  const prisma = createPrismaMock();
  const service = new SubjectsService(prisma as never);

  await assert.rejects(() => service.updateSubject({ id: 5, sort: 1 }), /题目不存在/);
});

test('SubjectsService.createSubject 落库 showIndex / 上下文透传字段与场景图', async () => {
  const created: Record<string, unknown>[] = [];
  const prisma = createPrismaMock({
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async (args: { data: Record<string, unknown> }) => {
        created.push(args.data);
        return {};
      },
      update: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
    },
    pass: {
      findUnique: async () => ({ id: 2 }),
    },
  });

  const service = new SubjectsService(prisma as never);

  const result = await service.createSubject({
    customsPassId: 2,
    partId: 7,
    sessionId: 9,
    sourceIds: ' apple ',
    sort: 3,
    showIndex: ['1', '2'],
    subject: 4,
    icon: '',
    sceneGraph: '',
  });

  assert.equal(result.code, 0);
  assert.equal(result.message, '题目创建成功');
  assert.deepEqual(created[0], {
    customsPassId: 2,
    partId: 7,
    sessionId: 9,
    subject: 4,
    sourceIds: 'apple',
    sort: 3,
    showIndex: '1 2',
    icon: '',
    audio: '',
    sentenceAudio: '',
    sceneGraph: null,
  });

  // 显式传字符串 'null' 也写成真正的 NULL
  await service.createSubject({ customsPassId: 2, sourceIds: 'apple', sceneGraph: 'null' });
  assert.equal(created[1].sceneGraph, null);
});

test('SubjectsService.createSubject 拒绝不存在的关卡与空内容', async () => {
  const prisma = createPrismaMock();
  const service = new SubjectsService(prisma as never);

  await assert.rejects(
    () => service.createSubject({ customsPassId: 99, sourceIds: 'apple' }),
    /关卡不存在/,
  );

  const withPass = createPrismaMock({ pass: { findUnique: async () => ({ id: 2 }) } });
  await assert.rejects(
    () => new SubjectsService(withPass as never).createSubject({ customsPassId: 2, sourceIds: '  ' }),
    /题目内容不能为空/,
  );
});

test('SubjectsService.deleteSubject 对不存在的题目报错', async () => {
  const prisma = createPrismaMock();
  const service = new SubjectsService(prisma as never);

  await assert.rejects(() => service.deleteSubject(123), /题目不存在/);
});

test('SubjectsService.deleteSubjects 用裸数组做批量删除', async () => {
  const seen: { where?: unknown }[] = [];
  const prisma = createPrismaMock({
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      deleteMany: async (args: { where: unknown }) => {
        seen.push(args);
        return { count: 2 };
      },
    },
  });

  const service = new SubjectsService(prisma as never);
  const result = await service.deleteSubjects([3, 1, 3, Number.NaN as unknown as number]);

  assert.equal(result.code, 0);
  assert.equal(result.message, '题目批量删除成功');
  assert.deepEqual(seen[0].where, { id: { in: [3, 1] } });
});

test('SubjectsService.deleteSubjects 拒绝空数组', async () => {
  const prisma = createPrismaMock();
  const service = new SubjectsService(prisma as never);

  await assert.rejects(() => service.deleteSubjects([]), /缺少题目 ID/);
  await assert.rejects(() => service.deleteSubjects(undefined), /缺少题目 ID/);
});

test('SubjectsService 场景图三个操作只改 sceneGraph', async () => {
  const updates: Record<string, unknown>[] = [];
  const prisma = createPrismaMock({
    subject: {
      count: async () => 0,
      findMany: async () => [],
      findUnique: async (args: { where: { id: number } }) => (args.where.id === 5 ? { id: 5 } : null),
      create: async () => ({}),
      update: async (args: { data: Record<string, unknown> }) => {
        updates.push(args.data);
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  });

  const service = new SubjectsService(prisma as never);

  const created = await service.createScenePic({ id: 5, scenePic: 'https://cdn.test/new.png' });
  assert.equal(created.message, '场景图创建成功');
  assert.deepEqual(updates[0], { sceneGraph: 'https://cdn.test/new.png' });

  const updated = await service.updateScenePic({ id: 5, scenePic: 'https://cdn.test/next.png' });
  assert.equal(updated.message, '场景图更新成功');
  assert.deepEqual(updates[1], { sceneGraph: 'https://cdn.test/next.png' });

  const removed = await service.deleteScenePic(5);
  assert.equal(removed.message, '场景图删除成功');
  // 删除写入真正的 NULL，而不是字符串 'null'
  assert.deepEqual(updates[2], { sceneGraph: null });

  await assert.rejects(() => service.createScenePic({ id: 99, scenePic: 'x' }), /题目不存在/);
});
