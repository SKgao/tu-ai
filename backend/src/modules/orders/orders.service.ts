import { Injectable } from '@nestjs/common';
import { Activity, Course, Order, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type OrderListPayload = {
  tutuNumber?: number | string;
  orderNo?: string;
  itemId?: number | string;
  payType?: number | string;
  orderStatus?: number | string;
  activityId?: number | string;
  textbookId?: number | string;
  pageNum?: number | string;
  pageSize?: number | string;
};

type OrderListItem = Order & {
  member: {
    tutuNumber: number;
    realName: string;
  };
  activity?: Activity | null;
  course?: Course | null;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(payload: OrderListPayload = {}) {
    const pageNum = Math.max(1, this.parseOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, this.parseOptionalNumber(payload.pageSize) ?? 10);
    const where: Prisma.OrderWhereInput = {
      ...(this.parseOptionalNumber(payload.tutuNumber)
        ? {
            member: {
              tutuNumber: this.parseOptionalNumber(payload.tutuNumber),
            },
          }
        : {}),
      ...(this.optionalString(payload.orderNo)
        ? {
            orderNo: {
              contains: this.optionalString(payload.orderNo)!,
            },
          }
        : {}),
      ...(this.parseOptionalNumber(payload.itemId) !== undefined
        ? {
            itemId: this.parseOptionalNumber(payload.itemId),
          }
        : {}),
      ...(this.parseOptionalNumber(payload.payType) !== undefined
        ? {
            payType: this.parseOptionalNumber(payload.payType),
          }
        : {}),
      ...(this.parseOptionalNumber(payload.orderStatus) !== undefined
        ? {
            orderStatus: this.parseOptionalNumber(payload.orderStatus),
          }
        : {}),
      ...(this.parseOptionalNumber(payload.activityId) !== undefined
        ? {
            activityId: this.parseOptionalNumber(payload.activityId),
          }
        : {}),
      ...(this.parseOptionalNumber(payload.textbookId) !== undefined
        ? {
            textbookId: this.parseOptionalNumber(payload.textbookId),
          }
        : {}),
    };

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          member: {
            select: {
              tutuNumber: true,
              realName: true,
            },
          },
          activity: true,
          course: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '订单列表获取成功',
      data: {
        data: rows.map((order) => this.serializeOrder(order)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async listActivityOptions() {
    const rows = await this.prisma.activity.findMany({
      where: {
        status: 1,
      },
      orderBy: [{ id: 'asc' }],
      select: {
        id: true,
        title: true,
      },
    });

    return {
      code: 0,
      message: '活动选项获取成功',
      data: rows,
    };
  }

  async listCourseOptions() {
    const rows = await this.prisma.course.findMany({
      where: {
        status: 1,
      },
      orderBy: [{ textbookId: 'asc' }],
      select: {
        textbookId: true,
        textbookName: true,
      },
    });

    return {
      code: 0,
      message: '课程选项获取成功',
      data: rows,
    };
  }

  private serializeOrder(order: OrderListItem) {
    return {
      id: order.id,
      tutuNumber: order.member.tutuNumber,
      realName: order.member.realName || '',
      itemId: order.itemId ?? '',
      itemName: order.itemName,
      orderNo: order.orderNo,
      orderAmount: order.orderAmount,
      payType: order.payType,
      payTypeName: this.getPayTypeName(order.payType),
      orderStatus: order.orderStatus,
      orderStatusDesc: this.getOrderStatusName(order.orderStatus),
      payTime: order.payTime ? order.payTime.toISOString() : '',
      outNo: order.outNo || '',
      cancelReason: order.cancelReason || '',
      activityId: order.activityId ?? '',
      activityName: order.activity?.title || '',
      textbookId: order.textbookId ?? '',
      textbookName: order.course?.textbookName || '',
      createdAt: order.createdAt.toISOString(),
    };
  }

  private getPayTypeName(payType: number) {
    if (payType === 1) {
      return '微信';
    }
    if (payType === 2) {
      return '支付宝';
    }
    return '未知';
  }

  private getOrderStatusName(orderStatus: number) {
    if (orderStatus === 1) {
      return '待支付';
    }
    if (orderStatus === 2) {
      return '已支付';
    }
    if (orderStatus === 3) {
      return '用户取消';
    }
    if (orderStatus === 4) {
      return '超时关闭';
    }
    return '未知';
  }

  private parseOptionalNumber(value: unknown) {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return undefined;
    }

    return parsed;
  }

  private optionalString(value: unknown) {
    const text = String(value ?? '').trim();
    return text ? text : null;
  }
}
