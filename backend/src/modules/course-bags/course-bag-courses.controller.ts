import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { CourseBagCourseMutationDto } from './dto/course-bag-course.dto';
import { CourseBagCoursesService } from './course-bag-courses.service';

function mergePayload<T extends object>(query: T, body: T) {
  return {
    ...(query || {}),
    ...(body || {}),
  };
}

@Controller()
@UseGuards(TokenAuthGuard)
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

  @Get('course/changeStatus')
  changeCourseBagCourseStatus(@Query() payload: CourseBagCourseMutationDto) {
    return this.courseBagCoursesService.changeCourseBagCourseStatus(payload);
  }

  @Get('course/delete/:id')
  deleteCourseBagCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseBagCoursesService.deleteCourseBagCourse(id);
  }
}
