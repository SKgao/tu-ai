import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthExpired } from '@/app/lib/authExpiry';
import { selectAuthHydrated, selectIsAuthenticated, useAuthStore } from '@/app/stores/auth';

export function ProtectedRoute() {
  const location = useLocation();
  const hydrated = useAuthStore(selectAuthHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (!hydrated) {
    return <div className="route-skeleton" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          // 带上 query，登录后可回到同一筛选状态
          from: `${location.pathname}${location.search}`,
          // 区分「登录过期被踢出」与「主动退出」，登录页据此给出提示
          expired: isAuthExpired(),
        }}
      />
    );
  }

  return <Outlet />;
}
