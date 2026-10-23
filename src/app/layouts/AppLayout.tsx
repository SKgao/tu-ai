import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthExpiredFlag } from '@/app/lib/authExpiry';
import { logoutRequest } from '@/app/lib/http';
import {
  getStoredAuthToken,
  selectAuthLogout,
  selectAuthUser,
  useAuthStore,
} from '@/app/stores/auth';
import { RouteGuard } from '@/app/routes/RouteGuard';
import { useMenuStore } from '@/app/stores/menus';
import logo from '@/assets/logo.png';
import { SidebarMenu } from './SidebarMenu';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(selectAuthLogout);
  const user = useAuthStore(selectAuthUser);
  const menuItems = useMenuStore((state) => state.items);
  const menusLoading = useMenuStore((state) => state.loading);
  const menusError = useMenuStore((state) => state.error);
  const ensureMenus = useMenuStore((state) => state.ensure);
  const reloadMenus = useMenuStore((state) => state.reload);
  const clearMenus = useMenuStore((state) => state.clear);

  useEffect(() => {
    void ensureMenus(user?.id);
  }, [ensureMenus, user?.id]);

  return (
    <div className="app-shell">
      <aside className="app-shell__sider">
        <Link to="/dashboard" className="app-shell__brand">
          <img src={logo} alt="图图" />
          <div>
            <strong>图图后台</strong>
            <span>Vite Migration</span>
          </div>
        </Link>
        <nav className="app-nav">
          <SidebarMenu
            items={menuItems}
            pathname={location.pathname}
            loading={menusLoading}
            error={menusError}
            onRetry={() => {
              void reloadMenus();
            }}
          />
        </nav>
      </aside>
      <div className="app-shell__main">
        <header className="app-shell__header">
          <div>
            <strong className="app-shell__title">新架构运行中</strong>
            <div className="app-shell__header-subtitle">Vite + React Router + Lightweight UI</div>
          </div>
          <div className="app-shell__actions">
            <div className="app-user-chip">{user?.username || user?.account || '管理员'}</div>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => {
                // 主动退出不算「登录过期」，避免登录页误报
                clearAuthExpiredFlag();
                // 先拿到 token 再清本地态：这个请求要让服务端把 tokenVersion 自增，
                // 否则旧 token 在服务端仍然有效（最长 7 天）。
                // 失败不阻塞退出——本地登录态照常清空。
                const token = getStoredAuthToken();
                if (token) {
                  void logoutRequest(token).catch(() => {});
                }
                clearMenus();
                logout();
                navigate('/login', { replace: true });
              }}
            >
              退出登录
            </button>
          </div>
        </header>
        <main className="app-shell__content">
          <RouteGuard>
            <Outlet />
          </RouteGuard>
        </main>
      </div>
    </div>
  );
}
