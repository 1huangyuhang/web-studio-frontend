import axios, { type InternalAxiosRequestConfig } from 'axios';
import { generateTraceRef, wrapAxiosError } from '@shared/errorTracing';

/** 合并 baseURL + url 得到 pathname（含 /api 前缀） */
function requestPathname(
  config: Pick<InternalAxiosRequestConfig, 'baseURL' | 'url'>
): string {
  const base = (config.baseURL || '').replace(/\/$/, '');
  const raw = (config.url || '').split('?')[0] || '';
  const rel = raw.startsWith('/') ? raw : `/${raw}`;
  const joined = `${base}${rel}`.replace(/\/{2,}/g, '/');
  return joined;
}

/** 官网匿名可浏览的 GET：401 时不应整页跳登录（坏 token 不应拖死列表页） */
function isPublicCatalogGet(
  config: InternalAxiosRequestConfig | undefined
): boolean {
  if (!config) return false;
  const m = (config.method || 'get').toLowerCase();
  if (m !== 'get' && m !== 'head') return false;
  const path = requestPathname(config);
  const prefixes = [
    '/api/products',
    '/api/activities',
    '/api/news',
    '/api/courses',
    '/api/pricing-plans',
    '/api/categories',
    '/api/site-assets',
  ];
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

const axiosInstance = axios.create({
  baseURL: '/api', // 使用相对路径，通过vite proxy代理到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const clientTraceId = generateTraceRef('cli');
    (config as { clientTraceId?: string }).clientTraceId = clientTraceId;
    config.headers['X-Client-Trace-Id'] = clientTraceId;

    const apiKey = import.meta.env.VITE_API_KEY || 'default-api-key';
    config.headers['x-api-key'] = apiKey;

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    const te = wrapAxiosError(error);
    console.error(te.toLogString());
    return Promise.reject(te);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const cfg = error.config;
      const url = String(cfg?.url ?? '');
      // 登录页提交错误账号也会 401，不应整页重定向打断表单提示
      if (url.includes('/auth/login')) {
        // keep: no redirect
      } else if (isPublicCatalogGet(cfg)) {
        // 列表类 GET 可匿名 + API Key；残留无效 token 导致 401 时仅清 token，不跳转
        localStorage.removeItem('token');
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    const te = wrapAxiosError(error);
    console.error(te.toLogString());
    return Promise.reject(te);
  }
);

export default axiosInstance;
