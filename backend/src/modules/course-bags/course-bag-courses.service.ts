import { BadRequestException, Injectable } from '@nestjs/common';
import { requireNumber, requireText, toOptionalNumber, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseBagCourseMutationDto } from './dto/course-bag-course.dto';

const COURSE_BAG_COURSE_ID_FLOOR = 1000;

@Injectable()
export class CourseBagCoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourseBagCourse(payload: CourseBagCourseMutationDto) {
    const bagId = requireNumber(payload.bagId, '缺少课程包 ID');
    const name = requireText(payload.name, '课程名称不能为空');
    await this.assertCourseBagExists(bagId);

    const nextId = await this.getNextCourseBagCourseId();
    await this.prisma.courseBagCourse.create({
      data: {
        id: nextId,
        bagId,
        name,
        icon: toOptionalString(payload.icon),
        sort: 0,
        status: 1,
      },
    });

    return {
      code: 0,
      message: '课程包课程创建成功',
      data: true,
    };
  }

  async updateCourseBagCourse(payload: CourseBagCourseMutationDto) {
    const id = requireNumber(payload.id, '缺少课程 ID');
    const name = requireText(payload.name, '课程名称不能为空');
    await this.assertCourseBagCourseExists(id);

    await this.prisma.courseBagCourse.update({
      where: { id },
      data: {
        name,
        icon: toOptionalString(payload.icon),
        ...(payload.sort !== undefined ? { sort: toOptionalNumber(payload.sort, 0) ?? 0 } : {}),
      },
    });

    return {
      code: 0,
      message: '课程包课程更新成功',
      data: true,
    };
  }

  async changeCourseBagCourseStatus(payload: CourseBagCourseMutationDto) {
    const id = requireNumber(payload.id, '缺少课程 ID');
    const status = requireNumber(payload.status, '缺少课程状态');
    await this.assertCourseBagCourseExists(id);

    if (![1, 2].includes(status)) {
      throw new BadRequestException('课程状态不合法');
    }

    await this.prisma.courseBagCourse.update({
      where: { id },
      data: { status },
    });

    return {
      code: 0,
      message: status === 1 ? '课程已启用' : '课程已禁用',
      data: true,
    };
  }

  async deleteCourseBagCourse(id: number) {
    const courseId = requireNumber(id, '缺少课程 ID');
    await this.assertCourseBagCourseExists(courseId);

    await this.prisma.courseBagCourse.delete({
      where: { id: courseId },
    });

    return {
      code: 0,
      message: '课程删除成功',
      data: true,
    };
  }

  private async getNextCourseBagCourseId() {
    const latest = await this.prisma.courseBagCourse.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    return Math.max(COURSE_BAG_COURSE_ID_FLOOR, latest?.id ?? COURSE_BAG_COURSE_ID_FLOOR) + 1;
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

  private async assertCourseBagCourseExists(id: number) {
    const course = await this.prisma.courseBagCourse.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!course) {
      throw new BadRequestException('课程不存在');
    }
  }
}
