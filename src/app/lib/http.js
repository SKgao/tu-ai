import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '//test.api.admin.tutukids.com/';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.token = token;
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    const { code, message: msg } = response.data || {};

    if (code === 45 || code === 46) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      window.location.href = '/login';
      return Promise.reject(new Error(msg || '登录已失效'));
    }

    if (typeof code !== 'undefined' && code !== 0) {
      return Promise.reject(new Error(msg || '请求失败'));
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export async function loginRequest(payload) {
  const response = await http.post('user/login', payload);
  return response.data;
}
