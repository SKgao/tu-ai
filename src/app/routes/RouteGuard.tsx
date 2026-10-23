import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isRouteAllowed, requiresMenuAccess } from '@/app/lib/menuAccess';
import { selectAuthUser, useAuthStore } from '@/app/stores/auth';
import { useMenuStore } from '@/app/stores/menus';

type RouteGuardProps = {
  children: ReactNode;
};

/**
 * 按当前用户的菜单授权做页面级访问控制：
 * - 有权限：正常渲染；
 * - 没权限：跳转 403；
 * - 菜单加载失败：放行页面本身，由侧边栏提示重试，避免网络问题把用户锁死。
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation();
  const user = useAuthStore(selectAuthUser);
  const items = useMenuStore((state) => state.items);
  const loaded = useMenuStore((state) => state.loaded);
  const loadedFor = useMenuStore((state) => state.loadedFor);
  const loading = useMenuStore((state) => state.loading);
  const error = useMenuStore((state) => state.error);
  const ensure = useMenuStore((state) => state.ensure);
  const expectedUserKey = String(user?.id ?? 'current');
  const ready = loaded && loadedFor === expectedUserKey;

  useEffect(() => {
    if (!ready && !loading && !error) {
      void ensure(user?.id);
    }
  }, [ensure, error, loading, ready, user?.id]);

  if (!requiresMenuAccess(location.pathname)) {
    return <>{children}</>;
  }

  if (error) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="route-skeleton" />;
  }

  if (!isRouteAllowed(location.pathname, items)) {
    return (
      <Navigate
        to="/403"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}
