import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CourseBagActivitiesController } from './course-bag-activities.controller';
import { CourseBagActivitiesService } from './course-bag-activities.service';
import { CourseBagCoursesController } from './course-bag-courses.controller';
import { CourseBagCoursesService } from './course-bag-courses.service';
import { CourseBagsController } from './course-bags.controller';
import { CourseBagsService } from './course-bags.service';

@Module({
  imports: [AuthModule],
  controllers: [CourseBagsController, CourseBagCoursesController, CourseBagActivitiesController],
  providers: [CourseBagsService, CourseBagCoursesService, CourseBagActivitiesService],
})
export class CourseBagsModule {}
