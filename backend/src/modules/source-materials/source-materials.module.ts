import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SourceMaterialsController } from './source-materials.controller';
import { SourceMaterialsService } from './source-materials.service';

@Module({
  imports: [AuthModule],
  controllers: [SourceMaterialsController],
  providers: [SourceMaterialsService],
})
export class SourceMaterialsModule {}
