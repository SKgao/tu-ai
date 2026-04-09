import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { CourseBagActivitiesService } from './course-bag-activities.service';
import { CourseBagActivityMutationDto } from './dto/course-bag-activity.dto';

@Controller()
@UseGuards(TokenAuthGuard)
export class CourseBagActivitiesController {
  constructor(private readonly courseBagActivitiesService: CourseBagActivitiesService) {}

  @Get('course/active/list/:id')
  listCourseBagActivities(@Param('id', ParseIntPipe) id: number) {
    return this.courseBagActivitiesService.listCourseBagActivities(id);
  }

  @Post('course/active/add')
  createCourseBagActivity(@Body() payload: CourseBagActivityMutationDto) {
    return this.courseBagActivitiesService.createCourseBagActivity(payload);
  }

  @Post('course/active/update')
  updateCourseBagActivity(@Body() payload: CourseBagActivityMutationDto) {
    return this.courseBagActivitiesService.updateCourseBagActivity(payload);
  }

  @Get('course/active/del/:id')
  deleteCourseBagActivity(@Param('id', ParseIntPipe) id: number) {
    return this.courseBagActivitiesService.deleteCourseBagActivity(id);
  }
}
