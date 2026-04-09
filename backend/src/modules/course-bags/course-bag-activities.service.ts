import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseBagActivity, CourseBagCourse } from '@prisma/client';
import { parseDate, requireNumber, requireText, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseBagActivityMutationDto } from './dto/course-bag-activity.dto';

type CourseBagActivityListItem = CourseBagActivity & {
  course: CourseBagCourse;
};

@Injectable()
export class CourseBagActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourseBagActivities(textbookId: number) {
    const rows = await this.prisma.courseBagActivity.findMany({
      where: {
        textbookId,
      },
      include: {
        course: true,
      },
      orderBy: [{ id: 'asc' }],
    });

    return {
      code: 0,
      message: '课程活动列表获取成功',
      data: rows.map((item) => this.serializeActivity(item)),
    };
  }

  async createCourseBagActivity(payload: CourseBagActivityMutationDto) {
    const id = requireNumber(payload.id, '缺少活动 ID');
    const textbookId = requireNumber(payload.textbookId, '缺少课程 ID');
    await this.assertCourseBagCourseExists(textbookId);

    const existing = await this.prisma.courseBagActivity.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('活动 ID 已存在');
    }

    await this.prisma.courseBagActivity.create({
      data: this.buildActivityMutationData(payload, textbookId),
    });

    return {
      code: 0,
      message: '课程活动创建成功',
      data: true,
    };
  }

  async updateCourseBagActivity(payload: CourseBagActivityMutationDto) {
    const id = requireNumber(payload.id, '缺少活动 ID');
    const activity = await this.prisma.courseBagActivity.findUnique({
      where: { id },
      select: {
        id: true,
        textbookId: true,
      },
    });
    if (!activity) {
      throw new BadRequestException('课程活动不存在');
    }

    await this.prisma.courseBagActivity.update({
      where: { id },
      data: this.buildActivityMutationData(payload, activity.textbookId),
    });

    return {
      code: 0,
      message: '课程活动更新成功',
      data: true,
    };
  }

  async deleteCourseBagActivity(id: number) {
    const activityId = requireNumber(id, '缺少活动 ID');
    const activity = await this.prisma.courseBagActivity.findUnique({
      where: { id: activityId },
      select: { id: true },
    });
    if (!activity) {
      throw new BadRequestException('课程活动不存在');
    }

    await this.prisma.courseBagActivity.delete({
      where: { id: activityId },
    });

    return {
      code: 0,
      message: '课程活动删除成功',
      data: true,
    };
  }

  private buildActivityMutationData(payload: CourseBagActivityMutationDto, textbookId: number) {
    const saleBeginAt = parseDate(payload.saleBeginAt);
    const saleEndAt = parseDate(payload.saleEndAt);
    const beginAt = parseDate(payload.beginAt);
    const endAt = parseDate(payload.endAt);
    const type = requireNumber(payload.type, '缺少开课方式');
    const status = requireNumber(payload.status, '缺少课程状态');

    if (!saleBeginAt || !saleEndAt) {
      throw new BadRequestException('预售开始和结束时间不能为空');
    }
    if (saleBeginAt.getTime() > saleEndAt.getTime()) {
      throw new BadRequestException('预售开始时间不能大于预售结束时间');
    }
    if (![1, 2, 3].includes(type)) {
      throw new BadRequestException('开课方式不合法');
    }
    if (![1, 2].includes(status)) {
      throw new BadRequestException('课程状态不合法');
    }

    if (type === 1) {
      if (!beginAt || !endAt) {
        throw new BadRequestException('统一开课模式必须填写开课和结课时间');
      }
      if (beginAt.getTime() > endAt.getTime()) {
        throw new BadRequestException('开课时间不能大于结课时间');
      }
    }

    return {
      id: requireNumber(payload.id, '缺少活动 ID'),
      textbookId,
      teacher: requireText(payload.teacher, '辅导老师不能为空'),
      status,
      type,
      saleBeginAt,
      saleEndAt,
      beginAt: type === 1 ? beginAt : null,
      endAt: type === 1 ? endAt : null,
      orgAmt: requireNumber(payload.orgAmt, '原始金额不能为空'),
      amt: requireNumber(payload.amt, '实际金额不能为空'),
      num: requireNumber(payload.num, '课程数量不能为空'),
      chatNo: toOptionalString(payload.chatNo),
      iconDetail: toOptionalString(payload.iconDetail),
      iconTicket: toOptionalString(payload.iconTicket),
    };
  }

  private async assertCourseBagCourseExists(id: number) {
    const course = await this.prisma.courseBagCourse.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!course) {
      throw new BadRequestException('课程不存在');
    }
  }

  private serializeActivity(item: CourseBagActivityListItem) {
    return {
      id: item.id,
      textbookId: item.textbookId,
      textbookName: item.course.name,
      teacher: item.teacher,
      status: item.status,
      type: item.type,
      saleBeginAt: this.formatDateTime(item.saleBeginAt),
      saleEndAt: this.formatDateTime(item.saleEndAt),
      beginAt: this.formatDateTime(item.beginAt),
      endAt: this.formatDateTime(item.endAt),
      orgAmt: item.orgAmt,
      amt: item.amt,
      num: item.num,
      chatNo: item.chatNo || '',
      iconDetail: item.iconDetail || '',
      iconTicket: item.iconTicket || '',
      createdAt: this.formatDateTime(item.createdAt),
      updatedAt: this.formatDateTime(item.updatedAt),
    };
  }

  private formatDateTime(value: Date | null) {
    if (!value) {
      return '';
    }

    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
}
