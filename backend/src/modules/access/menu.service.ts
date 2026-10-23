import { BadRequestException, Injectable } from '@nestjs/common';
import { Menu } from '@prisma/client';
import { requireNumber, requireText, toOptionalNumber, toOptionalString } from '../../common/parsers';
import { isSuperAdminRole } from '../../common/roles';
import { ok, paginate } from '../../common/response';
import { PrismaService } from '../../prisma/prisma.service';
import { contains } from '../../prisma/where';
import { buildMenuTree, normalizePrimitivePayload } from './shared';

type MenuListPayload = {
  menuName?: string;
  pageNum?: number;
  pageSize?: number;
};

type MenuMutationPayload = {
  id?: number;
  menuName?: string;
  parentId?: number;
  sortValue?: number;
  path?: string;
  icon?: string;
  menuScope?: number;
  url?: string;
  status?: number;
};

type UserMenuPayload = {
  userId?: number;
  id?: number;
  menuIds?: number[];
};

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async listMenus(payload: MenuListPayload = {}) {
    const menuName = toOptionalString(payload.menuName);
    const pageNum = Math.max(1, toOptionalNumber(payload.pageNum) ?? 1);
    const pageSize = Math.max(1, toOptionalNumber(payload.pageSize) ?? 10);
    const where = contains('menuName', menuName);

    const [totalCount, rows] = await this.prisma.$transaction([
      this.prisma.menu.count({ where }),
      this.prisma.menu.findMany({
        where,
        orderBy: [{ sortValue: 'asc' }, { id: 'asc' }],
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return paginate({
      items: rows.map((menu) => ({
        ...menu,
        parentId: menu.parentId ?? 0,
        createdAt: menu.createdAt.toISOString(),
        updatedAt: menu.updatedAt.toISOString(),
        name: menu.menuName,
      })),
      totalCount,
      pageNum,
      pageSize,
      message: '菜单列表获取成功',
    });
  }

  /** 左侧导航：当前登录用户可见的菜单树（超管不受用户授权限制）。 */
  async getCurrentUserMenus(userId: number, roleId: number) {
    const menus = await this.prisma.menu.findMany({
      where: { status: 1 },
      orderBy: [{ sortValue: 'asc' }, { id: 'asc' }],
    });

    let allowedIds: Set<number>;
    if (isSuperAdminRole(roleId)) {
      allowedIds = new Set(menus.map((menu) => menu.id));
    } else {
      const userMenus = await this.prisma.userMenu.findMany({
        where: { userId },
        select: { menuId: true },
      });
      allowedIds = this.withAncestorIds(
        userMenus.map((item) => item.menuId),
        menus,
      );
    }

    return ok(this.toTree(menus.filter((menu) => allowedIds.has(menu.id))), '菜单获取成功');
  }

  /** 菜单管理：完整菜单树（含停用菜单）。 */
  async getMenuTree() {
    const menus = await this.prisma.menu.findMany({
      orderBy: [{ sortValue: 'asc' }, { id: 'asc' }],
    });

    return ok(this.toTree(menus), '菜单树获取成功');
  }

  /** 用户授权：完整可授权菜单树 + 该用户已勾选的菜单 ID。 */
  async getUserMenuAuth(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, roleId: true },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const menus = await this.prisma.menu.findMany({
      where: { status: 1 },
      orderBy: [{ sortValue: 'asc' }, { id: 'asc' }],
    });
    const userMenus = await this.prisma.userMenu.findMany({
      where: { userId },
      select: { menuId: true },
    });

    const isSuperAdmin = isSuperAdminRole(user.roleId);
    const checkedIds = isSuperAdmin
      ? menus.map((menu) => menu.id)
      : userMenus.map((item) => item.menuId);

    return ok(
      {
        tree: this.toTree(menus),
        checkedIds,
        isSuperAdmin,
      },
      '用户菜单授权获取成功',
    );
  }

  /** 保存用户菜单授权；只勾子菜单时会自动补齐父级目录。 */
  async setUserMenuAuth(payload: UserMenuPayload) {
    const userId = requireNumber(payload.userId ?? payload.id, '缺少用户 ID');
    const menuIds = Array.isArray(payload.menuIds)
      ? Array.from(
          new Set(
            payload.menuIds.map(Number).filter((id) => Number.isInteger(id) && id > 0),
          ),
        )
      : [];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const allMenus = await this.prisma.menu.findMany({
      select: { id: true, parentId: true },
    });
    const menuIdSet = new Set(allMenus.map((menu) => menu.id));
    const invalidIds = menuIds.filter((id) => !menuIdSet.has(id));
    if (invalidIds.length) {
      throw new BadRequestException('部分菜单不存在');
    }

    const allowedIds = this.withAncestorIds(menuIds, allMenus);

    await this.prisma.$transaction([
      this.prisma.userMenu.deleteMany({ where: { userId } }),
      this.prisma.userMenu.createMany({
        data: Array.from(allowedIds).map((menuId) => ({ userId, menuId })),
        skipDuplicates: true,
      }),
    ]);

    return ok(true, '用户菜单授权成功');
  }

  async createMenu(payload: MenuMutationPayload) {
    const normalized = this.normalizeMenuPayload(payload);
    await this.prisma.menu.create({
      data: normalized,
    });

    return ok(true, '菜单创建成功');
  }

  async updateMenu(payload: MenuMutationPayload) {
    const id = requireNumber(payload.id, '缺少菜单 ID');

    if (payload.parentId !== undefined) {
      const parentId = toOptionalNumber(payload.parentId) || null;
      if (parentId === id) {
        throw new BadRequestException('父级菜单不能是自己');
      }
      if (parentId) {
        const descendants = await this.collectDescendantIds(id);
        if (descendants.includes(parentId)) {
          throw new BadRequestException('父级菜单不能是当前菜单的子级');
        }
      }
    }

    const updates = this.normalizeMenuUpdatePayload(payload);
    const updated = await this.prisma.menu.updateMany({
      where: {
        id,
      },
      data: updates,
    });

    if (!updated.count) {
      throw new BadRequestException('菜单不存在');
    }

    return ok(true, '菜单更新成功');
  }

  async deleteMenu(payload: unknown) {
    const parsed = normalizePrimitivePayload<{ id?: number }>(payload, 'id');
    const id = requireNumber(parsed.id, '缺少菜单 ID');

    const existing = await this.prisma.menu.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    if (!existing) {
      throw new BadRequestException('菜单不存在');
    }

    const menuIds = await this.collectDescendantIds(id);

    await this.prisma.$transaction([
      this.prisma.roleMenu.deleteMany({
        where: {
          menuId: {
            in: menuIds,
          },
        },
      }),
      this.prisma.userMenu.deleteMany({
        where: {
          menuId: {
            in: menuIds,
          },
        },
      }),
      this.prisma.menu.deleteMany({
        where: {
          id: {
            in: menuIds,
          },
        },
      }),
    ]);

    return ok(true, '菜单删除成功');
  }

  private toTree(menus: Menu[]) {
    return buildMenuTree(menus, (menu) => ({
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
    }));
  }

  /** 补齐父级，避免只授权子菜单时在侧边栏里变成一级菜单。 */
  private withAncestorIds(
    ids: number[],
    menus: Array<{ id: number; parentId: number | null }>,
  ): Set<number> {
    const parentMap = new Map(menus.map((menu) => [menu.id, menu.parentId]));
    const result = new Set<number>(ids);

    ids.forEach((id) => {
      let parentId = parentMap.get(id) ?? null;
      while (parentId && parentMap.has(parentId) && !result.has(parentId)) {
        result.add(parentId);
        parentId = parentMap.get(parentId) ?? null;
      }
    });

    return result;
  }

  private normalizeMenuPayload(payload: MenuMutationPayload) {
    const menuName = requireText(payload.menuName, '菜单名称不能为空');
    const path = requireText(payload.path, '菜单路径不能为空');
    const icon = requireText(payload.icon, '菜单图标不能为空');

    return {
      menuName,
      parentId: toOptionalNumber(payload.parentId, 0) || null,
      sortValue: toOptionalNumber(payload.sortValue, 0) ?? 0,
      path,
      icon,
      menuScope: toOptionalNumber(payload.menuScope, 1) ?? 1,
      url: toOptionalString(payload.url) || '',
      status: toOptionalNumber(payload.status, 1) ?? 1,
    };
  }

  private normalizeMenuUpdatePayload(payload: MenuMutationPayload) {
    const updates: Record<string, string | number | null> = {};

    if (payload.menuName !== undefined) {
      updates.menuName = toOptionalString(payload.menuName) || '';
    }
    if (payload.parentId !== undefined) {
      updates.parentId = toOptionalNumber(payload.parentId) || null;
    }
    if (payload.sortValue !== undefined) {
      updates.sortValue = toOptionalNumber(payload.sortValue) ?? 0;
    }
    if (payload.path !== undefined) {
      updates.path = toOptionalString(payload.path) || '';
    }
    if (payload.icon !== undefined) {
      updates.icon = toOptionalString(payload.icon) || '';
    }
    if (payload.menuScope !== undefined) {
      updates.menuScope = toOptionalNumber(payload.menuScope, 1) ?? 1;
    }
    if (payload.url !== undefined) {
      updates.url = toOptionalString(payload.url) || '';
    }
    if (payload.status !== undefined) {
      updates.status = toOptionalNumber(payload.status) ?? 1;
    }

    return updates;
  }

  private async collectDescendantIds(rootId: number) {
    const ids = new Set<number>([rootId]);
    let changed = true;

    while (changed) {
      changed = false;
      const children = await this.prisma.menu.findMany({
        where: {
          parentId: {
            in: Array.from(ids),
          },
        },
        select: {
          id: true,
        },
      });

      children.forEach((child) => {
        if (!ids.has(child.id)) {
          ids.add(child.id);
          changed = true;
        }
      });
    }

    return Array.from(ids);
  }
}
