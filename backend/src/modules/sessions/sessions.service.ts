import { BadRequestException, Injectable } from '@nestjs/common';
import { Pass, Prisma, Session, SessionCustomPass } from '@prisma/client';
import {
  requireNumber,
  requireText,
  toOptionalNumber,
  toOptionalString,
} from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, eq, nested } from '../../prisma/where';
import { BindSessionCustomPassDto } from './dto/bind-session-custom-pass.dto';
import { ChangeSessionCustomSortDto } from './dto/change-session-custom-sort.dto';
import { ChangeSessionStatusDto } from './dto/change-session-status.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionCustomPassesDto } from './dto/list-session-custom-passes.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

type BoundCustomPassRow = SessionCustomPass & { customPass?: Pass | null };

/** 启用 / 禁用两种合法状态 */
const SESSION_STATUS_ENABLED = 1;
const SESSION_STATUS_DISABLED = 2;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 大关卡列表：按教材查询该教材下全部大关卡。
   * 契约要求返回**裸数组**（不是分页结构，没有 totalCount）。
   */
  async listSessions(textbookId: number) {
    const rows = await this.prisma.session.findMany({
      where: { textbookId },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    return {
      code: 0,
      message: '大关卡列表获取成功',
      data: rows.map((item) => this.serializeSession(item)),
    };
  }

  /** 新增大关卡：`id` 由客户端提交，需自行校验不存在 */
  async createSession(payload: CreateSessionDto) {
    const id = requireNumber(payload.id, '缺少大关卡 ID');
    const textbookId = requireNumber(payload.textbookId, '请选择教材');
    const title = requireText(payload.title, '大关卡标题不能为空');
    await this.assertCourseExists(textbookId);
    await this.assertSessionIdAvailable(id);

    try {
      await this.prisma.session.create({
        data: {
          id,
          textbookId,
          title,
          icon: toOptionalString(payload.icon) || '',
          sort: toOptionalNumber(payload.sort, 0) ?? 0,
          status: SESSION_STATUS_ENABLED,
        },
      });
    } catch (error) {
      // 并发下仍可能撞主键，统一转成可读的业务错误。
      if (this.isUniqueConstraintError(error)) {
        throw new BadRequestException('大关卡 ID 已存在');
      }
      throw error;
    }

    return {
      code: 0,
      message: '大关卡创建成功',
      data: true,
    };
  }

  async updateSession(payload: UpdateSessionDto) {
    const id = requireNumber(payload.id, '缺少大关卡 ID');
    await this.assertSessionExists(id);

    const textbookId = requireNumber(payload.textbookId, '请选择教材');
    await this.assertCourseExists(textbookId);

    await this.prisma.session.update({
      where: { id },
      data: {
        textbookId,
        title: requireText(payload.title, '大关卡标题不能为空'),
        icon: toOptionalString(payload.icon) || '',
        sort: toOptionalNumber(payload.sort, 0) ?? 0,
      },
    });

    return {
      code: 0,
      message: '大关卡更新成功',
      data: true,
    };
  }

  /**
   * 删除大关卡：显式先删绑定行再删大关卡（schema 虽有 Cascade，
   * 这里不依赖数据库级联，避免不同环境 FK 行为差异）。
   */
  async deleteSession(id: number) {
    await this.assertSessionExists(id);

    await this.prisma.$transaction([
      this.prisma.sessionCustomPass.deleteMany({ where: { sessionId: id } }),
      this.prisma.session.deleteMany({ where: { id } }),
    ]);

    return {
      code: 0,
      message: '大关卡删除成功',
      data: true,
    };
  }

  /** 启停大关卡：只改 `Session.status`（1=启用，2=禁用） */
  async changeStatus(payload: ChangeSessionStatusDto) {
    const id = requireNumber(payload.id, '缺少大关卡 ID');
    const status = requireNumber(payload.status, '缺少状态值');
    if (status !== SESSION_STATUS_ENABLED && status !== SESSION_STATUS_DISABLED) {
      throw new BadRequestException('状态值只能为 1（启用）或 2（禁用）');
    }
    await this.assertSessionExists(id);

    await this.prisma.session.update({
      where: { id },
      data: { status },
    });

    return {
      code: 0,
      message: status === SESSION_STATUS_ENABLED ? '大关卡已启用' : '大关卡已禁用',
      data: true,
    };
  }

  /**
   * 绑定小关卡：操作对象是 `SessionCustomPass` 关系行。
   * 重复绑定采取**明确报错**（不静默幂等），便于前端提示用户已绑定。
   */
  async bindCustomPass(payload: BindSessionCustomPassDto) {
    const textbookId = requireNumber(payload.textbookId, '请选择教材');
    const sessionId = requireNumber(payload.sessionId, '缺少大关卡 ID');
    const customPassId = requireNumber(payload.customPassId, '缺少小关卡 ID');

    await this.assertSessionExists(sessionId, textbookId);
    await this.assertCustomPassExists(customPassId);

    const duplicated = await this.prisma.sessionCustomPass.findUnique({
      where: { sessionId_customPassId: { sessionId, customPassId } },
      select: { id: true },
    });
    if (duplicated) {
      throw new BadRequestException('该小关卡已绑定到此大关卡，请勿重复绑定');
    }

    try {
      await this.prisma.sessionCustomPass.create({
        data: {
          sessionId,
          customPassId,
          // 契约未传 sort：落 0，列表按 [sort asc, id asc] 排序即等价于按绑定先后追加到末尾。
          sort: 0,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new BadRequestException('该小关卡已绑定到此大关卡，请勿重复绑定');
      }
      throw error;
    }

    return {
      code: 0,
      message: '小关卡绑定成功',
      data: true,
    };
  }

  /**
   * 已绑定小关卡列表：返回**裸数组**。
   * `id` 是绑定行 id（`SessionCustomPass.id`），`customTitle`/`title` 均为小关卡 title，
   * `sort` 是绑定顺序（不是小关卡自身的排序）。
   */
  async listCustomPasses(payload: ListSessionCustomPassesDto) {
    const textbookId = requireNumber(payload.textbookId, '请选择教材');
    const sessionId = requireNumber(payload.sessionId, '缺少大关卡 ID');

    const where = composeWhere<Prisma.SessionCustomPassWhereInput>(
      eq('sessionId', sessionId),
      // textbookId 指向 Course.textbookId，通过大关卡校验归属，避免跨教材串数据。
      nested('session', { textbookId }),
    );

    const rows = await this.prisma.sessionCustomPass.findMany({
      where,
      include: { customPass: true },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    return {
      code: 0,
      message: '已绑定小关卡列表获取成功',
      data: rows.map((item) => this.serializeBoundCustomPass(item)),
    };
  }

  /** 解绑：`id` 是绑定行 id（`SessionCustomPass.id`） */
  async unbindCustomPass(id: number) {
    await this.assertBindingExists(id);
    await this.prisma.sessionCustomPass.deleteMany({ where: { id } });

    return {
      code: 0,
      message: '小关卡解绑成功',
      data: true,
    };
  }

  /** 调整绑定顺序：`id` 是绑定行 id，只改关系行的 sort */
  async changeCustomPassSort(payload: ChangeSessionCustomSortDto) {
    const id = requireNumber(payload.id, '缺少绑定关系 ID');
    const sort = requireNumber(payload.sort, '缺少排序值');
    await this.assertBindingExists(id);

    await this.prisma.sessionCustomPass.update({
      where: { id },
      data: { sort },
    });

    return {
      code: 0,
      message: '小关卡排序更新成功',
      data: true,
    };
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

  private async assertSessionExists(id: number, textbookId?: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      select: { id: true, textbookId: true },
    });
    if (!session) {
      throw new BadRequestException('大关卡不存在');
    }
    if (textbookId !== undefined && session.textbookId !== textbookId) {
      throw new BadRequestException('大关卡不属于该教材');
    }
  }

  private async assertSessionIdAvailable(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      select: { id: true },
    });
    if (session) {
      throw new BadRequestException('大关卡 ID 已存在');
    }
  }

  private async assertCustomPassExists(id: number) {
    const customPass = await this.prisma.pass.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!customPass) {
      throw new BadRequestException('小关卡不存在');
    }
  }

  private async assertBindingExists(id: number) {
    const binding = await this.prisma.sessionCustomPass.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!binding) {
      throw new BadRequestException('绑定关系不存在');
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private serializeSession(item: Session) {
    return {
      id: item.id,
      title: item.title,
      icon: item.icon || '',
      status: item.status,
      sort: item.sort,
      textbookId: item.textbookId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private serializeBoundCustomPass(item: BoundCustomPassRow) {
    const customTitle = item.customPass?.title || '';

    return {
      id: item.id,
      sessionId: item.sessionId,
      customPassId: item.customPassId,
      // 前端表格用 customTitle || title 兜底，这里两个字段都带上。
      customTitle,
      title: customTitle,
      icon: item.customPass?.icon || '',
      sort: item.sort,
    };
  }
}
