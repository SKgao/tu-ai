import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { ListSubjectsDto } from './dto/list-subjects.dto';
import { ScenePicDto } from './dto/scene-pic.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@Controller()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post('subject/subject/list')
  listSubjects(@Body() payload: ListSubjectsDto) {
    return this.subjectsService.listSubjects(payload);
  }

  @Post('subject/add/one')
  createSubject(@Body() payload: CreateSubjectDto) {
    return this.subjectsService.createSubject(payload);
  }

  @Post('subject/subject/update')
  updateSubject(@Body() payload: UpdateSubjectDto) {
    return this.subjectsService.updateSubject(payload);
  }

  // 拼写 `decs` 是前端既有约定（正确拼写 desc），保持原样，否则前端 404。
  @Get('subject/decs/:topicId')
  getSubjectDetail(@Param('topicId', ParseIntPipe) topicId: number) {
    return this.subjectsService.getSubjectDetail(topicId);
  }

  // 必须声明在 `subject/delete/:id` 之前，否则 batch 会被 :id 路由吞掉并被 ParseIntPipe 拒绝。
  // body 是裸 number[]，不套 DTO：全局 ValidationPipe({ whitelist: true }) 会跳过原生数组。
  @Post('subject/delete/batch')
  deleteSubjects(@Body() ids: number[]) {
    return this.subjectsService.deleteSubjects(ids);
  }

  // 写操作统一 POST，路径形态与前端保持一致（前端原先用 GET，已同步改为 POST）。
  @Post('subject/delete/:id')
  deleteSubject(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.deleteSubject(id);
  }

  // 场景图参数走 query：?id=&scenePic=
  @Post('subject/upload/pic')
  createScenePic(@Query() payload: ScenePicDto) {
    return this.subjectsService.createScenePic(payload);
  }

  @Post('subject/upload/pic/update')
  updateScenePic(@Query() payload: ScenePicDto) {
    return this.subjectsService.updateScenePic(payload);
  }

  // 路径参数是题目 id（不是图片 id）
  @Post('subject/del/pic/:id')
  deleteScenePic(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.deleteScenePic(id);
  }
}
