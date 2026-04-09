import { BadRequestException, Injectable } from '@nestjs/common';
import { Activity, MemberLevel, Prisma } from '@prisma/client';
import {
  parseDate,
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { composeWhere, eq } from '../../prisma/where';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeActivityStatusDto } from './dto/change-activity-status.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ListActivitiesDto } from './dto/list-activities.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

type ActivityListItem = Activity & {
  level?: MemberLevel | null;
};

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async listActivities(payload: ListActivitiesDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const where = this.buildActivityWhere(payload);

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.activity.count({ where }),
      this.prisma.activity.findMany({
        where,
        include: {
          level: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '活动列表获取成功',
      data: {
        data: rows.map((item) => this.serializeActivity(item)),
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

  async createActivity(payload: CreateActivityDto) {
    const data = await this.buildActivityMutationData(payload);

    await this.prisma.activity.create({
      data: {
        ...data,
        status: 1,
      },
    });

    return {
      code: 0,
      message: '活动创建成功',
      data: true,
    };
  }

  async updateActivity(payload: UpdateActivityDto) {
    const id = requireNumber(payload.id, '缺少活动 ID');
    await this.assertActivityExists(id);

    const data = await this.buildActivityMutationData(payload);
    await this.prisma.activity.update({
      where: { id },
      data,
    });

    return {
      code: 0,
      message: '活动更新成功',
      data: true,
    };
  }

  async deleteActivity(id: number) {
    const activityId = requireNumber(id, '缺少活动 ID');
    await this.assertActivityExists(activityId);

    await this.prisma.activity.delete({
      where: { id: activityId },
    });

    return {
      code: 0,
      message: '活动删除成功',
      data: true,
    };
  }

  async changeStatus(payload: ChangeActivityStatusDto) {
    const id = requireNumber(payload.id, '缺少活动 ID');
    const status = requireNumber(payload.status, '缺少活动状态');
    await this.assertActivityExists(id);
    this.assertActivityStatus(status);

    await this.prisma.activity.update({
      where: { id },
      data: {
        status,
      },
    });

    return {
      code: 0,
      message: status === 1 ? '活动已启动' : '活动已关闭',
      data: true,
    };
  }

  private buildActivityWhere(payload: ListActivitiesDto): Prisma.ActivityWhereInput {
    const id = toOptionalNumber(payload.id);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);

    return composeWhere<Prisma.ActivityWhereInput>(
      eq('id', id),
      startTime
        ? {
            beginAt: {
              gte: startTime,
            },
          }
        : undefined,
      endTime
        ? {
            endAt: {
              lte: endTime,
            },
          }
        : undefined,
    );
  }

  private async buildActivityMutationData(payload: CreateActivityDto | UpdateActivityDto) {
    const title = requireText(payload.title, '活动标题不能为空');
    const beginAt = parseDate(payload.beginAt);
    const endAt = parseDate(payload.endAt);

    if (!beginAt || !endAt) {
      throw new BadRequestException('请选择活动开始和结束时间');
    }
    if (beginAt.getTime() > endAt.getTime()) {
      throw new BadRequestException('活动开始时间不能晚于结束时间');
    }

    const activityType =
      toOptionalNumber(payload.activityType, toOptionalNumber(payload.status, 1)) ?? 1;
    this.assertActivityType(activityType);
    const itemId = toOptionalNumber(payload.itemId);
    const activeMoney = toOptionalNumber(payload.activeMoney);
    const activeExpireDays = this.resolveExpireDays(payload.activeExpireDays, beginAt, endAt);

    if (activityType === 1) {
      if (itemId === undefined) {
        throw new BadRequestException('购买活动必须选择参与活动商品');
      }
      await this.assertMemberLevelExists(itemId);
    }

    return {
      title,
      content: toOptionalString(payload.content),
      icon: toOptionalString(payload.icon),
      activeMoney: activityType === 1 ? activeMoney ?? 0 : null,
      activityType,
      itemId: activityType === 1 ? itemId ?? null : null,
      activeExpireDays,
      beginAt,
      endAt,
      url: toOptionalString(payload.url),
    };
  }

  private resolveExpireDays(value: unknown, beginAt: Date, endAt: Date) {
    const parsed = toOptionalNumber(value);
    if (parsed !== undefined) {
      return Math.max(0, parsed);
    }

    const diffMs = endAt.getTime() - beginAt.getTime();
    return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
  }

  private assertActivityStatus(status: number) {
    if (![1, 2].includes(status)) {
      throw new BadRequestException('活动状态不合法');
    }
  }

  private assertActivityType(activityType: number) {
    if (![1, 2].includes(activityType)) {
      throw new BadRequestException('活动类型不合法');
    }
  }

  private async assertActivityExists(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!activity) {
      throw new BadRequestException('活动不存在');
    }
  }

  private async assertMemberLevelExists(userLevel: number) {
    const level = await this.prisma.memberLevel.findUnique({
      where: { userLevel },
      select: { userLevel: true },
    });
    if (!level) {
      throw new BadRequestException('会员等级不存在');
    }
  }

  private serializeActivity(item: ActivityListItem) {
    return {
      id: item.id,
      title: item.title,
      content: item.content || '',
      icon: item.icon || '',
      activeMoney: item.activeMoney ?? '',
      status: item.status,
      activityType: item.activityType,
      itemId: item.itemId ?? '',
      itemName: item.level?.levelName || '',
      activeExpireDays: item.activeExpireDays ?? '',
      beginAt: this.formatDateTime(item.beginAt),
      endAt: this.formatDateTime(item.endAt),
      createdAt: this.formatDateTime(item.createdAt),
      updatedAt: this.formatDateTime(item.updatedAt),
      url: item.url || '',
    };
  }

  private formatDateTime(value: Date | null) {
    if (!value) {
      return '';
    }

    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
}
