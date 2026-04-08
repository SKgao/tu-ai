import { BadRequestException, Injectable } from '@nestjs/common';
import { requireNumber, requireText, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { contains } from '../../prisma/where';
import { buildMenuTree, normalizePrimitivePayload } from './shared';

type RoleListPayload = {
  keyword?: string;
  name?: string;
};

type RoleCreatePayload = {
  name?: string;
  rolename?: string;
};

type RoleAuthorityPayload = {
  roleId?: number;
  menuIds?: number[];
};

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoles(payload: unknown) {
    const parsed = normalizePrimitivePayload<RoleListPayload>(payload, 'keyword');
    const keyword = toOptionalString(parsed.keyword) || toOptionalString(parsed.name);
    const roles = await this.prisma.role.findMany({
      where: contains('name', keyword),
      orderBy: {
        id: 'asc',
      },
    });

    return {
      code: 0,
      message: '角色列表获取成功',
      data: roles.map((role) => ({
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
    };
  }

  async createRole(payload: unknown) {
    const parsed = normalizePrimitivePayload<RoleCreatePayload>(payload, 'name');
    const name = requireText(parsed.name ?? parsed.rolename, '角色名称不能为空');

    const exists = await this.prisma.role.findUnique({
      where: {
        name,
      },
    });
    if (exists) {
      throw new BadRequestException('角色名称已存在');
    }

    await this.prisma.role.create({
      data: {
        name,
      },
    });

    return {
      code: 0,
      message: '角色创建成功',
      data: true,
    };
  }

  async deleteRole(payload: unknown) {
    const parsed = normalizePrimitivePayload<{ id?: number }>(payload, 'id');
    const id = requireNumber(parsed.id, '缺少角色 ID');

    if (id === 1) {
      throw new BadRequestException('系统内置角色不允许删除');
    }

    const existing = await this.prisma.role.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      throw new BadRequestException('角色不存在');
    }

    await this.prisma.role.delete({
      where: {
        id,
      },
    });

    return {
      code: 0,
      message: '角色删除成功',
      data: true,
    };
  }

  async getRoleMenus(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        roleMenus: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!role) {
      throw new BadRequestException('角色不存在');
    }

    const menus = role.roleMenus.map((item) => item.menu);
    return {
      code: 0,
      message: '角色菜单获取成功',
      data: buildMenuTree(menus, (menu) => ({
        id: menu.id,
        parentId: menu.parentId ?? 0,
        name: menu.menuName,
        menuName: menu.menuName,
        path: menu.path,
        icon: menu.icon,
        menuScope: menu.menuScope,
        url: menu.url,
        status: menu.status,
        sortValue: menu.sortValue,
        createdAt: menu.createdAt.toISOString(),
        updatedAt: menu.updatedAt.toISOString(),
      })),
    };
  }

  getCurrentRoleMenus(roleId: number) {
    return this.getRoleMenus(roleId);
  }

  async setRoleAuthorities(payload: RoleAuthorityPayload) {
    const roleId = requireNumber(payload.roleId, '缺少角色 ID');
    const menuIds = Array.isArray(payload.menuIds) ? payload.menuIds.map(Number).filter(Boolean) : [];

    if (!menuIds.length) {
      throw new BadRequestException('请至少选择一个菜单');
    }

    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });
    if (!role) {
      throw new BadRequestException('角色不存在');
    }

    const existingMenus = await this.prisma.menu.findMany({
      where: {
        id: {
          in: menuIds,
        },
      },
      select: {
        id: true,
      },
    });
    if (existingMenus.length !== menuIds.length) {
      throw new BadRequestException('部分菜单不存在');
    }

    await this.prisma.$transaction([
      this.prisma.roleMenu.deleteMany({
        where: {
          roleId,
        },
      }),
      this.prisma.roleMenu.createMany({
        data: menuIds.map((menuId) => ({
          roleId,
          menuId,
        })),
      }),
    ]);

    return {
      code: 0,
      message: '角色授权成功',
      data: true,
    };
  }
}
