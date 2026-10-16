import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MemberRecordsController } from './member-records.controller';
import { MemberRecordsService } from './member-records.service';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [AuthModule],
  controllers: [MembersController, MemberRecordsController],
  providers: [MembersService, MemberRecordsService],
})
export class MembersModule {}
