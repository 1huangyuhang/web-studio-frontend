import axios from 'axios';
import {
  ErrorCodes,
  generateTraceRef,
  wrapAxiosError,
  type TraceableError,
} from '@shared/errorTracing';
import { getManagementApiBaseURL } from '../config/managementApiBase';

const MGMT_HINT_EVENT = 'mgmt-api-hint';

/** 供 AdminLayout 展示一次性排错指引（网络不可达 / 只读账号） */
function emitMgmtApiHint(te: TraceableError) {
  if (
    te.errorCode === ErrorCodes.NET_NO_RESPONSE ||
    te.errorCode === ErrorCodes.NET_TIMEOUT
  ) {
    window.dispatchEvent(
      new CustomEvent(MGMT_HINT_EVENT, { detail: { kind: 'network' as const } })
    );
  }
  if (te.context.httpStatus === 403 && te.context.code === 'USER_READ_ONLY') {
    window.dispatchEvent(
      new CustomEvent(MGMT_HINT_EVENT, {
        detail: { kind: 'readOnly' as const },
      })
    );
  }
}

/**
 * 历史代码会调用 apiCache.clear()；管理端列表已逐步改用 React Query，不再在 axios 层做 GET 内存缓存，
 * 避免与查询失效策略冲突、以及缓存键与分页/筛选参数不一致导致的「列表像卡住 / 数据不刷新」。
 */
export const apiCache = {
  clear(): void {},
  /** 兼容旧调用 `delete(key)`；已不再使用 URL 级缓存 */
  delete(): void {},
  has(): boolean {
    return false;
  },
};

const axiosInstance = axios.create({
  baseURL: getManagementApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
    }

    const clientTraceId = generateTraceRef('cli');
    (config as { clientTraceId?: string }).clientTraceId = clientTraceId;
    config.headers['X-Client-Trace-Id'] = clientTraceId;

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
          } else {
            config.headers['Authorization'] = `Bearer ${authToken}`;
          }
        }
      } catch (parseErr) {
        console.error('Token解析错误:', parseErr);
        localStorage.removeItem('authToken');
      }
    }

    const apiKey = import.meta.env.VITE_API_KEY || 'default-api-key';
    config.headers['x-api-key'] = apiKey;

    return config;
  },
  (error) => {
    const te = wrapAxiosError(error);
    emitMgmtApiHint(te);
    console.error(te.toLogString());
    return Promise.reject(te);
  }
);

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;

    if (!config) {
      const te = wrapAxiosError(error);
      emitMgmtApiHint(te);
      console.error(te.toLogString());
      return Promise.reject(te);
    }

    if (!config.retryCount) {
      config.retryCount = 0;
    }

    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        const url = String(config.url ?? '');
        if (!url.includes('/auth/login')) {
          localStorage.removeItem('authToken');
          const raw = import.meta.env.BASE_URL ?? '/';
          const base = raw === '/' ? '' : raw.replace(/\/$/, '');
          window.location.assign(base ? `${base}/login` : '/login');
        }
        const te = wrapAxiosError(error);
        console.error(te.toLogString());
        return Promise.reject(te);
      }

      if (status === 429) {
        const method = (config.method || 'get').toLowerCase();
        if (method !== 'get' && method !== 'head') {
          const te = wrapAxiosError(error);
          console.error(te.toLogString());
          return Promise.reject(te);
        }
        if (config.retryCount < MAX_RETRIES) {
          config.retryCount += 1;
          const delay =
            INITIAL_RETRY_DELAY * Math.pow(2, config.retryCount - 1);
          console.log(
            `请求过于频繁，将在 ${delay}ms 后重试，重试次数: ${config.retryCount}/${MAX_RETRIES}`
          );
          return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
            axiosInstance(config)
          );
        }
        const te = wrapAxiosError(error);
        console.error(te.toLogString());
        return Promise.reject(te);
      }

      const te = wrapAxiosError(error);
      emitMgmtApiHint(te);
      console.error(te.toLogString());
      return Promise.reject(te);
    }

    const te = wrapAxiosError(error);
    emitMgmtApiHint(te);
    console.error(te.toLogString());
    return Promise.reject(te);
  }
);

export default axiosInstance;
