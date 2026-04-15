import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { CreateCourseUserDto } from './dto/create-course-user.dto';
import { ListCourseUsersDto } from './dto/list-course-users.dto';
import { ListSpecialCoursesDto } from './dto/list-special-courses.dto';
import { SpecialCourseMutationDto } from './dto/special-course.dto';
import { SpecialCoursesService } from './special-courses.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class SpecialCoursesController {
  constructor(private readonly specialCoursesService: SpecialCoursesService) {}

  @Post('special-course/list')
  listSpecialCourses(@Body() payload: ListSpecialCoursesDto) {
    return this.specialCoursesService.listSpecialCourses(payload);
  }

  @Get('special-course/member/:userId')
  listBoughtSpecialCourses(@Param('userId', ParseIntPipe) userId: number) {
    return this.specialCoursesService.listBoughtSpecialCourses(userId);
  }

  @Post('special-course/add')
  createSpecialCourse(@Body() payload: SpecialCourseMutationDto) {
    return this.specialCoursesService.createSpecialCourse(payload);
  }

  @Post('special-course/update')
  updateSpecialCourse(@Body() payload: SpecialCourseMutationDto) {
    return this.specialCoursesService.updateSpecialCourse(payload);
  }

  @Get('special-course/delete/:textbookId')
  deleteSpecialCourse(@Param('textbookId', ParseIntPipe) textbookId: number) {
    return this.specialCoursesService.deleteSpecialCourse(textbookId);
  }

  @Get('special-course/up/:textbookId')
  upSpecialCourse(@Param('textbookId', ParseIntPipe) textbookId: number) {
    return this.specialCoursesService.changeSpecialCourseStatus(textbookId, 1);
  }

  @Get('special-course/down/:textbookId')
  downSpecialCourse(@Param('textbookId', ParseIntPipe) textbookId: number) {
    return this.specialCoursesService.changeSpecialCourseStatus(textbookId, 2);
  }

  @Post('special-course/options')
  listSpecialCourseOptions() {
    return this.specialCoursesService.listSpecialCourseOptions();
  }

  @Post('course/user/list')
  listCourseUsers(@Body() payload: ListCourseUsersDto) {
    return this.specialCoursesService.listCourseUsers(payload);
  }

  @Post('course/user/add')
  createCourseUser(@Body() payload: CreateCourseUserDto) {
    return this.specialCoursesService.createCourseUser(payload);
  }
}
