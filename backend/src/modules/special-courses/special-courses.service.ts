import { BadRequestException, Injectable } from '@nestjs/common';
import { Member, Order, Prisma, SpecialCourse } from '@prisma/client';
import {
  parseDate,
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, contains, dateRange, eq, nested } from '../../prisma/where';
import { CreateCourseUserDto } from './dto/create-course-user.dto';
import { ListCourseUsersDto } from './dto/list-course-users.dto';
import { ListSpecialCoursesDto } from './dto/list-special-courses.dto';
import { SpecialCourseMutationDto } from './dto/special-course.dto';

type CourseOrderItem = Order & {
  member: Pick<Member, 'id' | 'tutuNumber' | 'mobile' | 'realName' | 'sex'>;
};

const DEFAULT_TUTU_NUMBER_FLOOR = 100000;

@Injectable()
export class SpecialCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listSpecialCourses(payload: ListSpecialCoursesDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 20);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);
    const where = composeWhere<Prisma.SpecialCourseWhereInput>(
      dateRange('createdAt', startTime, endTime),
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.specialCourse.count({ where }),
      this.prisma.specialCourse.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { textbookId: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '精品课程列表获取成功',
      data: {
        data: rows.map((item) => this.serializeSpecialCourse(item)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async listBoughtSpecialCourses(userId: number) {
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [{ id: userId }, { tutuNumber: userId }],
      },
      select: { id: true },
    });

    if (!member) {
      throw new BadRequestException('会员不存在');
    }

    const orders = await this.prisma.order.findMany({
      where: {
        memberId: member.id,
        textbookId: {
          not: null,
        },
        orderStatus: 2,
      },
      orderBy: [{ payTime: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      select: {
        textbookId: true,
      },
    });

    const textbookIds = Array.from(
      new Set(
        orders
          .map((item) => item.textbookId)
          .filter((item): item is number => item !== null),
      ),
    );

    if (!textbookIds.length) {
      return {
        code: 0,
        message: '已购精品课程列表获取成功',
        data: [],
      };
    }

    const courses = await this.prisma.specialCourse.findMany({
      where: {
        textbookId: {
          in: textbookIds,
        },
      },
      orderBy: [{ textbookId: 'asc' }],
    });

    return {
      code: 0,
      message: '已购精品课程列表获取成功',
      data: courses.map((item) => this.serializeSpecialCourse(item)),
    };
  }

  async createSpecialCourse(payload: SpecialCourseMutationDto) {
    const textbookId = requireNumber(payload.textbookId, '缺少课程 ID');
    await this.assertBookExists(textbookId);

    const existing = await this.prisma.specialCourse.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (existing) {
      throw new BadRequestException('精品课程已存在');
    }

    await this.prisma.specialCourse.create({
      data: this.buildSpecialCourseMutationData(payload, textbookId),
    });

    return {
      code: 0,
      message: '精品课程创建成功',
      data: true,
    };
  }

  async updateSpecialCourse(payload: SpecialCourseMutationDto) {
    const textbookId = requireNumber(payload.textbookId, '缺少课程 ID');
    await this.assertSpecialCourseExists(textbookId);

    await this.prisma.specialCourse.update({
      where: { textbookId },
      data: this.buildSpecialCourseMutationData(payload, textbookId),
    });

    return {
      code: 0,
      message: '精品课程更新成功',
      data: true,
    };
  }

  async deleteSpecialCourse(textbookId: number) {
    await this.assertSpecialCourseExists(textbookId);

    await this.prisma.specialCourse.delete({
      where: { textbookId },
    });

    return {
      code: 0,
      message: '精品课程删除成功',
      data: true,
    };
  }

  async changeSpecialCourseStatus(textbookId: number, status: number) {
    await this.assertSpecialCourseExists(textbookId);

    await this.prisma.specialCourse.update({
      where: { textbookId },
      data: { status },
    });

    return {
      code: 0,
      message: status === 1 ? '精品课程已上架' : '精品课程已下架',
      data: true,
    };
  }

  async listSpecialCourseOptions() {
    const rows = await this.prisma.specialCourse.findMany({
      orderBy: [{ textbookId: 'asc' }],
      select: {
        textbookId: true,
        textbookName: true,
        status: true,
      },
    });

    return {
      code: 0,
      message: '精品课程选项获取成功',
      data: rows,
    };
  }

  async listCourseUsers(payload: ListCourseUsersDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const where = this.buildCourseUserWhere(payload);

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              tutuNumber: true,
              mobile: true,
              realName: true,
              sex: true,
            },
          },
        },
        orderBy: [{ payTime: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const specialCourseMap = await this.getSpecialCourseMap(
      rows
        .map((item) => item.textbookId)
        .filter((item): item is number => item !== null),
    );

    return {
      code: 0,
      message: '已买课程列表获取成功',
      data: {
        data: rows.map((item) => this.serializeCourseUser(item as CourseOrderItem, specialCourseMap)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createCourseUser(payload: CreateCourseUserDto) {
    const textbookId = requireNumber(payload.textbookId, '请选择精品课程');
    const realName = requireText(payload.realName, '请输入用户名');
    const mobile = requireText(payload.mobile, '请输入手机号');
    const sex = requireNumber(payload.sex, '请选择性别');
    const payAmt = requireNumber(payload.payAmt, '请输入付款金额');

    if (!/^1\d{10}$/.test(mobile)) {
      throw new BadRequestException('请输入合法手机号');
    }
    if (![1, 2].includes(sex)) {
      throw new BadRequestException('性别不合法');
    }
    if (payAmt < 0) {
      throw new BadRequestException('付款金额不能小于 0');
    }

    const specialCourse = await this.prisma.specialCourse.findUnique({
      where: { textbookId },
      include: {
        course: {
          include: {
            bookVersion: true,
          },
        },
      },
    });
    if (!specialCourse) {
      throw new BadRequestException('精品课程不存在');
    }

    const now = new Date();
    const nextTutuNumber = await this.getNextTutuNumber();

    await this.prisma.$transaction(async (tx) => {
      const existingMember = await tx.member.findFirst({
        where: {
          mobile,
        },
      });

      const member = existingMember
        ? await tx.member.update({
            where: { id: existingMember.id },
            data: {
              realName,
              mobile,
              sex,
              hasBuyTextbook: 1,
              payTime: now,
              status: existingMember.status === 3 ? 1 : existingMember.status,
              bookVersionName:
                specialCourse.course.bookVersion?.name || existingMember.bookVersionName,
              textbookNamePractice: specialCourse.textbookName,
            },
          })
        : await tx.member.create({
            data: {
              tutuNumber: nextTutuNumber,
              realName,
              mobile,
              sex,
              icon: null,
              inviteCount: 0,
              channel: 1,
              hasBuyTextbook: 1,
              payTime: now,
              exprieTime: specialCourse.endAt,
              userMoney: 0,
              email: null,
              birthday: null,
              hasSetPassword: 2,
              bookVersionName: specialCourse.course.bookVersion?.name || null,
              textbookNamePractice: specialCourse.textbookName,
              status: 1,
              userLevel: 0,
            },
          });

      const duplicated = await tx.order.findFirst({
        where: {
          memberId: member.id,
          textbookId,
          orderStatus: 2,
        },
        select: { id: true },
      });
      if (duplicated) {
        throw new BadRequestException('该用户已开通当前精品课程');
      }

      await tx.order.create({
        data: {
          orderNo: this.generateOrderNo(member.id),
          memberId: member.id,
          itemId: null,
          itemName: specialCourse.textbookName,
          orderAmount: payAmt,
          payType: 3,
          orderStatus: 2,
          payTime: now,
          outNo: this.generateOutNo(member.id),
          cancelReason: null,
          activityId: null,
          textbookId,
        },
      });
    });

    return {
      code: 0,
      message: '精品课程开通成功',
      data: true,
    };
  }

  private buildSpecialCourseMutationData(payload: SpecialCourseMutationDto, textbookId: number) {
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
    if (![1, 2].includes(type)) {
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
      textbookId,
      textbookName: requireText(payload.textbookName, '课程名称不能为空'),
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

  private buildCourseUserWhere(payload: ListCourseUsersDto): Prisma.OrderWhereInput {
    const textbookId = toOptionalNumber(payload.textbookId);
    const tutuNumber = toOptionalNumber(payload.tutuNumber);
    const sex = toOptionalNumber(payload.sex);
    const mobile = toOptionalString(payload.mobile);
    const realName = toOptionalString(payload.realName);

    return composeWhere<Prisma.OrderWhereInput>(
      {
        orderStatus: 2,
        textbookId: {
          not: null,
        },
      },
      textbookId !== undefined ? eq('textbookId', textbookId) : undefined,
      nested(
        'member',
        composeWhere(
          tutuNumber !== undefined ? eq('tutuNumber', tutuNumber) : undefined,
          sex !== undefined ? eq('sex', sex) : undefined,
          contains('mobile', mobile),
          contains('realName', realName),
        ),
      ),
    );
  }

  private async assertBookExists(textbookId: number) {
    const book = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!book) {
      throw new BadRequestException('教材不存在');
    }
  }

  private async assertSpecialCourseExists(textbookId: number) {
    const course = await this.prisma.specialCourse.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!course) {
      throw new BadRequestException('精品课程不存在');
    }
  }

  private async getSpecialCourseMap(textbookIds: number[]) {
    const uniqueTextbookIds = Array.from(new Set(textbookIds));
    if (!uniqueTextbookIds.length) {
      return new Map<number, SpecialCourse>();
    }

    const rows = await this.prisma.specialCourse.findMany({
      where: {
        textbookId: {
          in: uniqueTextbookIds,
        },
      },
    });

    return new Map(rows.map((item) => [item.textbookId, item]));
  }

  private async getNextTutuNumber() {
    const latest = await this.prisma.member.findFirst({
      orderBy: { tutuNumber: 'desc' },
      select: { tutuNumber: true },
    });

    return Math.max(DEFAULT_TUTU_NUMBER_FLOOR, latest?.tutuNumber ?? DEFAULT_TUTU_NUMBER_FLOOR) + 1;
  }

  private serializeSpecialCourse(item: SpecialCourse) {
    return {
      textbookId: item.textbookId,
      textbookName: item.textbookName,
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

  private serializeCourseUser(item: CourseOrderItem, specialCourseMap: Map<number, SpecialCourse>) {
    const specialCourse = item.textbookId ? specialCourseMap.get(item.textbookId) : undefined;

    return {
      textbookId: item.textbookId ?? '',
      textbookName: specialCourse?.textbookName || '',
      tutuNumber: item.member.tutuNumber,
      mobile: item.member.mobile || '',
      realName: item.member.realName || '',
      sex: item.member.sex ?? 0,
      payAmt: item.orderAmount,
      buyAt: this.formatDateTime(item.payTime || item.createdAt),
      beginAt: this.formatDateTime(specialCourse?.beginAt || null),
      endAt: this.formatDateTime(specialCourse?.endAt || null),
    };
  }

  private generateOrderNo(memberId: number) {
    return `COURSE${Date.now()}${String(memberId).padStart(4, '0')}`;
  }

  private generateOutNo(memberId: number) {
    return `ADMIN${Date.now()}${String(memberId).padStart(4, '0')}`;
  }

  private formatDateTime(value: Date | null) {
    if (!value) {
      return '';
    }

    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
}
