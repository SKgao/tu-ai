import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { ActivitiesService } from './activities.service';
import { ChangeActivityStatusDto } from './dto/change-activity-status.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ListActivitiesDto } from './dto/list-activities.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller()
@UseGuards(TokenAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post('activity/list')
  listActivities(@Body() payload: ListActivitiesDto) {
    return this.activitiesService.listActivities(payload);
  }

  @Get('activity/list/combox')
  listActivityOptions() {
    return this.activitiesService.listActivityOptions();
  }

  @Post('activity/add')
  createActivity(@Body() payload: CreateActivityDto) {
    return this.activitiesService.createActivity(payload);
  }

  @Post('activity/update')
  updateActivity(@Body() payload: UpdateActivityDto) {
    return this.activitiesService.updateActivity(payload);
  }

  @Get('activity/delete/:id')
  deleteActivity(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.deleteActivity(id);
  }

  @Post('activity/change/status')
  changeStatus(@Body() payload: ChangeActivityStatusDto) {
    return this.activitiesService.changeStatus(payload);
  }
}
