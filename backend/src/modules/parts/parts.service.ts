import { BadRequestException, Injectable } from '@nestjs/common';
import { Part, Prisma } from '@prisma/client';
import {
  parseDate,
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { ok, paginate } from '../../common/response';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, dateRange, eq } from '../../prisma/where';
import { CreatePartDto } from './dto/create-part.dto';
import { ListPartsDto } from './dto/list-parts.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  async listParts(payload: ListPartsDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);
    const unitsId = toOptionalNumber(payload.unitId);

    const where = composeWhere<Prisma.PartWhereInput>(
      dateRange('createdAt', startTime, endTime),
      eq('unitsId', unitsId),
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.part.count({ where }),
      this.prisma.part.findMany({
        where,
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return paginate({
      items: rows.map((item) => this.serializePart(item)),
      totalCount,
      pageNum,
      pageSize,
      message: 'Part 列表获取成功',
    });
  }

  async createPart(payload: CreatePartDto) {
    const title = requireText(payload.title, 'Part 名称不能为空');
    const unitsId = requireNumber(payload.unitsId, '缺少单元 ID');
    await this.assertUnitExists(unitsId);

    await this.prisma.part.create({
      data: {
        title,
        icon: toOptionalString(payload.icon) || '',
        tips: toOptionalString(payload.tips) || '',
        sort: toOptionalNumber(payload.sort, 0) ?? 0,
        canLock: 1,
        unitsId,
      },
    });

    return ok(true, 'Part 创建成功');
  }

  /**
   * 该接口既用于编辑提交（全量字段），也用于锁定/解锁切换（只传 id + canLock），
   * 因此按「传入即更新」的部分更新语义处理。
   */
  async updatePart(payload: UpdatePartDto) {
    const id = requireNumber(payload.id, '缺少 Part ID');
    await this.assertPartExists(id);

    const data: Prisma.PartUncheckedUpdateInput = {};

    if (payload.title !== undefined) {
      data.title = requireText(payload.title, 'Part 名称不能为空');
    }
    if (payload.icon !== undefined) {
      data.icon = toOptionalString(payload.icon) || '';
    }
    if (payload.tips !== undefined) {
      data.tips = toOptionalString(payload.tips) || '';
    }
    if (payload.sort !== undefined) {
      data.sort = toOptionalNumber(payload.sort, 0) ?? 0;
    }
    if (payload.canLock !== undefined) {
      data.canLock = toOptionalNumber(payload.canLock, 1) ?? 1;
    }
    if (payload.unitsId !== undefined) {
      const unitsId = requireNumber(payload.unitsId, '缺少单元 ID');
      await this.assertUnitExists(unitsId);
      data.unitsId = unitsId;
    }

    await this.prisma.part.update({
      where: { id },
      data,
    });

    return ok(true, 'Part 更新成功');
  }

  async deletePart(id: number) {
    await this.assertPartExists(id);
    await this.prisma.part.deleteMany({ where: { id } });

    return ok(true, 'Part 删除成功');
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

  private async assertUnitExists(id: number) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!unit) {
      throw new BadRequestException('单元不存在');
    }
  }

  private serializePart(item: Part) {
    return {
      id: item.id,
      title: item.title,
      icon: item.icon || '',
      tips: item.tips || '',
      sort: item.sort,
      canLock: item.canLock,
      unitsId: item.unitsId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
