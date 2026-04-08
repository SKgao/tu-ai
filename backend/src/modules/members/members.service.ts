import { BadRequestException, Injectable } from '@nestjs/common';
import { Member, MemberFeedback, MemberLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type MemberLevelPayload = {
  userLevel?: number | string;
  levelName?: string;
  explainInfo?: string;
  exprieDays?: number | string | null;
  orgMoney?: number | string | null;
  needMoney?: number | string | null;
  icon?: string;
};

type MemberListPayload = {
  pageNum?: number | string;
  pageSize?: number | string;
  userLevelIds?: Array<number | string>;
  expireStartTime?: string;
  expireEndTime?: string;
  payStartTime?: string;
  payEndTime?: string;
  registerStartTime?: string;
  registerEndTime?: string;
  tutuNumber?: number | string;
  mobile?: string;
  sex?: number | string;
  hasSetPassword?: number | string;
  sortInvite?: number | string;
  sortUserId?: number | string;
};

type MemberFeedbackPayload = {
  pageNum?: number | string;
  pageSize?: number | string;
  startTime?: string;
  endTime?: string;
  tutuNumber?: number | string;
  mobile?: string;
};

type GrantVipPayload = {
  userId?: number | string;
  userLevel?: number | string;
};

type MemberListItem = Member & {
  level?: MemberLevel | null;
};

type MemberFeedbackItem = MemberFeedback & {
  member: Pick<Member, 'tutuNumber' | 'mobile'>;
};

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async listMemberLevels() {
    const levels = await this.prisma.memberLevel.findMany({
      orderBy: [{ userLevel: 'asc' }],
    });

    return {
      code: 0,
      message: '会员等级列表获取成功',
      data: levels.map((level) => this.serializeMemberLevel(level)),
    };
  }

  async listMemberLevelOptions() {
    const levels = await this.prisma.memberLevel.findMany({
      orderBy: [{ userLevel: 'asc' }],
      select: {
        userLevel: true,
        levelName: true,
      },
    });

    return {
      code: 0,
      message: '会员等级选项获取成功',
      data: levels,
    };
  }

  async createMemberLevel(payload: MemberLevelPayload) {
    const userLevel = this.parseRequiredNumber(payload.userLevel, '缺少会员等级 ID');
    const levelName = this.requireText(payload.levelName, '会员等级名称不能为空');

    const existing = await this.prisma.memberLevel.findUnique({
      where: { userLevel },
      select: { userLevel: true },
    });
    if (existing) {
      throw new BadRequestException('会员等级 ID 已存在');
    }

    await this.prisma.memberLevel.create({
      data: {
        userLevel,
        levelName,
        explainInfo: this.optionalString(payload.explainInfo) || '',
        exprieDays: this.parseOptionalNumber(payload.exprieDays, 0),
        orgMoney: this.parseOptionalNumber(payload.orgMoney, 0),
        needMoney: this.parseOptionalNumber(payload.needMoney, 0),
        icon: this.optionalString(payload.icon),
      },
    });

    return {
      code: 0,
      message: '会员等级创建成功',
      data: true,
    };
  }

  async updateMemberLevel(payload: MemberLevelPayload) {
    const userLevel = this.parseRequiredNumber(payload.userLevel, '缺少会员等级 ID');
    const level = await this.prisma.memberLevel.findUnique({
      where: { userLevel },
      select: { userLevel: true },
    });
    if (!level) {
      throw new BadRequestException('会员等级不存在');
    }

    await this.prisma.memberLevel.update({
      where: { userLevel },
      data: {
        ...(payload.levelName !== undefined
          ? {
              levelName: this.requireText(payload.levelName, '会员等级名称不能为空'),
            }
          : {}),
        ...(payload.explainInfo !== undefined
          ? {
              explainInfo: this.optionalString(payload.explainInfo) || '',
            }
          : {}),
        ...(payload.exprieDays !== undefined
          ? {
              exprieDays: this.parseOptionalNumber(payload.exprieDays, 0),
            }
          : {}),
        ...(payload.orgMoney !== undefined
          ? {
              orgMoney: this.parseOptionalNumber(payload.orgMoney, 0),
            }
          : {}),
        ...(payload.needMoney !== undefined
          ? {
              needMoney: this.parseOptionalNumber(payload.needMoney, 0),
            }
          : {}),
        ...(payload.icon !== undefined
          ? {
              icon: this.optionalString(payload.icon),
            }
          : {}),
      },
    });

    return {
      code: 0,
      message: '会员等级更新成功',
      data: true,
    };
  }

  async deleteMemberLevel(payload: number | string) {
    const userLevel = this.parseRequiredNumber(payload, '缺少会员等级 ID');
    if (userLevel === 0) {
      throw new BadRequestException('默认会员等级不允许删除');
    }

    const level = await this.prisma.memberLevel.findUnique({
      where: { userLevel },
      select: { userLevel: true },
    });
    if (!level) {
      throw new BadRequestException('会员等级不存在');
    }

    await this.prisma.$transaction([
      this.prisma.member.updateMany({
        where: { userLevel },
        data: {
          userLevel: 0,
          payTime: null,
          exprieTime: null,
        },
      }),
      this.prisma.memberLevel.delete({
        where: { userLevel },
      }),
    ]);

    return {
      code: 0,
      message: '会员等级删除成功',
      data: true,
    };
  }

  async listMembers(payload: MemberListPayload = {}) {
    const pageNum = Math.max(1, this.parseOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, this.parseOptionalNumber(payload.pageSize) ?? 10);
    const where = this.buildMemberWhere(payload);
    const orderBy = this.buildMemberOrderBy(payload);

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        include: {
          level: true,
        },
        orderBy,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '会员列表获取成功',
      data: {
        data: rows.map((member) => this.serializeMember(member)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async listMemberFeedback(payload: MemberFeedbackPayload = {}) {
    const pageNum = Math.max(1, this.parseOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, this.parseOptionalNumber(payload.pageSize) ?? 10);
    const startTime = this.parseDate(payload.startTime);
    const endTime = this.parseDate(payload.endTime);
    const tutuNumber = this.parseOptionalNumber(payload.tutuNumber);
    const mobile = this.optionalString(payload.mobile);

    const where: Prisma.MemberFeedbackWhereInput = {
      ...(startTime || endTime
        ? {
            createdAt: {
              ...(startTime ? { gte: startTime } : {}),
              ...(endTime ? { lte: endTime } : {}),
            },
          }
        : {}),
      ...(tutuNumber || mobile
        ? {
            member: {
              ...(tutuNumber ? { tutuNumber } : {}),
              ...(mobile
                ? {
                    mobile: {
                      contains: mobile,
                    },
                  }
                : {}),
            },
          }
        : {}),
    };

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.memberFeedback.count({ where }),
      this.prisma.memberFeedback.findMany({
        where,
        include: {
          member: {
            select: {
              tutuNumber: true,
              mobile: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '会员反馈列表获取成功',
      data: {
        data: rows.map((item) => this.serializeFeedback(item)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async enableMember(payload: number | string) {
    return this.updateMemberStatus(payload, 1, '会员启用成功');
  }

  async disableMember(payload: number | string) {
    return this.updateMemberStatus(payload, 2, '会员禁用成功');
  }

  async grantVip(payload: GrantVipPayload) {
    const userId = this.parseRequiredNumber(payload.userId, '缺少用户 ID');
    const userLevel = this.parseRequiredNumber(payload.userLevel, '请选择会员等级');

    const [member, level] = await Promise.all([
      this.prisma.member.findUnique({
        where: { id: userId },
        select: { id: true, status: true },
      }),
      this.prisma.memberLevel.findUnique({
        where: { userLevel },
      }),
    ]);

    if (!member) {
      throw new BadRequestException('会员不存在');
    }
    if (!level) {
      throw new BadRequestException('会员等级不存在');
    }

    const payTime = new Date();
    const exprieTime =
      level.exprieDays && level.exprieDays > 0
        ? new Date(payTime.getTime() + level.exprieDays * 24 * 60 * 60 * 1000)
        : null;

    await this.prisma.member.update({
      where: { id: userId },
      data: {
        userLevel,
        payTime,
        exprieTime,
        status: member.status === 3 ? 1 : member.status,
      },
    });

    return {
      code: 0,
      message: '会员开通成功',
      data: true,
    };
  }

  private buildMemberWhere(payload: MemberListPayload): Prisma.MemberWhereInput {
    const registerStartTime = this.parseDate(payload.registerStartTime);
    const registerEndTime = this.parseDate(payload.registerEndTime);
    const payStartTime = this.parseDate(payload.payStartTime);
    const payEndTime = this.parseDate(payload.payEndTime);
    const expireStartTime = this.parseDate(payload.expireStartTime);
    const expireEndTime = this.parseDate(payload.expireEndTime);
    const userLevelIds = Array.isArray(payload.userLevelIds)
      ? payload.userLevelIds
          .map((item) => this.parseOptionalNumber(item))
          .filter((item): item is number => item !== undefined)
      : [];
    const tutuNumber = this.parseOptionalNumber(payload.tutuNumber);
    const mobile = this.optionalString(payload.mobile);
    const sex = this.parseOptionalNumber(payload.sex);
    const hasSetPassword = this.parseOptionalNumber(payload.hasSetPassword);

    return {
      status: {
        in: [1, 2],
      },
      ...(userLevelIds.length
        ? {
            userLevel: {
              in: userLevelIds,
            },
          }
        : {}),
      ...(tutuNumber
        ? {
            tutuNumber,
          }
        : {}),
      ...(mobile
        ? {
            mobile: {
              contains: mobile,
            },
          }
        : {}),
      ...(sex
        ? {
            sex,
          }
        : {}),
      ...(hasSetPassword
        ? {
            hasSetPassword,
          }
        : {}),
      ...(registerStartTime || registerEndTime
        ? {
            createdAt: {
              ...(registerStartTime ? { gte: registerStartTime } : {}),
              ...(registerEndTime ? { lte: registerEndTime } : {}),
            },
          }
        : {}),
      ...(payStartTime || payEndTime
        ? {
            payTime: {
              ...(payStartTime ? { gte: payStartTime } : {}),
              ...(payEndTime ? { lte: payEndTime } : {}),
            },
          }
        : {}),
      ...(expireStartTime || expireEndTime
        ? {
            exprieTime: {
              ...(expireStartTime ? { gte: expireStartTime } : {}),
              ...(expireEndTime ? { lte: expireEndTime } : {}),
            },
          }
        : {}),
    };
  }

  private buildMemberOrderBy(payload: MemberListPayload): Prisma.MemberOrderByWithRelationInput[] {
    const orderBy: Prisma.MemberOrderByWithRelationInput[] = [];
    const sortInvite = this.parseOptionalNumber(payload.sortInvite);
    const sortUserId = this.parseOptionalNumber(payload.sortUserId);

    if (sortUserId !== undefined) {
      orderBy.push({
        tutuNumber: sortUserId === 1 ? 'asc' : 'desc',
      });
    }

    if (sortInvite !== undefined) {
      orderBy.push({
        inviteCount: sortInvite === 1 ? 'asc' : 'desc',
      });
    }

    if (!orderBy.length) {
      orderBy.push({ createdAt: 'desc' }, { id: 'desc' });
    }

    return orderBy;
  }

  private async updateMemberStatus(payload: number | string, status: number, message: string) {
    const id = this.parseRequiredNumber(payload, '缺少用户 ID');
    const member = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!member) {
      throw new BadRequestException('会员不存在');
    }

    await this.prisma.member.update({
      where: { id },
      data: { status },
    });

    return {
      code: 0,
      message,
      data: true,
    };
  }

  private serializeMemberLevel(level: MemberLevel) {
    return {
      userLevel: level.userLevel,
      levelName: level.levelName,
      explainInfo: level.explainInfo || '',
      exprieDays: level.exprieDays ?? 0,
      orgMoney: level.orgMoney ?? 0,
      needMoney: level.needMoney ?? 0,
      icon: level.icon || '',
      createdAt: level.createdAt.toISOString(),
      updatedAt: level.updatedAt.toISOString(),
    };
  }

  private serializeMember(member: MemberListItem) {
    return {
      userId: member.id,
      tutuNumber: member.tutuNumber,
      realName: member.realName,
      icon: member.icon || '',
      inviteCount: member.inviteCount,
      userLevel: member.userLevel,
      userLevelName: member.level?.levelName || '',
      channel: member.channel,
      hasBuyTextbook: member.hasBuyTextbook,
      payTime: member.payTime ? member.payTime.toISOString() : '',
      exprieTime: member.exprieTime ? member.exprieTime.toISOString() : '',
      userMoney: member.userMoney,
      mobile: member.mobile || '',
      email: member.email || '',
      birthday: member.birthday ? member.birthday.toISOString() : '',
      sex: member.sex ?? 0,
      hasSetPassword: member.hasSetPassword,
      createdAt: member.createdAt.toISOString(),
      bookVersionName: member.bookVersionName || '',
      textbookNamePractice: member.textbookNamePractice || '',
      status: member.status,
    };
  }

  private serializeFeedback(item: MemberFeedbackItem) {
    return {
      id: item.id,
      tutuNumber: item.member.tutuNumber,
      mobile: item.member.mobile || '',
      content: item.content,
      createdAt: item.createdAt.toISOString(),
    };
  }

  private parseRequiredNumber(value: unknown, message: string) {
    const parsed = this.parseOptionalNumber(value);
    if (parsed === undefined) {
      throw new BadRequestException(message);
    }
    return parsed;
  }

  private parseOptionalNumber(value: unknown, fallback?: number) {
    if (value === '' || value === null || value === undefined) {
      return fallback;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return parsed;
  }

  private parseDate(value: unknown) {
    if (!value) {
      return null;
    }

    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private optionalString(value: unknown) {
    const text = String(value ?? '').trim();
    return text ? text : null;
  }

  private requireText(value: unknown, message: string) {
    const text = String(value ?? '').trim();
    if (!text) {
      throw new BadRequestException(message);
    }
    return text;
  }
}
