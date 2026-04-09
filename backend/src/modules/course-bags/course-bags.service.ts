import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseBag, CourseBagCourse } from '@prisma/client';
import { requireNumber, requireText, toOptionalNumber, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseBagMutationDto } from './dto/course-bag.dto';

type CourseBagListItem = CourseBag & {
  courses: CourseBagCourse[];
};

@Injectable()
export class CourseBagsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourseBags() {
    const rows = await this.prisma.courseBag.findMany({
      include: {
        courses: {
          orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        },
      },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    return {
      code: 0,
      message: '课程包列表获取成功',
      data: rows.map((item) => this.serializeCourseBag(item)),
    };
  }

  async createCourseBag(payload: CourseBagMutationDto) {
    const title = requireText(payload.title, '课程包名称不能为空');
    const existing = await this.prisma.courseBag.findUnique({
      where: { title },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('课程包名称已存在');
    }

    await this.prisma.courseBag.create({
      data: {
        title,
        icon: toOptionalString(payload.icon),
        sort: 0,
        status: 1,
      },
    });

    return {
      code: 0,
      message: '课程包创建成功',
      data: true,
    };
  }

  async updateCourseBag(payload: CourseBagMutationDto) {
    const id = requireNumber(payload.id, '缺少课程包 ID');
    const title = requireText(payload.title, '课程包名称不能为空');
    await this.assertCourseBagExists(id);

    const duplicate = await this.prisma.courseBag.findFirst({
      where: {
        title,
        id: {
          not: id,
        },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException('课程包名称已存在');
    }

    await this.prisma.courseBag.update({
      where: { id },
      data: {
        title,
        icon: toOptionalString(payload.icon),
        ...(payload.sort !== undefined ? { sort: toOptionalNumber(payload.sort, 0) ?? 0 } : {}),
      },
    });

    return {
      code: 0,
      message: '课程包更新成功',
      data: true,
    };
  }

  async changeCourseBagStatus(payload: CourseBagMutationDto) {
    const id = requireNumber(payload.id, '缺少课程包 ID');
    const status = requireNumber(payload.status, '缺少课程包状态');
    await this.assertCourseBagExists(id);

    if (![1, 2].includes(status)) {
      throw new BadRequestException('课程包状态不合法');
    }

    await this.prisma.courseBag.update({
      where: { id },
      data: { status },
    });

    return {
      code: 0,
      message: status === 1 ? '课程包已启用' : '课程包已禁用',
      data: true,
    };
  }

  async deleteCourseBag(id: number) {
    const bagId = requireNumber(id, '缺少课程包 ID');
    await this.assertCourseBagExists(bagId);

    await this.prisma.courseBag.delete({
      where: { id: bagId },
    });

    return {
      code: 0,
      message: '课程包删除成功',
      data: true,
    };
  }

  private async assertCourseBagExists(id: number) {
    const bag = await this.prisma.courseBag.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!bag) {
      throw new BadRequestException('课程包不存在');
    }
  }

  private serializeCourseBag(item: CourseBagListItem) {
    return {
      id: item.id,
      title: item.title,
      icon: item.icon || '',
      status: item.status,
      sort: item.sort,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      textBookDOS: item.courses.map((course) => ({
        id: course.id,
        bagId: course.bagId,
        name: course.name,
        icon: course.icon || '',
        status: course.status,
        sort: course.sort,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      })),
    };
  }
}
