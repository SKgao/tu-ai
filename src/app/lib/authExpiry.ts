import { useAuthStore } from '@/app/stores/auth';

/**
 * 登录态失效（后端业务码 45 / 46，或 HTTP 401）的统一处理。
 *
 * 这里刻意**不直接跳转路由**：`http.ts` 是普通模块，若引入 `router` 会形成
 * `router → pages → services → http → router` 的循环依赖。
 * 做法是先清空登录态，`ProtectedRoute` 会因为 `isAuthenticated` 变为 false
 * 而自动 `<Navigate to="/login" />`，跳转与来源记录都交给路由层处理。
 */

/** 一批并发请求会同时收到失效响应，用时间窗去重，避免重复清理与重复提示 */
const DEDUPE_WINDOW_MS = 3000;

let lastHandledAt = 0;
let authExpired = false;

export function handleAuthExpired(): void {
  const now = Date.now();

  if (now - lastHandledAt < DEDUPE_WINDOW_MS) {
    return;
  }

  lastHandledAt = now;
  authExpired = true;
  useAuthStore.getState().logout();
}

/**
 * 只读地判断「本次登出是否由登录过期引起」。
 *
 * 注意：**不能在这里消费（清空）标记**。应用启用了 `React.StrictMode`，
 * 组件 render 会被双次调用，消费型 API 在 render 中读取会拿到错误结果。
 * 因此在登录成功后显式调用 `clearAuthExpiredFlag()` 复位。
 */
export function isAuthExpired(): boolean {
  return authExpired;
}

/** 用户主动退出登录、或重新登录成功时复位标记 */
export function clearAuthExpiredFlag(): void {
  authExpired = false;
}
