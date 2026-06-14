import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'tdesign-react';
import { useAuthStore } from '@/store/authStore';

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.message || error.message || '请求失败';

    if (status === 401) {
      message.warning('登录已过期，请重新登录');
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('权限不足，无法访问');
    } else if (status === 404) {
      message.error('请求的资源不存在');
    } else if (status === 409) {
      message.warning(errorMsg);
    } else if (status === 422) {
      const details = error.response?.data?.details;
      const msg = details ? details.map((d: any) => d.message).join('、') : errorMsg;
      message.warning(msg);
    } else if (status >= 500) {
      message.error('服务器错误，请稍后重试');
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请检查网络');
    } else {
      message.error(errorMsg);
    }

    return Promise.reject(error);
  },
);

export interface ApiResult<T = any> {
  code?: number;
  message?: string;
  data?: T;
  access_token?: string;
  token_type?: string;
  expires_in?: string;
  user?: T;
  [key: string]: any;
}

export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config) as Promise<T>;
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config) as Promise<T>;
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config) as Promise<T>;
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config) as Promise<T>;
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch(url, data, config) as Promise<T>;
  },
};

export default instance;
