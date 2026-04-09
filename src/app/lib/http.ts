import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
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

http.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const { code, message: msg } = response.data || {};

    if (code === 45 || code === 46) {
      return Promise.reject(new Error(msg || '登录已失效'));
    }

    if (typeof code !== 'undefined' && code !== 0) {
      return Promise.reject(new Error(msg || '请求失败'));
    }

    return response;
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => Promise.reject(error),
);

export async function loginRequest(payload: LoginPayload): Promise<ApiEnvelope<LoginResponse>> {
  const response = await http.post<ApiEnvelope<LoginResponse>>('user/login', payload);
  return response.data;
}
