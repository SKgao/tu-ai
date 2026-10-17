import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreatePassDto } from './dto/create-pass.dto';
import { DeletePassDto } from './dto/delete-pass.dto';
import { ListPassesDto } from './dto/list-passes.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { PassesService } from './passes.service';

@Controller()
export class PassesController {
  constructor(private readonly passesService: PassesService) {}

  /**
   * 同时注册 `pass/list` 与 `pass/list/:id`：
   * partsId 为空时前端会发出 `pass/list/`（尾斜杠、无路径参数），
   * 只注册带参数的路由会直接 404。
   */
  @Get(['pass/list', 'pass/list/:id'])
  listPasses(@Query() query: ListPassesDto) {
    return this.passesService.listPasses(query);
  }

  @Get('pass/subject')
  listSubjectTypes() {
    return this.passesService.listSubjectTypes();
  }

  @Post('pass/add')
  createPass(@Body() payload: CreatePassDto) {
    return this.passesService.createPass(payload);
  }

  @Post('pass/update')
  updatePass(@Body() payload: UpdatePassDto) {
    return this.passesService.updatePass(payload);
  }

  // 小关卡页的删除形态（query 参数），必须声明在带路径参数的路由之前
  @Post('pass/delete')
  deletePassByQuery(@Query() payload: DeletePassDto) {
    return this.passesService.deletePassByQuery(payload);
  }

  // 关卡页的删除形态（路径参数）
  @Post('pass/delete/:id')
  deletePass(@Param('id', ParseIntPipe) id: number) {
    return this.passesService.deletePass(id);
  }
}
