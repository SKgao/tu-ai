import { BadRequestException, Injectable } from '@nestjs/common';
import { Part, Pass, Prisma, SourceMaterial, Subject, Unit } from '@prisma/client';
import {
  parseDate,
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, contains, dateRange, eq, nested } from '../../prisma/where';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { ListSubjectsDto } from './dto/list-subjects.dto';
import { ScenePicDto } from './dto/scene-pic.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

/** Subject → Pass(小关卡) → Part → Unit，两层 join 出来的展示字段（不落库）。 */
type SubjectWithHierarchy = Subject & {
  customPass?: (Pass & { part?: (Part & { unit?: Unit | null }) | null }) | null;
};

const SUBJECT_HIERARCHY_INCLUDE = {
  customPass: {
    include: {
      part: {
        include: {
          unit: true,
        },
      },
    },
  },
} satisfies Prisma.SubjectInclude;

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSubjects(payload: ListSubjectsDto = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);
    const customsPassId = toOptionalNumber(payload.customsPassId);
    const customsPassName = toOptionalString(payload.customsPassName);
    const sourceIds = toOptionalString(payload.sourceIds);

    const where = composeWhere<Prisma.SubjectWhereInput>(
      dateRange('createdAt', startTime, endTime),
      eq('customsPassId', customsPassId),
      // 关卡名称不是本表列，按关系过滤 Pass.title。
      nested('customPass', customsPassName ? { title: { contains: customsPassName } } : undefined),
      contains('sourceIds', sourceIds),
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({
        where,
        include: SUBJECT_HIERARCHY_INCLUDE,
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '题目列表获取成功',
      data: {
        data: rows.map((item) => this.serializeSubject(item)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createSubject(payload: CreateSubjectDto) {
    const customsPassId = requireNumber(payload.customsPassId, '缺少关卡 ID');
    await this.assertPassExists(customsPassId);

    await this.prisma.subject.create({
      data: {
        customsPassId,
        // partId / sessionId 只做上下文透传，schema 里是可空 Int 且无 relation。
        partId: toOptionalNumber(payload.partId) ?? null,
        sessionId: toOptionalNumber(payload.sessionId) ?? null,
        subject: toOptionalNumber(payload.subject) ?? null,
        sourceIds: requireText(payload.sourceIds, '题目内容不能为空'),
        sort: toOptionalNumber(payload.sort, 0) ?? 0,
        showIndex: this.normalizeShowIndex(payload.showIndex),
        icon: toOptionalString(payload.icon) || '',
        audio: toOptionalString(payload.audio) || '',
        sentenceAudio: toOptionalString(payload.sentenceAudio) || '',
        sceneGraph: this.normalizeSceneGraph(payload.sceneGraph),
      },
    });

    return {
      code: 0,
      message: '题目创建成功',
      data: true,
    };
  }

  /**
   * 编辑接口是**部分更新**：只写调用方实际传了的字段。
   * `customsPassName` 是 `Pass.title` 的展示别名、不落库，因此只接收不写库。
   */
  async updateSubject(payload: UpdateSubjectDto) {
    const id = requireNumber(payload.id, '缺少题目 ID');
    await this.assertSubjectExists(id);

    const data: Prisma.SubjectUncheckedUpdateInput = {};

    if (payload.customsPassId !== undefined) {
      const customsPassId = requireNumber(payload.customsPassId, '缺少关卡 ID');
      await this.assertPassExists(customsPassId);
      data.customsPassId = customsPassId;
    }
    if (payload.sourceIds !== undefined) {
      data.sourceIds = requireText(payload.sourceIds, '题目内容不能为空');
    }
    if (payload.sort !== undefined) {
      data.sort = toOptionalNumber(payload.sort, 0) ?? 0;
    }

    await this.prisma.subject.update({
      where: { id },
      data,
    });

    return {
      code: 0,
      message: '题目更新成功',
      data: true,
    };
  }

  /** 注意路径拼写是 `decs`（前端既有拼写错误），返回**单个对象**而非数组。 */
  async getSubjectDetail(topicId: number) {
    const row = await this.prisma.subject.findUnique({
      where: { id: topicId },
      include: SUBJECT_HIERARCHY_INCLUDE,
    });

    if (!row) {
      throw new BadRequestException('题目不存在');
    }

    return {
      code: 0,
      message: '题目详情获取成功',
      data: {
        ...this.serializeSubject(row),
        sourceVOS: await this.loadSourceVOS(row.sourceIds),
      },
    };
  }

  async deleteSubject(id: number) {
    await this.assertSubjectExists(id);
    await this.prisma.subject.deleteMany({ where: { id } });

    return {
      code: 0,
      message: '题目删除成功',
      data: true,
    };
  }

  /** 批量删除的 body 是裸 `number[]`（全局 ValidationPipe 会跳过原生数组，故 controller 不套 DTO）。 */
  async deleteSubjects(ids: unknown) {
    const normalized = this.normalizeIds(ids);
    if (!normalized.length) {
      throw new BadRequestException('缺少题目 ID');
    }

    await this.prisma.subject.deleteMany({ where: { id: { in: normalized } } });

    return {
      code: 0,
      message: '题目批量删除成功',
      data: true,
    };
  }

  async createScenePic(payload: ScenePicDto) {
    return this.writeSceneGraph(payload, '场景图创建成功');
  }

  async updateScenePic(payload: ScenePicDto) {
    return this.writeSceneGraph(payload, '场景图更新成功');
  }

  /**
   * 路径参数是**题目 id**（不是图片 id）；删除写入真正的 NULL，
   * 而不是前端需要特判的字符串 `'null'`。
   */
  async deleteScenePic(id: number) {
    await this.assertSubjectExists(id);

    await this.prisma.subject.update({
      where: { id },
      data: { sceneGraph: null },
    });

    return {
      code: 0,
      message: '场景图删除成功',
      data: true,
    };
  }

  private async writeSceneGraph(payload: ScenePicDto, message: string) {
    const id = requireNumber(payload.id, '缺少题目 ID');
    await this.assertSubjectExists(id);

    await this.prisma.subject.update({
      where: { id },
      data: { sceneGraph: this.normalizeSceneGraph(payload.scenePic) },
    });

    return {
      code: 0,
      message,
      data: true,
    };
  }

  private async assertSubjectExists(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!subject) {
      throw new BadRequestException('题目不存在');
    }
  }

  private async assertPassExists(id: number) {
    const pass = await this.prisma.pass.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!pass) {
      throw new BadRequestException('关卡不存在');
    }
  }

  /**
   * 组装跨两层 join 的展示字段：Subject → Pass → Part → Unit。
   * `Pass.partsId` 为 NULL（小关卡行）时 part / unit 都不存在，这几个字段返回空串。
   */
  private serializeSubject(item: SubjectWithHierarchy) {
    const pass = item.customPass ?? null;
    const part = pass?.part ?? null;
    const unit = part?.unit ?? null;

    return {
      id: item.id,
      unitsName: unit?.text || '',
      partsTips: part?.tips || '',
      partsTitle: part?.title || '',
      customsPassId: item.customsPassId,
      customsPassName: pass?.title || '',
      sourceIds: item.sourceIds,
      sort: item.sort,
      // 读取时原样透传：库里可能就是字符串 'null'，是否展示由前端判断。
      sceneGraph: item.sceneGraph ?? null,
      showIndex: item.showIndex || '',
      subject: item.subject ?? null,
      partId: item.partId ?? null,
      sessionId: item.sessionId ?? null,
      icon: item.icon || '',
      audio: item.audio || '',
      sentenceAudio: item.sentenceAudio || '',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  /** 详情额外返回的素材明细：sourceIds 里的素材 id → SourceMaterial。 */
  private async loadSourceVOS(sourceIds: string) {
    const ids = this.parseSourceIds(sourceIds);
    if (!ids.length) {
      return [];
    }

    const rows = await this.prisma.sourceMaterial.findMany({
      where: { id: { in: ids } },
    });
    const byId = new Map<number, SourceMaterial>(rows.map((row) => [row.id, row]));

    return ids
      .map((id) => byId.get(id))
      .filter((row): row is SourceMaterial => Boolean(row))
      .map((row) => ({
        id: row.id,
        text: row.text,
        icon: row.icon || '',
        audio: row.audio || '',
      }));
  }

  /**
   * `sourceIds` 语义存疑（题目正文 or 素材 id 串）。这里采取保守规则：
   * **整串都是正整数 id**（支持空格 / 逗号 / 顿号分隔，允许 `[1,2]` 形态）时才当作素材 id，
   * 否则视为正文，返回空数组，避免把正文里的数字误当 id。
   */
  private parseSourceIds(value: string): number[] {
    const text = String(value ?? '')
      .trim()
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .trim();
    if (!text) {
      return [];
    }

    const tokens = text.split(/[\s,，、;；]+/).filter(Boolean);
    const ids = tokens.map((token) => Number(token));
    if (!ids.length || ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      return [];
    }

    return [...new Set(ids)];
  }

  /** 裸数组 body 的归一化：只保留正整数。 */
  private normalizeIds(ids: unknown): number[] {
    if (!Array.isArray(ids)) {
      return [];
    }

    return [
      ...new Set(
        ids
          .map((id) => toOptionalNumber(id))
          .filter((id): id is number => id !== undefined && Number.isInteger(id) && id > 0),
      ),
    ];
  }

  /** 约定：`showIndex` 以单个空格 join 存字符串（前端不消费该字段，仅为写入不报错）。 */
  private normalizeShowIndex(value: unknown) {
    const tokens = Array.isArray(value)
      ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
      : String(value ?? '')
          .trim()
          .split(/\s+/)
          .filter(Boolean);

    return tokens.length ? tokens.join(' ') : null;
  }

  /** 空值与字符串 `'null'` 一律写入 NULL。 */
  private normalizeSceneGraph(value: unknown) {
    const text = toOptionalString(value);
    if (!text || text === 'null') {
      return null;
    }

    return text;
  }
}
