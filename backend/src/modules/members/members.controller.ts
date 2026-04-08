import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { MembersService } from './members.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('member/level/list')
  listMemberLevels() {
    return this.membersService.listMemberLevels();
  }

  @Get('member/level/list/combox')
  listMemberLevelOptions() {
    return this.membersService.listMemberLevelOptions();
  }

  @Post('member/level/add')
  createMemberLevel(@Body() payload: Record<string, unknown>) {
    return this.membersService.createMemberLevel(payload);
  }

  @Post('member/level/update')
  updateMemberLevel(@Body() payload: Record<string, unknown>) {
    return this.membersService.updateMemberLevel(payload);
  }

  @Get('member/level/delete/:userLevel')
  deleteMemberLevel(@Param('userLevel') userLevel: string) {
    return this.membersService.deleteMemberLevel(userLevel);
  }

  @Post('member/all/list')
  listMembers(@Body() payload: Record<string, unknown>) {
    return this.membersService.listMembers(payload);
  }

  @Post('member/list')
  listMemberInfos(@Body() payload: Record<string, unknown>) {
    return this.membersService.listMembers(payload);
  }

  @Post('member/feed/list')
  listMemberFeedback(@Body() payload: Record<string, unknown>) {
    return this.membersService.listMemberFeedback(payload);
  }

  @Get('member/startup/:id')
  enableMember(@Param('id') id: string) {
    return this.membersService.enableMember(id);
  }

  @Get('member/forbidden/:id')
  disableMember(@Param('id') id: string) {
    return this.membersService.disableMember(id);
  }

  @Post('member/vip/add')
  grantVip(@Body() payload: Record<string, unknown>) {
    return this.membersService.grantVip(payload);
  }
}
