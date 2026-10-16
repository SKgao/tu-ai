import { BadRequestException, Injectable } from '@nestjs/common';
import { Pass, Prisma } from '@prisma/client';
import {
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePassDto } from './dto/create-pass.dto';
import { DeletePassDto } from './dto/delete-pass.dto';
import { ListPassesDto } from './dto/list-passes.dto';
import { UpdatePassDto } from './dto/update-pass.dto';

@Injectable()
export class PassesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 关卡 / 小关卡列表。
   *
   * `pass/list/:id` 这个路径被三个页面复用，`:id` 的含义在不同页面并不相同
   * （关卡页是 partsId，小关卡/大关卡页是 textbookId）。按用户拍板的方案，
   * 这里以 **query 中的键** 作为唯一判别依据，路径参数只作兼容保留。
   */
  async listPasses(query: ListPassesDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(query.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(query.pageSize) ?? 10);
    const partsId = toOptionalNumber(query.partsId);
    const textbookId = toOptionalNumber(query.textbookId);

    let where: Prisma.PassWhereInput;
    if (partsId !== undefined) {
      where = { partsId };
    } else if (textbookId !== undefined) {
      where = { textbookId };
    } else {
      // 不猜维度：宁可明确报错，也不要返回一个「看起来对」的列表
      throw new BadRequestException('缺少 partsId 或 textbookId，无法确定关卡列表的筛选维度');
    }

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.pass.count({ where }),
      this.prisma.pass.findMany({
        where,
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '关卡列表获取成功',
      data: {
        data: rows.map((item) => this.serializePass(item)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createPass(payload: CreatePassDto) {
    const title = requireText(payload.title, '关卡标题不能为空');
    const kind = this.resolveKind(payload.partsId, payload.textbookId);

    if (kind === 'part') {
      const partsId = requireNumber(payload.partsId, '缺少 Part ID');
      await this.assertPartExists(partsId);

      const subject = requireNumber(payload.subject, '请选择题型');

      await this.prisma.pass.create({
        data: {
          title,
          icon: toOptionalString(payload.icon) || '',
          sort: toOptionalNumber(payload.sort, 0) ?? 0,
          partsId,
          subject,
        },
      });

      return {
        code: 0,
        message: '关卡创建成功',
        data: true,
      };
    }

    // 小关卡：id 由客户端指定，且必须携带 textbookId
    const id = requireNumber(payload.id, '请填写小关卡 ID');
    const textbookId = requireNumber(payload.textbookId, '缺少教材 ID');
    await this.assertCourseExists(textbookId);
    await this.assertPassIdAvailable(id);

    await this.prisma.pass.create({
      data: {
        id,
        title,
        tmpTitle: toOptionalString(payload.tmpTitle) || '',
        icon: toOptionalString(payload.icon) || '',
        sort: toOptionalNumber(payload.sort, 0) ?? 0,
        textbookId,
      },
    });

    return {
      code: 0,
      message: '小关卡创建成功',
      data: true,
    };
  }

  async updatePass(payload: UpdatePassDto) {
    const id = requireNumber(payload.id, '缺少关卡 ID');
    await this.assertPassExists(id);

    const data: Prisma.PassUncheckedUpdateInput = {};

    if (payload.title !== undefined) {
      data.title = requireText(payload.title, '关卡标题不能为空');
    }
    if (payload.tmpTitle !== undefined) {
      data.tmpTitle = toOptionalString(payload.tmpTitle) || '';
    }
    if (payload.icon !== undefined) {
      data.icon = toOptionalString(payload.icon) || '';
    }
    if (payload.sort !== undefined) {
      data.sort = toOptionalNumber(payload.sort, 0) ?? 0;
    }
    if (payload.subject !== undefined) {
      data.subject = toOptionalNumber(payload.subject, 0) ?? 0;
    }
    if (payload.partsId !== undefined) {
      const partsId = requireNumber(payload.partsId, '缺少 Part ID');
      await this.assertPartExists(partsId);
      data.partsId = partsId;
    }
    if (payload.textbookId !== undefined) {
      const textbookId = requireNumber(payload.textbookId, '缺少教材 ID');
      await this.assertCourseExists(textbookId);
      data.textbookId = textbookId;
    }

    await this.prisma.pass.update({
      where: { id },
      data,
    });

    return {
      code: 0,
      message: '关卡更新成功',
      data: true,
    };
  }

  /** 关卡页：`pass/delete/:id` */
  async deletePass(id: number) {
    await this.assertPassExists(id);
    await this.prisma.pass.deleteMany({ where: { id } });

    return {
      code: 0,
      message: '关卡删除成功',
      data: true,
    };
  }

  /**
   * 小关卡页：`pass/delete?id=&textbookId=`。
   * 记录由 id 唯一确定，`textbookId` 仅为兼容前端既有调用而接收。
   */
  async deletePassByQuery(payload: DeletePassDto) {
    const id = requireNumber(payload.id, '缺少关卡 ID');
    return this.deletePass(id);
  }

  /** 题型字典（pass/subject）。返回结构为双层 data，前端读 `response.data.data.data`。 */
  async listSubjectTypes() {
    const rows = await this.prisma.subjectType.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    return {
      code: 0,
      message: '题型列表获取成功',
      data: {
        data: rows.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      },
    };
  }

  private resolveKind(partsId: unknown, textbookId: unknown): 'part' | 'textbook' {
    const hasParts = partsId !== undefined && partsId !== null && partsId !== '';
    const hasTextbook = textbookId !== undefined && textbookId !== null && textbookId !== '';

    if (hasParts === hasTextbook) {
      throw new BadRequestException(
        '必须且只能指定 partsId（关卡）或 textbookId（小关卡）其中之一',
      );
    }

    return hasParts ? 'part' : 'textbook';
  }

  private async assertPassExists(id: number) {
    const pass = await this.prisma.pass.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!pass) {
      throw new BadRequestException('关卡不存在');
    }
  }

  private async assertPassIdAvailable(id: number) {
    const pass = await this.prisma.pass.findUnique({
      where: { id },
      select: { id: true },
    });
    if (pass) {
      throw new BadRequestException('小关卡 ID 已存在');
    }
  }

  private async assertPartExists(id: number) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!part) {
      throw new BadRequestException('Part 不存在');
    }
  }

  private async assertCourseExists(textbookId: number) {
    const course = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!course) {
      throw new BadRequestException('教材不存在');
    }
  }

  private serializePass(item: Pass) {
    return {
      id: item.id,
      title: item.title,
      tmpTitle: item.tmpTitle || '',
      icon: item.icon || '',
      sort: item.sort,
      partsId: item.partsId ?? '',
      textbookId: item.textbookId ?? '',
      subject: item.subject ?? '',
      customerNumber: item.customerNumber,
      totalScore: item.totalScore,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
