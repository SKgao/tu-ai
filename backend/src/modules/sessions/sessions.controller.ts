import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  
} from '@nestjs/common';
import { BindSessionCustomPassDto } from './dto/bind-session-custom-pass.dto';
import { ChangeSessionCustomSortDto } from './dto/change-session-custom-sort.dto';
import { ChangeSessionStatusDto } from './dto/change-session-status.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionCustomPassesDto } from './dto/list-session-custom-passes.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';

/**
 * 大关卡管理（MISSING-API §4.5）。
 *
 * 说明：`pass/list/:textbookId`（教材下小关卡下拉候选）由 pass 模块实现，
 * 该接口按 query 分流：有 `textbookId` 按教材过滤，有 `partsId` 按 Part 过滤，URL 不变，不在本模块。
 */
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // 大关卡列表：返回裸数组（非分页结构）
  @Get('session/list/:textbookId')
  listSessions(@Param('textbookId', ParseIntPipe) textbookId: number) {
    return this.sessionsService.listSessions(textbookId);
  }

  @Post('session/add')
  createSession(@Body() payload: CreateSessionDto) {
    return this.sessionsService.createSession(payload);
  }

  @Post('session/update')
  updateSession(@Body() payload: UpdateSessionDto) {
    return this.sessionsService.updateSession(payload);
  }

  // 写操作统一使用 POST，路径形态与前端保持一致（前端 service 由 GET 改为 POST）。
  @Post('session/delete/:id')
  deleteSession(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.deleteSession(id);
  }

  // 启停参数走 query：?id=1&status=2
  @Post('session/changeStatus')
  changeStatus(@Query() payload: ChangeSessionStatusDto) {
    return this.sessionsService.changeStatus(payload);
  }

  // 绑定参数走 query：?textbookId=1&sessionId=2&customPassId=3
  @Post('session/bind')
  bindCustomPass(@Query() payload: BindSessionCustomPassDto) {
    return this.sessionsService.bindCustomPass(payload);
  }

  // 已绑定小关卡列表：返回裸数组
  @Post('session/custom/list')
  listCustomPasses(@Query() payload: ListSessionCustomPassesDto) {
    return this.sessionsService.listCustomPasses(payload);
  }

  // id = 绑定行 id（SessionCustomPass.id）
  @Post('session/unbind/:id')
  unbindCustomPass(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.unbindCustomPass(id);
  }

  // 调整绑定顺序：?id=绑定行 id&sort=3
  @Post('session/change/sort')
  changeCustomPassSort(@Query() payload: ChangeSessionCustomSortDto) {
    return this.sessionsService.changeCustomPassSort(payload);
  }
}
