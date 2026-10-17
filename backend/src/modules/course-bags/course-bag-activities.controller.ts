import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CourseBagActivitiesService } from './course-bag-activities.service';
import { CourseBagActivityMutationDto } from './dto/course-bag-activity.dto';

@Controller()
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

  @Post('course/active/del/:id')
  deleteCourseBagActivity(@Param('id', ParseIntPipe) id: number) {
    return this.courseBagActivitiesService.deleteCourseBagActivity(id);
  }
}
