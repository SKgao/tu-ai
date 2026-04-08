import { BadRequestException, Injectable } from '@nestjs/common';
import { requireNumber, requireText, toOptionalNumber, toOptionalString } from '../../common/parsers';
import { PrismaService } from '../../prisma/prisma.service';
import { contains } from '../../prisma/where';
import { normalizePrimitivePayload } from './shared';

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

    return {
      code: 0,
      message: '菜单列表获取成功',
      data: {
        data: rows.map((menu) => ({
          ...menu,
          parentId: menu.parentId ?? 0,
          createdAt: menu.createdAt.toISOString(),
          updatedAt: menu.updatedAt.toISOString(),
          name: menu.menuName,
        })),
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        pageNum,
        pageSize,
      },
    };
  }

  async createMenu(payload: MenuMutationPayload) {
    const normalized = this.normalizeMenuPayload(payload);
    await this.prisma.menu.create({
      data: normalized,
    });

    return {
      code: 0,
      message: '菜单创建成功',
      data: true,
    };
  }

  async updateMenu(payload: MenuMutationPayload) {
    const id = requireNumber(payload.id, '缺少菜单 ID');

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

    return {
      code: 0,
      message: '菜单更新成功',
      data: true,
    };
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
      this.prisma.menu.deleteMany({
        where: {
          id: {
            in: menuIds,
          },
        },
      }),
    ]);

    return {
      code: 0,
      message: '菜单删除成功',
      data: true,
    };
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
      updates.menuScope = toOptionalNumber(payload.menuScope) ?? 1;
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
