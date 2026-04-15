import assert from 'node:assert/strict';
import test from 'node:test';
import { SpecialCoursesService } from '../src/modules/special-courses/special-courses.service';

test('SpecialCoursesService.listCourseUsers returns serialized course-user rows', async () => {
  const prisma = {
    order: {
      count: async () => 1,
      findMany: async () => [
        {
          id: 11,
          orderNo: 'COURSE_ORDER_1',
          memberId: 7,
          itemId: null,
          itemName: 'L1 Starter 精品启蒙班',
          orderAmount: 199900,
          payType: 3,
          orderStatus: 2,
          payTime: new Date('2026-04-10T08:00:00.000Z'),
          outNo: 'ADMIN_ORDER_1',
          cancelReason: null,
          activityId: null,
          textbookId: 101,
          createdAt: new Date('2026-04-10T07:00:00.000Z'),
          updatedAt: new Date('2026-04-10T08:00:00.000Z'),
          member: {
            id: 7,
            tutuNumber: 100001,
            mobile: '13900000001',
            realName: '朵朵',
            sex: 2,
          },
        },
      ],
    },
    specialCourse: {
      findMany: async () => [
        {
          textbookId: 101,
          textbookName: 'L1 Starter 精品启蒙班',
          teacher: 'Luna',
          status: 1,
          type: 1,
          saleBeginAt: new Date('2026-04-01T00:00:00.000Z'),
          saleEndAt: new Date('2026-04-20T00:00:00.000Z'),
          beginAt: new Date('2026-04-12T00:00:00.000Z'),
          endAt: new Date('2026-06-20T00:00:00.000Z'),
          orgAmt: 299900,
          amt: 199900,
          num: 24,
          chatNo: 'tutu-luna',
          iconDetail: '',
          iconTicket: '',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z'),
        },
      ],
    },
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
  };

  const service = new SpecialCoursesService(prisma as never);
  const result = await service.listCourseUsers({
    pageNum: 1,
    pageSize: 10,
  });

  assert.equal(result.code, 0);
  assert.equal(result.data.totalCount, 1);
  assert.deepEqual(result.data.data[0], {
    textbookId: 101,
    textbookName: 'L1 Starter 精品启蒙班',
    tutuNumber: 100001,
    mobile: '13900000001',
    realName: '朵朵',
    sex: 2,
    payAmt: 199900,
    buyAt: '2026-04-10 08:00:00',
    beginAt: '2026-04-12 00:00:00',
    endAt: '2026-06-20 00:00:00',
  });
});

test('SpecialCoursesService.createCourseUser creates a member and a paid order', async () => {
  let createdMember: Record<string, unknown> | undefined;
  let createdOrder: Record<string, unknown> | undefined;

  const tx = {
    member: {
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        createdMember = data;
        return {
          id: 88,
          ...data,
        };
      },
      update: async () => null,
    },
    order: {
      findFirst: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        createdOrder = data;
        return data;
      },
    },
  };

  const prisma = {
    specialCourse: {
      findUnique: async () => ({
        textbookId: 101,
        textbookName: 'L1 Starter 精品启蒙班',
        endAt: new Date('2026-06-20T00:00:00.000Z'),
        course: {
          bookVersion: {
            name: '图图英语启蒙版',
          },
        },
      }),
    },
    member: {
      findFirst: async () => ({
        tutuNumber: 100006,
      }),
    },
    $transaction: async <T>(callback: (client: typeof tx) => Promise<T>) => callback(tx),
  };

  const service = new SpecialCoursesService(prisma as never);
  const result = await service.createCourseUser({
    realName: '新用户',
    mobile: '13900000009',
    sex: 1,
    payAmt: 99900,
    textbookId: 101,
  });

  assert.equal(result.code, 0);
  assert.equal(createdMember?.tutuNumber, 100007);
  assert.equal(createdMember?.realName, '新用户');
  assert.equal(createdMember?.hasBuyTextbook, 1);
  assert.equal(createdMember?.bookVersionName, '图图英语启蒙版');
  assert.equal(createdMember?.textbookNamePractice, 'L1 Starter 精品启蒙班');
  assert.equal(createdOrder?.memberId, 88);
  assert.equal(createdOrder?.itemName, 'L1 Starter 精品启蒙班');
  assert.equal(createdOrder?.orderAmount, 99900);
  assert.equal(createdOrder?.payType, 3);
  assert.equal(createdOrder?.orderStatus, 2);
  assert.equal(createdOrder?.textbookId, 101);
});
