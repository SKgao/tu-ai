import { Injectable } from '@nestjs/common';
import { Activity, Course, Order, Prisma } from '@prisma/client';
import { toOptionalNumber, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, contains, eq, nested } from '../../prisma/where';
import { ListOrdersDto } from './dto/list-orders.dto';

type OrderListMode = 'all' | 'course';

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

  async listOrders(payload: ListOrdersDto = {}) {
    return this.listOrderPage(payload, 'all');
  }

  async listCourseOrders(payload: ListOrdersDto = {}) {
    return this.listOrderPage(payload, 'course');
  }

  private async listOrderPage(payload: ListOrdersDto, mode: OrderListMode) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const where = this.buildOrderWhere(payload, mode);

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
      message: mode === 'course' ? '课程订单列表获取成功' : '订单列表获取成功',
      data: {
        data: rows.map((order) => this.serializeOrder(order)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  private buildOrderWhere(payload: ListOrdersDto, mode: OrderListMode): Prisma.OrderWhereInput {
    const tutuNumber = toOptionalNumber(payload.tutuNumber);
    const orderNo = toOptionalString(payload.orderNo);
    const itemId = toOptionalNumber(payload.itemId);
    const payType = toOptionalNumber(payload.payType);
    const orderStatus = toOptionalNumber(payload.orderStatus);
    const activityId = toOptionalNumber(payload.activityId);
    const textbookId = toOptionalNumber(payload.textbookId);

    return composeWhere<Prisma.OrderWhereInput>(
      nested(
        'member',
        tutuNumber
          ? {
              tutuNumber,
            }
          : undefined,
      ),
      contains('orderNo', orderNo),
      eq('itemId', itemId),
      eq('payType', payType),
      eq('orderStatus', orderStatus),
      eq('activityId', activityId),
      mode === 'course'
        ? textbookId !== undefined
          ? eq('textbookId', textbookId)
          : {
              textbookId: {
                not: null,
              },
            }
        : eq('textbookId', textbookId),
    );
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
}
