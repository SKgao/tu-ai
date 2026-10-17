import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CourseBagCourseMutationDto } from './dto/course-bag-course.dto';
import { CourseBagCoursesService } from './course-bag-courses.service';

function mergePayload<T extends object>(query: T, body: T) {
  return {
    ...(query || {}),
    ...(body || {}),
  };
}

@Controller()
export class CourseBagCoursesController {
  constructor(private readonly courseBagCoursesService: CourseBagCoursesService) {}

  @Post('course/add')
  createCourseBagCourse(
    @Query() query: CourseBagCourseMutationDto,
    @Body() body: CourseBagCourseMutationDto,
  ) {
    return this.courseBagCoursesService.createCourseBagCourse(mergePayload(query, body));
  }

  @Post('course/update')
  updateCourseBagCourse(
    @Query() query: CourseBagCourseMutationDto,
    @Body() body: CourseBagCourseMutationDto,
  ) {
    return this.courseBagCoursesService.updateCourseBagCourse(mergePayload(query, body));
  }

  // 写操作统一使用 POST；参数仍然从 query 读取，保持与前端既有调用一致。
  @Post('course/changeStatus')
  changeCourseBagCourseStatus(@Query() payload: CourseBagCourseMutationDto) {
    return this.courseBagCoursesService.changeCourseBagCourseStatus(payload);
  }

  @Post('course/delete/:id')
  deleteCourseBagCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseBagCoursesService.deleteCourseBagCourse(id);
  }
}
