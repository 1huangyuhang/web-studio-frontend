import { Request } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * 全局请求速率限制中间件
 * 限制来自同一IP的请求频率
 */
export const globalRateLimitMiddleware = rateLimit({
  // 15分钟内最多允许1000个请求，调宽松限制
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多允许1000个请求，增加限制
  standardHeaders: true, // 返回RateLimit-*响应头
  legacyHeaders: false, // 不返回X-RateLimit-*响应头
  message: {
    error: 'Too Many Requests',
    message: '请求过于频繁，请稍后再试',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  // 跳过健康检查路由
  skip: (req: Request) => req.path === '/health',
});

/**
 * API请求速率限制中间件
 * 为API端点设置更严格的速率限制
 */
export const apiRateLimitMiddleware = rateLimit({
  // 15分钟内最多允许50个请求
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 每个IP最多允许50个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'API请求过于频繁，请稍后再试',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  // 只对API路由生效
  skip: (req: Request) => !req.path.startsWith('/api'),
});

/**
 * 登录请求速率限制中间件
 * 为登录端点设置更严格的速率限制，防止暴力破解
 */
export const loginRateLimitMiddleware = rateLimit({
  // 15分钟内最多允许10个请求
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多允许10个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: '登录尝试过于频繁，请稍后再试',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
  // 只对登录路由生效
  // skip: (req: Request) => !req.path.includes('/login'),
});

/**
 * 自定义速率限制中间件
 * 允许根据需要自定义速率限制参数
 */
export const createRateLimitMiddleware = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skip?: (req: Request) => boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message || {
      error: 'Too Many Requests',
      message: '请求过于频繁，请稍后再试',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    ...(options.skip && { skip: options.skip }),
  });
};
