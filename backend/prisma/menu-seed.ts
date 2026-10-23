import type { PrismaClient } from '@prisma/client';
import { isSuperAdminRole } from '../src/common/roles';

/**
 * 当前后台的全部左侧菜单定义。
 *
 * - `key` 仅用于种子内部定位父子关系，不落库
 * - `parentKey` 指向上一级菜单，一级菜单不填
 * - `icon` 对应前端 `@/app/lib/menuIcons` 中的图标注册表
 */
type MenuDefinition = {
  key: string;
  menuName: string;
  path: string;
  icon: string;
  sortValue: number;
  parentKey?: string;
};

export const MENU_DEFINITIONS: MenuDefinition[] = [
  {
    key: 'dashboard',
    menuName: '工作台',
    path: '/dashboard',
    icon: 'dashboard',
    sortValue: 10,
  },
  {
    key: 'course',
    menuName: '课程模块',
    path: '/course',
    icon: 'course',
    sortValue: 20,
  },
  {
    key: 'course-special-courses',
    parentKey: 'course',
    menuName: '精品课程',
    path: '/course/special-courses',
    icon: 'star',
    sortValue: 10,
  },
  {
    key: 'course-course-bags',
    parentKey: 'course',
    menuName: '课程包管理',
    path: '/course/course-bags',
    icon: 'appstore',
    sortValue: 20,
  },
  {
    key: 'course-activities',
    parentKey: 'course',
    menuName: '活动管理',
    path: '/course/activities',
    icon: 'gift',
    sortValue: 30,
  },
  {
    key: 'member',
    menuName: '会员模块',
    path: '/member',
    icon: 'team',
    sortValue: 30,
  },
  {
    key: 'member-members',
    parentKey: 'member',
    menuName: '会员管理',
    path: '/member/members',
    icon: 'user',
    sortValue: 10,
  },
  {
    key: 'member-info',
    parentKey: 'member',
    menuName: '会员信息',
    path: '/member/member-info',
    icon: 'idcard',
    sortValue: 20,
  },
  {
    key: 'member-levels',
    parentKey: 'member',
    menuName: '会员等级',
    path: '/member/member-levels',
    icon: 'crown',
    sortValue: 30,
  },
  {
    key: 'material',
    menuName: '教材模块',
    path: '/material',
    icon: 'book',
    sortValue: 40,
  },
  {
    key: 'material-books',
    parentKey: 'material',
    menuName: '教材管理',
    path: '/material/books',
    icon: 'read',
    sortValue: 10,
  },
  {
    key: 'material-units',
    parentKey: 'material',
    menuName: '单元管理',
    path: '/material/units',
    icon: 'folder',
    sortValue: 20,
  },
  {
    key: 'material-parts',
    parentKey: 'material',
    menuName: 'Part 管理',
    path: '/material/parts',
    icon: 'partition',
    sortValue: 30,
  },
  {
    key: 'material-passes',
    parentKey: 'material',
    menuName: '关卡管理',
    path: '/material/passes',
    icon: 'flag',
    sortValue: 40,
  },
  {
    key: 'material-subjects',
    parentKey: 'material',
    menuName: '题目管理',
    path: '/material/subjects',
    icon: 'profile',
    sortValue: 50,
  },
  {
    key: 'material-custom-passes',
    parentKey: 'material',
    menuName: '小关卡管理',
    path: '/material/custom-passes',
    icon: 'node-index',
    sortValue: 60,
  },
  {
    key: 'material-sessions',
    parentKey: 'material',
    menuName: '大关卡管理',
    path: '/material/sessions',
    icon: 'apartment',
    sortValue: 70,
  },
  {
    key: 'material-source-material',
    parentKey: 'material',
    menuName: '素材管理',
    path: '/material/source-material',
    icon: 'picture',
    sortValue: 80,
  },
  {
    key: 'order',
    menuName: '订单模块',
    path: '/order',
    icon: 'order',
    sortValue: 50,
  },
  {
    key: 'order-orders',
    parentKey: 'order',
    menuName: '订单管理',
    path: '/order/orders',
    icon: 'shopping-cart',
    sortValue: 10,
  },
  {
    key: 'order-course-orders',
    parentKey: 'order',
    menuName: '课程订单',
    path: '/order/course-orders',
    icon: 'file-text',
    sortValue: 20,
  },
  {
    key: 'system',
    menuName: '系统模块',
    path: '/system',
    icon: 'system',
    sortValue: 60,
  },
  {
    key: 'system-users',
    parentKey: 'system',
    menuName: '用户管理',
    path: '/system/users',
    icon: 'user-switch',
    sortValue: 10,
  },
  {
    key: 'system-roles',
    parentKey: 'system',
    menuName: '角色管理',
    path: '/system/roles',
    icon: 'safety',
    sortValue: 20,
  },
  {
    key: 'system-menus',
    parentKey: 'system',
    menuName: '菜单管理',
    path: '/system/menus',
    icon: 'menu',
    sortValue: 30,
  },
  {
    key: 'system-migration',
    parentKey: 'system',
    menuName: '迁移看板',
    path: '/system/migration',
    icon: 'migration',
    sortValue: 40,
  },
];

/** 三个内置角色的默认菜单（仅作为新建用户 / 初始化的默认值） */
const ROLE_DEFAULT_PATHS: Record<string, string[]> = {
  超级管理员: MENU_DEFINITIONS.map((menu) => menu.path),
  运营角色: [
    '/dashboard',
    '/course',
    '/course/special-courses',
    '/course/course-bags',
    '/course/activities',
    '/member',
    '/member/members',
    '/member/member-info',
    '/member/member-levels',
    '/order',
    '/order/orders',
    '/order/course-orders',
  ],
  内容编辑: [
    '/dashboard',
    '/course',
    '/course/special-courses',
    '/course/course-bags',
    '/course/activities',
    '/material',
    '/material/books',
    '/material/units',
    '/material/parts',
    '/material/passes',
    '/material/subjects',
    '/material/custom-passes',
    '/material/sessions',
    '/material/source-material',
  ],
};

const ALL_PATHS = MENU_DEFINITIONS.map((menu) => menu.path);

function pathWithAncestors(path: string): string[] {
  const result: string[] = [];
  const keys = new Set<string>();
  let current = MENU_DEFINITIONS.find((menu) => menu.path === path);

  while (current && !keys.has(current.key)) {
    keys.add(current.key);
    result.push(current.path);
    current = current.parentKey
      ? MENU_DEFINITIONS.find((menu) => menu.key === current?.parentKey)
      : undefined;
  }

  return result;
}

function expandWithAncestors(paths: string[]): string[] {
  const expanded = new Set<string>();
  paths.forEach((path) => {
    pathWithAncestors(path).forEach((item) => expanded.add(item));
  });
  return Array.from(expanded);
}

async function collectDescendantIds(prisma: PrismaClient, rootIds: number[]): Promise<number[]> {
  const ids = new Set<number>(rootIds);
  let frontier = rootIds;

  while (frontier.length) {
    const children = await prisma.menu.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    frontier = children.map((child) => child.id).filter((id) => !ids.has(id));
    frontier.forEach((id) => ids.add(id));
  }

  return Array.from(ids);
}

/**
 * 同步菜单树 + 内置角色默认授权。
 *
 * 会删除不在 `MENU_DEFINITIONS` 中的旧菜单（含其角色授权），因此可以安全地重复执行。
 */
export async function syncMenus(prisma: PrismaClient): Promise<void> {
  const savedByKey = new Map<string, number>();

  for (const definition of MENU_DEFINITIONS) {
    const saved = await prisma.menu.upsert({
      where: { path: definition.path },
      update: {
        menuName: definition.menuName,
        icon: definition.icon,
        sortValue: definition.sortValue,
        menuScope: 1,
        status: 1,
      },
      create: {
        menuName: definition.menuName,
        parentId: null,
        path: definition.path,
        icon: definition.icon,
        sortValue: definition.sortValue,
        menuScope: 1,
        url: '',
        status: 1,
      },
    });
    savedByKey.set(definition.key, saved.id);
  }

  for (const definition of MENU_DEFINITIONS) {
    const id = savedByKey.get(definition.key);
    if (!id) {
      continue;
    }
    const parentId = definition.parentKey ? savedByKey.get(definition.parentKey) ?? null : null;
    await prisma.menu.update({
      where: { id },
      data: { parentId },
    });
  }

  const staleMenus = await prisma.menu.findMany({
    where: { path: { notIn: ALL_PATHS } },
    select: { id: true },
  });
  if (staleMenus.length) {
    const staleIds = await collectDescendantIds(
      prisma,
      staleMenus.map((menu) => menu.id),
    );
    await prisma.$transaction([
      prisma.roleMenu.deleteMany({ where: { menuId: { in: staleIds } } }),
      prisma.userMenu.deleteMany({ where: { menuId: { in: staleIds } } }),
      prisma.menu.deleteMany({ where: { id: { in: staleIds } } }),
    ]);
  }

  for (const [roleName, paths] of Object.entries(ROLE_DEFAULT_PATHS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const menus = await prisma.menu.findMany({
      where: { path: { in: expandWithAncestors(paths) } },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.roleMenu.deleteMany({ where: { roleId: role.id } }),
      prisma.roleMenu.createMany({
        data: menus.map((menu) => ({ roleId: role.id, menuId: menu.id })),
        skipDuplicates: true,
      }),
    ]);
  }
}

/**
 * 按角色默认菜单初始化用户级授权。
 *
 * 默认只补齐没有任何授权的用户；传 `reset` 会清空后重建（用于一次性迁移）。
 */
export async function syncUserMenus(
  prisma: PrismaClient,
  options: { reset?: boolean } = {},
): Promise<void> {
  const { reset = false } = options;

  const [users, menus, roleMenus] = await Promise.all([
    prisma.user.findMany({ select: { id: true, roleId: true } }),
    prisma.menu.findMany({ select: { id: true } }),
    prisma.roleMenu.findMany({ select: { roleId: true, menuId: true } }),
  ]);

  const allMenuIds = menus.map((menu) => menu.id);
  const roleMenuMap = new Map<number, number[]>();
  roleMenus.forEach((row) => {
    const list = roleMenuMap.get(row.roleId) || [];
    list.push(row.menuId);
    roleMenuMap.set(row.roleId, list);
  });

  for (const user of users) {
    if (!reset) {
      const existingCount = await prisma.userMenu.count({ where: { userId: user.id } });
      if (existingCount > 0) {
        continue;
      }
    }

    const defaultMenuIds = isSuperAdminRole(user.roleId)
      ? allMenuIds
      : roleMenuMap.get(user.roleId) || [];

    await prisma.$transaction([
      prisma.userMenu.deleteMany({ where: { userId: user.id } }),
      prisma.userMenu.createMany({
        data: defaultMenuIds.map((menuId) => ({ userId: user.id, menuId })),
        skipDuplicates: true,
      }),
    ]);
  }
}
