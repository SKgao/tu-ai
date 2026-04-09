import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { CourseBagMutationDto } from './dto/course-bag.dto';
import { CourseBagsService } from './course-bags.service';

function mergePayload<T extends object>(query: T, body: T) {
  return {
    ...(query || {}),
    ...(body || {}),
  };
}

@Controller()
@UseGuards(TokenAuthGuard)
export class CourseBagsController {
  constructor(private readonly courseBagsService: CourseBagsService) {}

  @Get('bag/list')
  listCourseBags() {
    return this.courseBagsService.listCourseBags();
  }

  @Post('bag/add')
  createCourseBag(
    @Query() query: CourseBagMutationDto,
    @Body() body: CourseBagMutationDto,
  ) {
    return this.courseBagsService.createCourseBag(mergePayload(query, body));
  }

  @Post('bag/update')
  updateCourseBag(
    @Query() query: CourseBagMutationDto,
    @Body() body: CourseBagMutationDto,
  ) {
    return this.courseBagsService.updateCourseBag(mergePayload(query, body));
  }

  @Post('bag/changeStatus')
  changeCourseBagStatus(
    @Query() query: CourseBagMutationDto,
    @Body() body: CourseBagMutationDto,
  ) {
    return this.courseBagsService.changeCourseBagStatus(mergePayload(query, body));
  }

  @Get('bag/delete/:id')
  deleteCourseBag(@Param('id', ParseIntPipe) id: number) {
    return this.courseBagsService.deleteCourseBag(id);
  }
}
