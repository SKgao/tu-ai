import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectAuthHydrated, selectIsAuthenticated, useAuthStore } from '@/app/stores/auth';

export function ProtectedRoute() {
  const location = useLocation();
  const hydrated = useAuthStore(selectAuthHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (!hydrated) {
    return <div className="route-skeleton" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
