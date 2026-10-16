import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, SourceMaterial } from '@prisma/client';
import {
  getSend2LineBaseUrl,
  getSourceAudioDownloadBaseUrl,
  getSubjectSourceImportBaseUrl,
} from '../../common/env';
import {
  parseDate,
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, contains, dateRange, eq, inArray } from '../../prisma/where';
import { CreateSourceMaterialDto } from './dto/create-source-material.dto';
import { ImportSubjectSourcesDto } from './dto/import-subject-sources.dto';
import { ListSourceMaterialsDto } from './dto/list-source-materials.dto';
import { UpdateSourceMaterialDto } from './dto/update-source-material.dto';

@Injectable()
export class SourceMaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSourceMaterials(payload: ListSourceMaterialsDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);
    const text = toOptionalString(payload.text);

    // 注意：这里没有 textbookId 过滤，素材是跨教材的全局库。
    const where = composeWhere<Prisma.SourceMaterialWhereInput>(
      dateRange('createdAt', startTime, endTime),
      text ? (this.isExactLike(payload.openLike) ? eq('text', text) : contains('text', text)) : undefined,
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.sourceMaterial.count({ where }),
      this.prisma.sourceMaterial.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '素材列表获取成功',
      data: {
        data: rows.map((item) => this.serializeSourceMaterial(item)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createSourceMaterial(payload: CreateSourceMaterialDto) {
    const text = requireText(payload.text, '素材内容不能为空');
    const textbookId = requireNumber(payload.textbookId, '请选择教材');
    await this.assertCourseExists(textbookId);

    await this.prisma.sourceMaterial.create({
      data: {
        text,
        textbookId,
        icon: toOptionalString(payload.icon) || '',
        audio: toOptionalString(payload.audio) || '',
        translation: toOptionalString(payload.translation) || '',
        explainsArray: toOptionalString(payload.explainsArray) || '',
      },
    });

    return {
      code: 0,
      message: '素材创建成功',
      data: true,
    };
  }

  /**
   * 更新素材。前端提交的是全量业务字段，但这里仍按「传入即更新」处理，
   * 并且**永远不写 textbookId**（该字段不属于本接口的契约）。
   */
  async updateSourceMaterial(payload: UpdateSourceMaterialDto) {
    const id = requireNumber(payload.id, '缺少素材 ID');
    await this.assertSourceMaterialExists(id);

    const data: Prisma.SourceMaterialUncheckedUpdateInput = {};

    if (payload.text !== undefined) {
      data.text = requireText(payload.text, '素材内容不能为空');
    }
    if (payload.icon !== undefined) {
      data.icon = toOptionalString(payload.icon) || '';
    }
    if (payload.audio !== undefined) {
      data.audio = toOptionalString(payload.audio) || '';
    }
    if (payload.translation !== undefined) {
      data.translation = toOptionalString(payload.translation) || '';
    }
    if (payload.explainsArray !== undefined) {
      data.explainsArray = toOptionalString(payload.explainsArray) || '';
    }

    await this.prisma.sourceMaterial.update({
      where: { id },
      data,
    });

    return {
      code: 0,
      message: '素材更新成功',
      data: true,
    };
  }

  async deleteSourceMaterial(id: number) {
    await this.assertSourceMaterialExists(id);
    await this.prisma.sourceMaterial.deleteMany({ where: { id } });

    return {
      code: 0,
      message: '素材删除成功',
      data: true,
    };
  }

  /** 批量删除：请求体是裸 number[]。 */
  async batchDeleteSourceMaterials(ids: number[]) {
    const targetIds = this.normalizeIds(ids, '请选择要删除的素材');

    const result = await this.prisma.sourceMaterial.deleteMany({
      where: inArray('id', targetIds),
    });

    return {
      code: 0,
      message: '素材批量删除成功',
      data: true,
      deletedCount: result.count,
    };
  }

  /**
   * 批量下载音频：依赖仓库外的打包/下载服务，协议不可见。
   * 未配置地址时抛出明确错误，绝不静默假装成功。
   */
  async batchDownloadSourceMaterialAudio(ids: number[]) {
    const targetIds = this.normalizeIds(ids, '请选择要下载的素材');

    this.failExternalDependency(
      'SOURCE_AUDIO_DOWNLOAD_BASE_URL',
      getSourceAudioDownloadBaseUrl(),
      '批量下载音频',
    );

    return {
      code: 0,
      message: '素材音频批量下载成功',
      data: true,
      ids: targetIds,
    };
  }

  /**
   * 批量同步到外部 line 系统（test/send2line/* 不是单元测试接口）。
   * 同样只做配置探测 + 明确报错。
   */
  async syncSourceMaterialsToLine(ids: number[]) {
    const targetIds = this.normalizeIds(ids, '请选择要同步的素材');

    this.failExternalDependency('SEND2LINE_BASE_URL', getSend2LineBaseUrl(), '同步');

    return {
      code: 0,
      message: '素材同步成功',
      data: true,
      ids: targetIds,
    };
  }

  /**
   * 题目-素材导入：提交的是**文件名数组**（audioArray / imageArray / sentensArray），
   * 正常返回 HTML 字符串（前端用 dangerouslySetInnerHTML 渲染）。
   * 外部服务未配置时抛错。
   */
  async importSubjectSources(payload: ImportSubjectSourcesDto) {
    const textbookId = requireNumber(payload.textbookId, '请选择教材');
    await this.assertCourseExists(textbookId);

    this.failExternalDependency(
      'SUBJECT_SOURCE_IMPORT_BASE_URL',
      getSubjectSourceImportBaseUrl(),
      '导入题目素材',
    );

    return '';
  }

  /**
   * openLike 语义：`''`（缺省）= 模糊，`1` = 精确。
   * 前端在模糊搜索时因 compactPayload 根本不会发送该字段，所以缺省即模糊。
   */
  private isExactLike(openLike: unknown) {
    return Number(openLike) === 1;
  }

  private normalizeIds(ids: unknown, message: string): number[] {
    const list = Array.isArray(ids) ? ids : [];
    const normalized = list
      .map((id) => toOptionalNumber(id))
      .filter((id): id is number => id !== undefined);

    if (!normalized.length) {
      throw new BadRequestException(message);
    }

    return normalized;
  }

  /**
   * 仓库外的服务（line 同步 / 音频打包下载 / 素材导入）协议不在本仓库内，
   * 所以这里绝不猜测协议：未配置地址直接报错；即使配置了地址也要求先确认协议。
   */
  private failExternalDependency(envName: string, endpoint: string | null, action: string): never {
    if (!endpoint) {
      throw new BadRequestException(`未配置 ${envName}，无法${action}`);
    }

    throw new BadRequestException(
      `已配置 ${envName}，但该外部服务的调用协议不在本仓库内，请先确认协议后再实现${action}`,
    );
  }

  private async assertSourceMaterialExists(id: number) {
    const material = await this.prisma.sourceMaterial.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!material) {
      throw new BadRequestException('素材不存在');
    }
  }

  private async assertCourseExists(textbookId: number) {
    const course = await this.prisma.course.findUnique({
      where: { textbookId },
      select: { textbookId: true },
    });
    if (!course) {
      throw new BadRequestException('教材不存在');
    }
  }

  private serializeSourceMaterial(item: SourceMaterial) {
    return {
      id: item.id,
      // 必须回传 textbookId，否则编辑弹窗的教材下拉为空。
      textbookId: item.textbookId,
      text: item.text,
      icon: item.icon || '',
      audio: item.audio || '',
      translation: item.translation || '',
      explainsArray: item.explainsArray || '',
      createdAt: item.createdAt.toISOString(),
    };
  }
}
