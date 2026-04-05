import type { UserRole } from '@prisma/client';

/**
 * Express.Request 扩展（须为 .ts 而非 .d.ts，以便 ts-node 在运行时能 require 到对应模块）。
 */
declare module 'express-serve-static-core' {
  interface Request {
    /** HTTP 请求链路 id，与 X-Request-Id / 前端 X-Client-Trace-Id 对齐 */
    requestId?: string;
    /** 已通过 JWT 或管理端鉴权解析出的用户 */
    authUser?: {
      id: string;
      email: string;
      username: string;
      role: UserRole;
    };
    authMethod?: 'apiKey' | 'jwt';
  }
}

export {};
