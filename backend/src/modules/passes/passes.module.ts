import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PassesController } from './passes.controller';
import { PassesService } from './passes.service';

@Module({
  imports: [AuthModule],
  controllers: [PassesController],
  providers: [PassesService],
})
export class PassesModule {}
