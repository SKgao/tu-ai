import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { CreateSourceMaterialDto } from './dto/create-source-material.dto';
import { ImportSubjectSourcesDto } from './dto/import-subject-sources.dto';
import { ListSourceMaterialsDto } from './dto/list-source-materials.dto';
import { UpdateSourceMaterialDto } from './dto/update-source-material.dto';
import { SourceMaterialsService } from './source-materials.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class SourceMaterialsController {
  constructor(private readonly sourceMaterialsService: SourceMaterialsService) {}

  @Post('source/list')
  listSourceMaterials(@Body() payload: ListSourceMaterialsDto) {
    return this.sourceMaterialsService.listSourceMaterials(payload);
  }

  @Post('source/add')
  createSourceMaterial(@Body() payload: CreateSourceMaterialDto) {
    return this.sourceMaterialsService.createSourceMaterial(payload);
  }

  @Post('source/update')
  updateSourceMaterial(@Body() payload: UpdateSourceMaterialDto) {
    return this.sourceMaterialsService.updateSourceMaterial(payload);
  }

  // ⚠️ 必须声明在 source/delete/:id 之前，否则 `batch` 会被 :id 匹配并被 ParseIntPipe 拒掉。
  // 请求体是裸 number[]，因此刻意不套 class DTO（全局 ValidationPipe 会跳过原生数组类型）。
  @Post('source/delete/batch')
  batchDeleteSourceMaterials(@Body() ids: number[]) {
    return this.sourceMaterialsService.batchDeleteSourceMaterials(ids);
  }

  // 写操作统一使用 POST；前端原有的 GET 已同步改为 POST（路径不变）。
  @Post('source/delete/:id')
  deleteSourceMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.sourceMaterialsService.deleteSourceMaterial(id);
  }

  @Post('source/audio/down/batch')
  batchDownloadSourceMaterialAudio(@Body() ids: number[]) {
    return this.sourceMaterialsService.batchDownloadSourceMaterialAudio(ids);
  }

  @Post('test/send2line/source')
  syncSourceMaterialsToLine(@Body() ids: number[]) {
    return this.sourceMaterialsService.syncSourceMaterialsToLine(ids);
  }

  /** 返回 HTML 字符串（前端用 dangerouslySetInnerHTML 渲染）。 */
  @Post('subject/source/import')
  importSubjectSources(@Body() payload: ImportSubjectSourcesDto) {
    return this.sourceMaterialsService.importSubjectSources(payload);
  }
}
