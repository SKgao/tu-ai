import { BadRequestException, Injectable } from '@nestjs/common';
import { LearningRecord, Member, MemberInvite } from '@prisma/client';
import { requireNumber, toOptionalNumber } from '../../common/parsers';
import { ok, paginate } from '../../common/response';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 邀请明细与学习记录。
 *
 * ⚠️ 两个接口请求体里的 `userId` 都是 **tutuNumber**（图图号），不是 `Member.id`：
 * 前端跳转是 `/invite-count?userId=${member.tutuNumber}`（members/configs/tableColumns.tsx:44、:86）。
 * 因此所有查询都要先按 `tutuNumber` 换出 `Member.id`，见 `resolveMemberId`。
 */

type InviteWithInvitee = MemberInvite & {
  invitee: Pick<Member, 'tutuNumber' | 'realName' | 'icon' | 'mobile'>;
};

type LearningRecordWithRelations = LearningRecord & {
  textbook?: { textbookName: string } | null;
  unit?: { text: string } | null;
  part?: { title: string } | null;
  session?: { title: string } | null;
};

export type ListInvitePayload = {
  userId?: number | string;
};

export type ListLearningRecordsPayload = {
  userId?: number | string;
  pageNum?: number | string;
  pageSize?: number | string;
};

@Injectable()
export class MemberRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async listInvites(payload: ListInvitePayload = {}) {
    const memberId = await this.resolveMemberId(payload.userId);

    // 该页前端做客户端分页（invite-count/page.tsx），后端一次返回全部。
    const rows = await this.prisma.memberInvite.findMany({
      where: {
        inviterId: memberId,
      },
      include: {
        invitee: {
          select: {
            tutuNumber: true,
            realName: true,
            icon: true,
            mobile: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    // ⚠️ 非标准结构：该接口没有 totalPages/pageNum/pageSize（前端自己做客户端分页），
    // 只换外层信封，绝不能补分页字段，否则改变接口契约。
    return ok(
      {
        data: rows.map((item) => this.serializeInvite(item)),
        totalCount: rows.length,
      },
      '邀请明细获取成功',
    );
  }

  async listLearningRecords(payload: ListLearningRecordsPayload = {}) {
    const memberId = await this.resolveMemberId(payload.userId);
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const where = { memberId };

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.learningRecord.count({ where }),
      this.prisma.learningRecord.findMany({
        where,
        include: {
          textbook: {
            select: {
              textbookName: true,
            },
          },
          unit: {
            select: {
              text: true,
            },
          },
          part: {
            select: {
              title: true,
            },
          },
          session: {
            select: {
              title: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return paginate({
      items: rows.map((item) => this.serializeLearningRecord(item)),
      totalCount,
      pageNum,
      pageSize,
      message: '学习记录获取成功',
    });
  }

  /**
   * tutuNumber（图图号）→ Member.id。
   * 查不到时给出明确错误，避免「按 Member.id 查」导致的静默空列表。
   */
  private async resolveMemberId(tutuNumber: unknown) {
    const parsedTutuNumber = requireNumber(tutuNumber, '缺少图图号');
    const member = await this.prisma.member.findUnique({
      where: { tutuNumber: parsedTutuNumber },
      select: { id: true },
    });

    if (!member) {
      throw new BadRequestException('会员不存在');
    }

    return member.id;
  }

  private serializeInvite(item: InviteWithInvitee) {
    return {
      tutuNumber: item.invitee.tutuNumber,
      realName: item.invitee.realName,
      icon: item.invitee.icon || '',
      mobile: item.invitee.mobile || '',
      inviteTime: item.createdAt.toISOString(),
    };
  }

  private serializeLearningRecord(item: LearningRecordWithRelations) {
    return {
      textbookName: item.textbook?.textbookName || '',
      unitName: item.unit?.text || '',
      partName: item.part?.title || '',
      sessionName: item.session?.title || '',
      createdAt: item.createdAt.toISOString(),
    };
  }
}
