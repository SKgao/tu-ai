import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { parseDate, requireNumber, requireText, toOptionalNumber, toOptionalString } from '../../common/parsers';
import { hashPassword } from '../../common/password';
import { PrismaService } from '../../prisma/prisma.service';
import { composeWhere, contains, dateRange } from '../../prisma/where';
import { normalizePrimitivePayload } from '../access/shared';

type ListUsersPayload = {
  account?: string;
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
};

type CreateUserPayload = {
  account?: string;
  password?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number | string;
  roleid?: number;
};

type UpdateUserPayload = {
  id?: number;
  password?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
  roleid?: number;
  name?: string;
  sex?: number;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(payload: ListUsersPayload = {}) {
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const account = toOptionalString(payload.account);
    const startTime = parseDate(payload.startTime);
    const endTime = parseDate(payload.endTime);

    const where = composeWhere<Prisma.UserWhereInput>(
      contains('account', account),
      dateRange('createdAt', startTime, endTime),
    );

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      code: 0,
      message: '用户列表获取成功',
      data: {
        data: rows.map((user) => this.serializeUser(user)),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createUser(payload: CreateUserPayload) {
    const account = requireText(payload.account, '用户名和密码不能为空');
    const password = requireText(payload.password, '用户名和密码不能为空');
    const roleId = toOptionalNumber(payload.roleid, 1) ?? 1;

    const existing = await this.prisma.user.findUnique({
      where: {
        account,
      },
    });
    if (existing) {
      throw new BadRequestException('用户名已存在');
    }

    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });
    if (!role) {
      throw new BadRequestException('角色不存在');
    }

    await this.prisma.user.create({
      data: {
        account,
        username: account,
        passwordHash: await hashPassword(password),
        email: toOptionalString(payload.email),
        phone: toOptionalString(payload.phone),
        avatar: toOptionalString(payload.avatar),
        status: toOptionalNumber(payload.status, 1) ?? 1,
        roleId,
      },
    });

    return {
      code: 0,
      message: '用户创建成功',
      data: true,
    };
  }

  async updateUser(payload: UpdateUserPayload) {
    const id = requireNumber(payload.id, '缺少用户 ID');

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (payload.roleid !== undefined) {
      const role = await this.prisma.role.findUnique({
        where: {
          id: requireNumber(payload.roleid, '角色不存在'),
        },
      });
      if (!role) {
        throw new BadRequestException('角色不存在');
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (payload.password !== undefined) {
      data.passwordHash = await hashPassword(requireText(payload.password, '密码不能为空'));
    }
    if (payload.email !== undefined) {
      data.email = toOptionalString(payload.email);
    }
    if (payload.phone !== undefined) {
      data.phone = toOptionalString(payload.phone);
    }
    if (payload.avatar !== undefined) {
      data.avatar = toOptionalString(payload.avatar);
    }
    if (payload.name !== undefined) {
      data.name = toOptionalString(payload.name);
    }
    if (payload.sex !== undefined) {
      data.sex = payload.sex ? toOptionalNumber(payload.sex) ?? null : null;
    }
    if (payload.status !== undefined) {
      data.status = requireNumber(payload.status, '状态不能为空');
    }
    if (payload.roleid !== undefined) {
      data.role = {
        connect: {
          id: requireNumber(payload.roleid, '角色不存在'),
        },
      };
    }

    await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });

    return {
      code: 0,
      message: '用户更新成功',
      data: true,
    };
  }

  async deleteUser(payload: unknown) {
    const id = requireNumber(normalizePrimitivePayload<{ id?: number }>(payload, 'id').id, '缺少用户 ID');

    await this.assertUserExists(id);
    await this.prisma.user.update({
      where: { id },
      data: { status: 3 },
    });

    return {
      code: 0,
      message: '用户删除成功',
      data: true,
    };
  }

  async forbidUser(payload: unknown) {
    return this.updateStatus(payload, 2, '用户禁用成功');
  }

  async enableUser(payload: unknown) {
    return this.updateStatus(payload, 1, '用户启用成功');
  }

  private async updateStatus(payload: unknown, status: number, message: string) {
    const id = requireNumber(normalizePrimitivePayload<{ id?: number }>(payload, 'id').id, '缺少用户 ID');

    await this.assertUserExists(id);
    await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return {
      code: 0,
      message,
      data: true,
    };
  }

  private async assertUserExists(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
  }

  private serializeUser(user: User & { role?: { name: string } | null }) {
    return {
      id: user.id,
      account: user.account,
      username: user.username,
      avatar: user.avatar || '',
      phone: user.phone || '',
      email: user.email || '',
      name: user.name || '',
      sex: user.sex || 0,
      roleId: user.roleId,
      roleid: user.roleId,
      roleName: user.role?.name || '',
      status: user.status,
      createtime: user.createdAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
