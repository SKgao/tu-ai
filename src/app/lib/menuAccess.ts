import type { MenuNode } from '@/app/stores/menus';

type MenuLike = {
  path?: string;
  children?: MenuLike[];
};

/**
 * 页面路由与菜单权限的对应关系。
 *
 * 大部分页面与菜单 path 一一对应；少量二级页面没有独立菜单，
 * 需要继承它入口页面的权限，例如课程包课程/活动从「课程包管理」进入。
 * 不在表里的路径（旧地址别名、403/404、未知地址）不做拦截。
 */
export const ROUTE_MENU_REQUIREMENTS: Record<string, string[]> = {
  '/dashboard': ['/dashboard'],

  '/course/special-courses': ['/course/special-courses'],
  '/course/course-bags': ['/course/course-bags'],
  '/course/course-bag-courses': ['/course/course-bags'],
  '/course/course-bag-activities': ['/course/course-bags'],
  '/course/activities': ['/course/activities'],
  '/course/course-users': ['/member/members', '/member/member-info'],

  '/member/members': ['/member/members'],
  '/member/member-info': ['/member/member-info'],
  '/member/member-levels': ['/member/member-levels'],
  '/member/invite-count': ['/member/members'],
  '/member/learning-record': ['/member/members'],

  '/material/books': ['/material/books'],
  '/material/units': ['/material/units'],
  '/material/parts': ['/material/parts'],
  '/material/passes': ['/material/passes'],
  '/material/subjects': ['/material/subjects'],
  '/material/custom-passes': ['/material/custom-passes'],
  '/material/sessions': ['/material/sessions'],
  '/material/source-material': ['/material/source-material'],

  '/order/orders': ['/order/orders'],
  '/order/course-orders': ['/order/course-orders'],

  '/system/users': ['/system/users'],
  '/system/roles': ['/system/roles'],
  '/system/menus': ['/system/menus'],
  '/system/migration': ['/system/migration'],
};

export function normalizeRoutePath(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
}

export function requiresMenuAccess(pathname: string): boolean {
  return Boolean(ROUTE_MENU_REQUIREMENTS[normalizeRoutePath(pathname)]);
}

export function collectMenuPaths(nodes: MenuLike[] | undefined): string[] {
  const paths: string[] = [];

  const walk = (items: MenuLike[] | undefined): void => {
    (items || []).forEach((node) => {
      if (node.path) {
        paths.push(normalizeRoutePath(node.path));
      }
      walk(node.children);
    });
  };

  walk(nodes);
  return paths;
}

export function isRouteAllowed(pathname: string, menus: MenuNode[] | undefined): boolean {
  const normalized = normalizeRoutePath(pathname);
  const requirements = ROUTE_MENU_REQUIREMENTS[normalized];

  if (!requirements) {
    return true;
  }

  const granted = new Set(collectMenuPaths(menus));
  return requirements.some((path) => granted.has(normalizeRoutePath(path)));
}

/** 当前账号第一个可访问的菜单页面，用于 403/404 页的「回到首页」。 */
export function findFirstMenuPath(menus: MenuNode[] | undefined): string {
  // 目录节点（/course、/member 等）不是真实页面，不能作为首页目标
  const paths = collectMenuPaths(menus).filter((path) => ROUTE_MENU_REQUIREMENTS[path]);

  if (paths.includes('/dashboard')) {
    return '/dashboard';
  }

  return paths[0] || '';
}
