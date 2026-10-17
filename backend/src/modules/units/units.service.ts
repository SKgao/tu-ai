import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Unit } from '@prisma/client';
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
import { CreateUnitDto } from './dto/create-unit.dto';
import { ListUnitsDto } from './dto/list-units.dto';
import { LockUnitDto } from './dto/lock-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

type UnitWithCourse = Unit & { course?: { textbookName: string } | null };

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async listUnits(payload: ListUnitsDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);
    const textbookId = toOptionalNumber(payload.textBookId);

    const where = composeWhere<Prisma.UnitWhereInput>(
      dateRange('createdAt', startTime, endTime),
      eq('textbookId', textbookId),
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.unit.count({ where }),
      this.prisma.unit.findMany({
        where,
        include: {
          course: true,
        },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return paginate({
      items: rows.map((item) => this.serializeUnit(item)),
      totalCount,
      pageNum,
      pageSize,
      message: '单元列表获取成功',
    });
  }

  async createUnit(payload: CreateUnitDto) {
    const text = requireText(payload.text, '单元名称不能为空');
    const textbookId = requireNumber(payload.textBookId, '请选择教材');
    await this.assertCourseExists(textbookId);

    await this.prisma.unit.create({
      data: {
        text,
        icon: toOptionalString(payload.icon) || '',
        sort: toOptionalNumber(payload.sort, 0) ?? 0,
        canLock: 1,
        textbookId,
      },
    });

    return ok(true, '单元创建成功');
  }

  async updateUnit(payload: UpdateUnitDto) {
    const id = requireNumber(payload.id, '缺少单元 ID');
    await this.assertUnitExists(id);

    const textbookId = requireNumber(payload.textBookId, '请选择教材');
    await this.assertCourseExists(textbookId);

    await this.prisma.unit.update({
      where: { id },
      data: {
        text: requireText(payload.text, '单元名称不能为空'),
        icon: toOptionalString(payload.icon) || '',
        sort: toOptionalNumber(payload.sort, 0) ?? 0,
        textbookId,
      },
    });

    return ok(true, '单元更新成功');
  }

  async deleteUnit(id: number) {
    await this.assertUnitExists(id);
    await this.prisma.unit.deleteMany({ where: { id } });

    return ok(true, '单元删除成功');
  }

  async lockUnit(payload: LockUnitDto) {
    const id = requireNumber(payload.unitId, '缺少单元 ID');
    const canLock = requireNumber(payload.canLock, '缺少锁定状态');
    await this.assertUnitExists(id);

    await this.prisma.unit.update({
      where: { id },
      data: { canLock },
    });

    return ok(true, canLock === 1 ? '单元已解锁' : '单元已锁定');
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

  private async assertCourseExists(textbookId: number) {
    const course = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!course) {
      throw new BadRequestException('教材不存在');
    }
  }

  private serializeUnit(item: UnitWithCourse) {
    return {
      id: item.id,
      text: item.text,
      icon: item.icon || '',
      textBookId: item.textbookId,
      textBookName: item.course?.textbookName || '',
      sort: item.sort,
      canLock: item.canLock,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
