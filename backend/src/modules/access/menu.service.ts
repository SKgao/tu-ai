import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
    const menuName = String(payload.menuName ?? '').trim();
    const pageNum = Math.max(1, Number(payload.pageNum || 1));
    const pageSize = Math.max(1, Number(payload.pageSize || 10));
    const where = menuName
      ? {
          menuName: {
            contains: menuName,
          },
        }
      : undefined;

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
    const id = Number(payload.id);
    if (!id) {
      throw new BadRequestException('缺少菜单 ID');
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

    return {
      code: 0,
      message: '菜单更新成功',
      data: true,
    };
  }

  async deleteMenu(payload: unknown) {
    const parsed = normalizePrimitivePayload<{ id?: number }>(payload, 'id');
    const id = Number(parsed.id);
    if (!id) {
      throw new BadRequestException('缺少菜单 ID');
    }

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
    const menuName = String(payload.menuName ?? '').trim();
    const path = String(payload.path ?? '').trim();
    const icon = String(payload.icon ?? '').trim();

    if (!menuName) {
      throw new BadRequestException('菜单名称不能为空');
    }

    if (!path) {
      throw new BadRequestException('菜单路径不能为空');
    }

    if (!icon) {
      throw new BadRequestException('菜单图标不能为空');
    }

    return {
      menuName,
      parentId: Number(payload.parentId ?? 0) || null,
      sortValue: Number(payload.sortValue ?? 0),
      path,
      icon,
      menuScope: Number(payload.menuScope ?? 1),
      url: String(payload.url ?? '').trim(),
      status: Number(payload.status ?? 1),
    };
  }

  private normalizeMenuUpdatePayload(payload: MenuMutationPayload) {
    const updates: Record<string, string | number | null> = {};

    if (payload.menuName !== undefined) {
      updates.menuName = String(payload.menuName).trim();
    }
    if (payload.parentId !== undefined) {
      updates.parentId = Number(payload.parentId) || null;
    }
    if (payload.sortValue !== undefined) {
      updates.sortValue = Number(payload.sortValue);
    }
    if (payload.path !== undefined) {
      updates.path = String(payload.path).trim();
    }
    if (payload.icon !== undefined) {
      updates.icon = String(payload.icon).trim();
    }
    if (payload.menuScope !== undefined) {
      updates.menuScope = Number(payload.menuScope);
    }
    if (payload.url !== undefined) {
      updates.url = String(payload.url).trim();
    }
    if (payload.status !== undefined) {
      updates.status = Number(payload.status);
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
