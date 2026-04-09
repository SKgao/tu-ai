import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { GrantVipDto } from './dto/grant-vip.dto';
import { ListMemberFeedbackDto } from './dto/list-member-feedback.dto';
import { ListMembersDto } from './dto/list-members.dto';
import { CreateMemberLevelDto, UpdateMemberLevelDto } from './dto/member-level.dto';
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
  createMemberLevel(@Body() payload: CreateMemberLevelDto) {
    return this.membersService.createMemberLevel(payload);
  }

  @Post('member/level/update')
  updateMemberLevel(@Body() payload: UpdateMemberLevelDto) {
    return this.membersService.updateMemberLevel(payload);
  }

  @Get('member/level/delete/:userLevel')
  deleteMemberLevel(@Param('userLevel', ParseIntPipe) userLevel: number) {
    return this.membersService.deleteMemberLevel(userLevel);
  }

  @Post('member/all/list')
  listMembers(@Body() payload: ListMembersDto) {
    return this.membersService.listMembers(payload);
  }

  @Post('member/list')
  listMemberInfos(@Body() payload: ListMembersDto) {
    return this.membersService.listMembers(payload);
  }

  @Post('member/feed/list')
  listMemberFeedback(@Body() payload: ListMemberFeedbackDto) {
    return this.membersService.listMemberFeedback(payload);
  }

  @Get('member/startup/:id')
  enableMember(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.enableMember(id);
  }

  @Get('member/forbidden/:id')
  disableMember(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.disableMember(id);
  }

  @Post('member/vip/add')
  grantVip(@Body() payload: GrantVipDto) {
    return this.membersService.grantVip(payload);
  }
}
