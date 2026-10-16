import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { handleAuthExpired } from '@/app/lib/authExpiry';
import { getStoredAuthToken } from '@/app/stores/auth';

export type ApiEnvelope<T> = {
  code?: number;
  message?: string;
  data?: T;
};

export type ApiEntity = Record<string, unknown>;
export type ApiEntityList<T = ApiEntity> = T[];
export type ApiListResult<T = ApiEntity> = {
  data?: ApiEntityList<T>;
  totalCount?: number;
} & ApiEntity;

type LoginPayload = {
  account?: string;
  username?: string;
  password?: string;
};

type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
} & Record<string, unknown>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/** 后端表示登录失效的业务码（45 = 未授权，46 = 其它登录态失效） */
const AUTH_EXPIRED_CODES = new Set([45, 46]);

http.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const { code, message: msg } = response.data || {};

    if (typeof code === 'number' && AUTH_EXPIRED_CODES.has(code)) {
      // 清空登录态 → ProtectedRoute 会自动重定向到登录页
      handleAuthExpired();
      return Promise.reject(new Error(msg || '登录已失效'));
    }

    if (typeof code !== 'undefined' && code !== 0) {
      return Promise.reject(new Error(msg || '请求失败'));
    }

    return response;
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    // 兜底：后端通常把未授权包成 HTTP 200 + code 45，
    // 但一旦将来改成真实 401，这里也要按登录失效处理。
    if (error.response?.status === 401) {
      handleAuthExpired();
    }

    return Promise.reject(error);
  },
);

export async function loginRequest(payload: LoginPayload): Promise<ApiEnvelope<LoginResponse>> {
  const response = await http.post<ApiEnvelope<LoginResponse>>('user/login', payload);
  return response.data;
}
