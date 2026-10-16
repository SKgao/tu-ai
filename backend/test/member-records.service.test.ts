import assert from 'node:assert/strict';
import test from 'node:test';
import { MemberRecordsController } from '../src/modules/members/member-records.controller';
import { MemberRecordsService } from '../src/modules/members/member-records.service';

type PrismaMock = Record<string, unknown>;

type FindManyArgs = {
  where?: unknown;
  include?: unknown;
  orderBy?: unknown;
  skip?: number;
  take?: number;
};

function createPrismaMock(overrides: PrismaMock = {}): PrismaMock {
  return {
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    memberInvite: {
      findMany: async () => [],
    },
    learningRecord: {
      count: async () => 0,
      findMany: async () => [],
    },
    member: {
      findUnique: async () => null,
    },
    ...overrides,
  };
}

test('MemberRecordsService.listInvites 先用 tutuNumber 换出 Member.id，再查邀请明细', async () => {
  const seenMemberWhere: unknown[] = [];
  const seenInviteArgs: FindManyArgs = {};
  const prisma = createPrismaMock({
    member: {
      findUnique: async (args: { where: unknown }) => {
        seenMemberWhere.push(args.where);
        // 只有 tutuNumber=1001 能查到；若实现误用 Member.id 则查不到。
        return args.where && (args.where as { tutuNumber?: number }).tutuNumber === 1001
          ? { id: 77 }
          : null;
      },
    },
    memberInvite: {
      findMany: async (args: FindManyArgs) => {
        seenInviteArgs.where = args.where;
        seenInviteArgs.orderBy = args.orderBy;
        return [
          {
            id: 5,
            inviterId: 77,
            inviteeId: 88,
            createdAt: new Date('2026-04-10T08:00:00.000Z'),
            invitee: {
              tutuNumber: 2002,
              realName: '被邀请人',
              icon: null,
              mobile: null,
            },
          },
        ];
      },
    },
  });

  const service = new MemberRecordsService(prisma as never);
  const result = await service.listInvites({ userId: 1001 });

  // 入参是 tutuNumber，所以 where 必须是 { tutuNumber: 1001 }
  assert.deepEqual(seenMemberWhere, [{ tutuNumber: 1001 }]);
  // 邀请关系按 inviterId = Member.id 查
  assert.deepEqual(seenInviteArgs.where, { inviterId: 77 });
  assert.deepEqual(seenInviteArgs.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);

  assert.equal(result.code, 0);
  // 前端读的是 envelope.data.data（invite-count/page.tsx:38）
  assert.equal(result.data.totalCount, 1);
  assert.deepEqual(result.data.data, [
    {
      tutuNumber: 2002,
      realName: '被邀请人',
      icon: '',
      mobile: '',
      inviteTime: '2026-04-10T08:00:00.000Z',
    },
  ]);
});

test('MemberRecordsService.listInvites 支持裸数字请求体归一后的 payload', async () => {
  const prisma = createPrismaMock({
    member: {
      findUnique: async (args: { where: { tutuNumber?: number } }) =>
        args.where.tutuNumber === 1001 ? { id: 77 } : null,
    },
    memberInvite: { findMany: async () => [] },
  });

  const service = new MemberRecordsService(prisma as never);
  // controller 用 normalizePrimitivePayload 把裸数字 1001 变成 { userId: 1001 }
  const result = await service.listInvites({ userId: '1001' });

  assert.deepEqual(result.data, { data: [], totalCount: 0 });
});

test('MemberRecordsService 对不存在的图图号报「会员不存在」而不是返回空列表', async () => {
  const service = new MemberRecordsService(createPrismaMock() as never);

  await assert.rejects(() => service.listInvites({ userId: 9999 }), /会员不存在/);
  await assert.rejects(
    () => service.listLearningRecords({ userId: 9999, pageNum: 1, pageSize: 10 }),
    /会员不存在/,
  );
});

test('MemberRecordsService 缺少图图号时直接报错', async () => {
  const service = new MemberRecordsService(createPrismaMock() as never);

  await assert.rejects(() => service.listInvites({}), /缺少图图号/);
  await assert.rejects(() => service.listLearningRecords({ pageNum: 1, pageSize: 10 }), /缺少图图号/);
});

test('MemberRecordsService.listLearningRecords 拼装 join 展示字段并分页', async () => {
  const seenArgs: FindManyArgs = {};
  const seenWhere: unknown[] = [];
  const prisma = createPrismaMock({
    member: {
      findUnique: async () => ({ id: 77 }),
    },
    learningRecord: {
      count: async (args: { where: unknown }) => {
        seenWhere.push(args.where);
        return 21;
      },
      findMany: async (args: FindManyArgs) => {
        seenArgs.where = args.where;
        seenArgs.skip = args.skip;
        seenArgs.take = args.take;
        seenArgs.include = args.include;
        return [
          {
            id: 1,
            memberId: 77,
            textbookId: 3,
            unitId: 4,
            partId: 5,
            sessionId: 6,
            createdAt: new Date('2026-04-01T02:00:00.000Z'),
            textbook: { textbookName: '人教版三年级上' },
            unit: { text: 'Unit 1' },
            part: { title: 'Part A' },
            session: { title: 'Session 1' },
          },
          {
            id: 2,
            memberId: 77,
            textbookId: null,
            unitId: null,
            partId: null,
            sessionId: null,
            createdAt: new Date('2026-03-31T02:00:00.000Z'),
            textbook: null,
            unit: null,
            part: null,
            session: null,
          },
        ];
      },
    },
  });

  const service = new MemberRecordsService(prisma as never);
  const result = await service.listLearningRecords({ userId: 1001, pageNum: 3, pageSize: 10 });

  assert.deepEqual(seenWhere, [{ memberId: 77 }]);
  assert.deepEqual(seenArgs.where, { memberId: 77 });
  assert.equal(seenArgs.skip, 20);
  assert.equal(seenArgs.take, 10);

  const include = seenArgs.include as Record<string, { select: Record<string, boolean> }>;
  assert.deepEqual(include.textbook, { select: { textbookName: true } });
  assert.deepEqual(include.unit, { select: { text: true } });
  assert.deepEqual(include.part, { select: { title: true } });
  assert.deepEqual(include.session, { select: { title: true } });

  assert.deepEqual(result.data.data, [
    {
      textbookName: '人教版三年级上',
      unitName: 'Unit 1',
      partName: 'Part A',
      sessionName: 'Session 1',
      createdAt: '2026-04-01T02:00:00.000Z',
    },
    {
      textbookName: '',
      unitName: '',
      partName: '',
      sessionName: '',
      createdAt: '2026-03-31T02:00:00.000Z',
    },
  ]);

  assert.equal(result.data.totalCount, 21);
  assert.equal(result.data.pageNum, 3);
  assert.equal(result.data.pageSize, 10);
  assert.equal(result.data.totalPages, 3);
  assert.equal(result.code, 0);
});

test('MemberRecordsController 把 member/invite/list 的裸数字请求体归一成 { userId }', async () => {
  const received: unknown[] = [];
  const controller = new MemberRecordsController({
    listInvites: async (payload: unknown) => {
      received.push(payload);
      return {};
    },
  } as never);

  await controller.listInvites(1001);
  await controller.listInvites('1001');
  await controller.listInvites({ userId: 1001 });

  assert.deepEqual(received, [{ userId: 1001 }, { userId: '1001' }, { userId: 1001 }]);
});

test('MemberRecordsService.listLearningRecords 缺省分页为 pageNum=1 / pageSize=10', async () => {
  const seenArgs: FindManyArgs = {};
  const prisma = createPrismaMock({
    member: {
      findUnique: async () => ({ id: 77 }),
    },
    learningRecord: {
      count: async () => 0,
      findMany: async (args: FindManyArgs) => {
        seenArgs.skip = args.skip;
        seenArgs.take = args.take;
        return [];
      },
    },
  });

  const service = new MemberRecordsService(prisma as never);
  const result = await service.listLearningRecords({ userId: 1001 });

  assert.equal(seenArgs.skip, 0);
  assert.equal(seenArgs.take, 10);
  assert.equal(result.data.pageNum, 1);
  assert.equal(result.data.pageSize, 10);
  // 空列表时 totalPages 至少为 1（与 members/units 既有实现保持一致）
  assert.equal(result.data.totalPages, 1);
});
