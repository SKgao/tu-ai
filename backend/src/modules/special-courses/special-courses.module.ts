import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpecialCoursesController } from './special-courses.controller';
import { SpecialCoursesService } from './special-courses.service';

@Module({
  imports: [AuthModule],
  controllers: [SpecialCoursesController],
  providers: [SpecialCoursesService],
})
export class SpecialCoursesModule {}
