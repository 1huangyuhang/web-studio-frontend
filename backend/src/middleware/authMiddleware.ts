import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 从环境变量获取认证信息
const ADMIN_USERNAME = process.env['ADMIN_USERNAME'] || 'admin';
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] || 'password';

/**
 * 基本认证中间件
 * 使用用户名和密码验证API请求
 */
export const basicAuthMiddleware = basicAuth({
  // 验证用户凭据
  authorizer: (username: string, password: string) => {
    return (
      basicAuth.safeCompare(username, ADMIN_USERNAME) &&
      basicAuth.safeCompare(password, ADMIN_PASSWORD)
    );
  },
  // 自定义认证失败响应
  unauthorizedResponse: (req: Request) => {
    return {
      error: 'Unauthorized',
      message: 'Invalid credentials',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };
  },
  // 提示信息
  challenge: true,
  realm: 'Management API',
});

/**
 * API密钥认证中间件
 * 使用API密钥验证API请求
 */
export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 从环境变量获取API密钥
  const API_KEY = process.env['API_KEY'] || 'default-api-key';

  // 从请求头获取API密钥
  const apiKey = req.headers['x-api-key'] as string;

  // 验证API密钥
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // 认证通过，继续处理请求
  return next();
};

/**
 * 权限检查中间件
 * 用于检查用户是否有权限访问特定资源
 */
export const permissionMiddleware = () => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    // 这里可以扩展更复杂的权限检查逻辑
    // 例如，从用户会话或JWT令牌中获取用户权限

    // 简化实现，直接通过
    return next();
  };
};
