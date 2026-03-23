import axios from 'axios';

// 客户端缓存配置
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache: Map<string, CacheItem> = new Map();
  private defaultExpiry: number = 5 * 60 * 1000; // 默认缓存5分钟

  // 获取缓存数据
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查缓存是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // 设置缓存数据
  set(key: string, data: any, expiry?: number): void {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (expiry || this.defaultExpiry),
    };
    this.cache.set(key, cacheItem);
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 检查缓存是否存在
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// 创建缓存实例
const apiCache = new APICache();

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: '/api', // 使用相对路径，通过vite proxy代理到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 缓存键生成函数
const generateCacheKey = (config: any): string => {
  return `${config.method}:${config.url}${JSON.stringify(config.params || {})}`;
};

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 动态添加认证信息
    // 从本地存储获取JWT token
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // 检查token是否过期
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          // 检查token是否过期
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            // token已过期，清除本地存储
            localStorage.removeItem('authToken');
          } else {
            // token有效，添加到请求头
            config.headers['Authorization'] = `Bearer ${authToken}`;
          }
        }
      } catch (error) {
        console.error('Token解析错误:', error);
        // token解析失败，清除本地存储
        localStorage.removeItem('authToken');
      }
    }

    // 添加API密钥认证头，优先从环境变量获取，默认值与后端一致
    const apiKey = import.meta.env.VITE_API_KEY || 'default-api-key';
    config.headers['x-api-key'] = apiKey;

    // 检查缓存（仅GET请求）
    if (config.method === 'get') {
      const cacheKey = generateCacheKey(config);
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        console.log(`使用缓存数据: ${cacheKey}`);
        // 使用缓存数据直接返回，避免网络请求
        config.adapter = () => {
          return Promise.resolve({
            data: cachedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config,
          });
        };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 请求重试配置
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1秒

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 处理分页数据，返回response.data，保持与页面组件的数据处理一致
    // 后端API返回格式为 { data: [...], pagination: {...} }
    const responseData = response.data;

    // 缓存GET请求的响应数据
    if (response.config.method === 'get') {
      const cacheKey = generateCacheKey(response.config);
      apiCache.set(cacheKey, responseData);
      console.log(`缓存数据: ${cacheKey}`);
    }

    return responseData;
  },
  async (error) => {
    // 统一处理错误
    console.error('API请求错误:', error);

    // 获取请求配置
    const config = error.config;

    // 如果没有配置或已达到最大重试次数，则直接返回错误
    if (!config) {
      return Promise.reject(error?.message || '网络请求失败');
    }

    // 初始化重试计数
    if (!config.retryCount) {
      config.retryCount = 0;
    }

    // 添加适当的错误处理，避免不必要的重定向
    if (error.response) {
      const { status, data } = error.response;

      // 只在明确的认证失败情况下处理
      if (status === 401) {
        // 清除无效token
        localStorage.removeItem('authToken');
        // 不自动重定向，让组件自己处理
        console.error('认证失败，请重新登录');
        return Promise.reject(data?.message || data?.error || '认证失败');
      }

      // 处理429 Too Many Requests错误，进行重试
      if (status === 429) {
        // 检查是否还有重试次数
        if (config.retryCount < MAX_RETRIES) {
          // 增加重试计数
          config.retryCount += 1;

          // 计算重试延迟（指数退避）
          const delay =
            INITIAL_RETRY_DELAY * Math.pow(2, config.retryCount - 1);

          console.log(
            `请求过于频繁，将在 ${delay}ms 后重试，重试次数: ${config.retryCount}/${MAX_RETRIES}`
          );

          // 延迟后重试请求
          return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
            axiosInstance(config)
          );
        } else {
          console.error('请求过于频繁，已达到最大重试次数');
          return Promise.reject('请求过于频繁，请稍后再试');
        }
      }

      // 其他错误，返回错误信息
      return Promise.reject(data?.message || data?.error || 'API请求失败');
    }

    return Promise.reject(error?.message || '网络请求失败');
  }
);

// 导出缓存实例，方便其他组件清除缓存
export { apiCache };

export default axiosInstance;
