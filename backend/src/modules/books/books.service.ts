import { BadRequestException, Injectable } from '@nestjs/common';
import { BookVersion, Course, Grade, Prisma } from '@prisma/client';
import { parseDate, requireNumber, requireText, toOptionalNumber, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, dateRange, eq } from '../../prisma/where';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksDto } from './dto/list-books.dto';
import { UpdateGradeDto, UpdateBookVersionDto } from './dto/resource.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateBookLockDto } from './dto/update-book-lock.dto';

type BookListItem = Course & {
  grade?: Grade | null;
  bookVersion?: BookVersion | null;
};

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async listGrades() {
    const rows = await this.prisma.grade.findMany({
      orderBy: [{ status: 'asc' }, { id: 'asc' }],
    });

    return {
      code: 0,
      message: '年级列表获取成功',
      data: rows.map((item) => this.serializeGrade(item)),
    };
  }

  async createGrade(name: unknown) {
    const gradeName = requireText(name, '年级名称不能为空');
    const existing = await this.prisma.grade.findUnique({
      where: { gradeName },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('年级名称已存在');
    }

    await this.prisma.grade.create({
      data: {
        gradeName,
      },
    });

    return {
      code: 0,
      message: '年级创建成功',
      data: true,
    };
  }

  async updateGrade(payload: UpdateGradeDto) {
    const id = requireNumber(payload.id, '缺少年级 ID');
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!grade) {
      throw new BadRequestException('年级不存在');
    }

    await this.prisma.grade.update({
      where: { id },
      data: {
        gradeName: requireText(payload.gradeName, '年级名称不能为空'),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
      },
    });

    return {
      code: 0,
      message: '年级更新成功',
      data: true,
    };
  }

  async deleteGrade(id: number) {
    const gradeId = requireNumber(id, '缺少年级 ID');
    await this.assertGradeExists(gradeId);

    await this.prisma.grade.delete({
      where: { id: gradeId },
    });

    return {
      code: 0,
      message: '年级删除成功',
      data: true,
    };
  }

  async listVersions() {
    const rows = await this.prisma.bookVersion.findMany({
      orderBy: [{ id: 'asc' }],
    });

    return {
      code: 0,
      message: '教材版本列表获取成功',
      data: rows.map((item) => this.serializeBookVersion(item)),
    };
  }

  async createVersion(name: unknown) {
    const versionName = requireText(name, '教材版本名称不能为空');
    const existing = await this.prisma.bookVersion.findUnique({
      where: { name: versionName },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('教材版本名称已存在');
    }

    await this.prisma.bookVersion.create({
      data: {
        name: versionName,
      },
    });

    return {
      code: 0,
      message: '教材版本创建成功',
      data: true,
    };
  }

  async updateVersion(payload: UpdateBookVersionDto) {
    const id = requireNumber(payload.id, '缺少教材版本 ID');
    const version = await this.prisma.bookVersion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!version) {
      throw new BadRequestException('教材版本不存在');
    }

    await this.prisma.bookVersion.update({
      where: { id },
      data: {
        name: requireText(payload.name, '教材版本名称不能为空'),
      },
    });

    return {
      code: 0,
      message: '教材版本更新成功',
      data: true,
    };
  }

  async deleteVersion(id: number) {
    const versionId = requireNumber(id, '缺少教材版本 ID');
    await this.assertBookVersionExists(versionId);

    await this.prisma.bookVersion.delete({
      where: { id: versionId },
    });

    return {
      code: 0,
      message: '教材版本删除成功',
      data: true,
    };
  }

  async listBooks(payload: ListBooksDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);
    const gradeId = toOptionalNumber(payload.gradeId);
    const bookVersionId = toOptionalNumber(payload.bookVersionId);

    const where = composeWhere<Prisma.CourseWhereInput>(
      dateRange('createdAt', startTime, endTime),
      eq('gradeId', gradeId),
      eq('bookVersionId', bookVersionId),
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: {
          grade: true,
          bookVersion: true,
        },
        orderBy: [{ grade: { status: 'asc' } }, { sortValue: 'asc' }, { textbookId: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '教材列表获取成功',
      data: {
        data: rows.map((item) => this.serializeBook(item)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createBook(payload: CreateBookDto) {
    const textbookName = requireText(payload.name, '教材名称不能为空');
    await this.assertGradeExists(requireNumber(payload.gradeId, '请选择年级'));
    await this.assertBookVersionExists(requireNumber(payload.bookVersionId, '请选择教材版本'));

    const existing = await this.prisma.course.findFirst({
      where: {
        textbookName,
      },
      select: { textbookId: true },
    });
    if (existing) {
      throw new BadRequestException('教材名称已存在');
    }

    const lastBook = await this.prisma.course.findFirst({
      orderBy: { textbookId: 'desc' },
      select: { textbookId: true },
    });
    const textbookId = Math.max(101, (lastBook?.textbookId ?? 100) + 1);

    await this.prisma.course.create({
      data: {
        textbookId,
        textbookName,
        icon: toOptionalString(payload.icon),
        gradeId: payload.gradeId,
        bookVersionId: payload.bookVersionId,
        status: 1,
        sortValue: 0,
        canLock: 1,
      },
    });

    return {
      code: 0,
      message: '教材创建成功',
      data: true,
    };
  }

  async updateBook(payload: UpdateBookDto) {
    const textbookId = requireNumber(payload.id, '缺少教材 ID');
    const book = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!book) {
      throw new BadRequestException('教材不存在');
    }

    await this.assertGradeExists(requireNumber(payload.gradeId, '请选择年级'));
    await this.assertBookVersionExists(requireNumber(payload.bookVersionId, '请选择教材版本'));

    await this.prisma.course.update({
      where: { textbookId },
      data: {
        textbookName: requireText(payload.name, '教材名称不能为空'),
        icon: toOptionalString(payload.icon),
        gradeId: payload.gradeId,
        bookVersionId: payload.bookVersionId,
        ...(payload.status !== undefined ? { sortValue: payload.status } : {}),
      },
    });

    return {
      code: 0,
      message: '教材更新成功',
      data: true,
    };
  }

  async deleteBook(id: number) {
    const textbookId = requireNumber(id, '缺少教材 ID');
    const book = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!book) {
      throw new BadRequestException('教材不存在');
    }

    await this.prisma.course.delete({
      where: { textbookId },
    });

    return {
      code: 0,
      message: '教材删除成功',
      data: true,
    };
  }

  async updateBookLock(payload: UpdateBookLockDto) {
    const textbookId = requireNumber(payload.textbookId, '缺少教材 ID');
    const canLock = requireNumber(payload.canLock, '缺少锁定状态');
    const book = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!book) {
      throw new BadRequestException('教材不存在');
    }

    await this.prisma.course.update({
      where: { textbookId },
      data: {
        canLock,
      },
    });

    return {
      code: 0,
      message: canLock === 1 ? '教材解锁成功' : '教材锁定成功',
      data: true,
    };
  }

  private async assertGradeExists(id: number) {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!grade) {
      throw new BadRequestException('年级不存在');
    }
  }

  private async assertBookVersionExists(id: number) {
    const version = await this.prisma.bookVersion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!version) {
      throw new BadRequestException('教材版本不存在');
    }
  }

  private serializeGrade(item: Grade) {
    return {
      id: item.id,
      gradeName: item.gradeName,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private serializeBookVersion(item: BookVersion) {
    return {
      id: item.id,
      name: item.name,
      memo: '版本资源',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private serializeBook(item: BookListItem) {
    return {
      id: item.textbookId,
      name: item.textbookName,
      icon: item.icon || '',
      gradeId: item.gradeId ?? '',
      gradeName: item.grade?.gradeName || '',
      bookVersionId: item.bookVersionId ?? '',
      bookVersionName: item.bookVersion?.name || '',
      createdAt: item.createdAt.toISOString(),
      status: item.sortValue,
      canLock: item.canLock,
    };
  }
}
