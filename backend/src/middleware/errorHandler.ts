import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HttpError } from '../utils/httpError';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  errorRef: string;
  code?: string;
  errors?: { [key: string]: string };
}

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.requestId ?? 'unknown',
    errorRef: randomUUID(),
  };

  if (err instanceof ZodError) {
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Invalid request data';
    errorResponse.statusCode = 400;

    const formattedErrors: { [key: string]: string } = {};
    err.issues.forEach((issue: any) => {
      const field = issue.path.join('.');
      formattedErrors[field] = issue.message;
    });
    errorResponse.errors = formattedErrors;
    errorResponse.code = 'VALIDATION_ERROR';
  } else if (err instanceof HttpError) {
    errorResponse.error =
      err.statusCode === 404
        ? 'Not Found'
        : err.statusCode === 400
          ? 'Bad Request'
          : 'HTTP Error';
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
    if (err.code) {
      errorResponse.code = err.code;
    }
  } else if (err instanceof PrismaClientKnownRequestError) {
    errorResponse.error = 'Database Error';
    errorResponse.code = `PRISMA_${err.code}`;
    if (err.code === 'P2021' || err.code === 'P2022') {
      errorResponse.message =
        '数据库表或字段与当前服务版本不一致，请在部署环境执行 npx prisma migrate deploy（开发环境可用 migrate dev）后重试。';
      errorResponse.statusCode = 503;
    } else if (err.code === 'P1001') {
      errorResponse.message =
        '无法连接到数据库，请检查 DATABASE_URL 与网络、防火墙及连接池配置。';
      errorResponse.statusCode = 503;
    } else {
      errorResponse.message = '数据库操作失败';
    }
    console.error('PrismaClientKnownRequestError:', err.code, err.meta);
  } else if (err.statusCode) {
    errorResponse.error = err.name || 'HTTP Error';
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
    if (typeof err.code === 'string') {
      errorResponse.code = err.code;
    }
  } else if (
    err instanceof RangeError ||
    (typeof err?.message === 'string' &&
      err.message.includes('Invalid string length'))
  ) {
    errorResponse.error = 'Payload Too Large';
    errorResponse.message =
      '序列化响应过大（常见于列表含大量图片 Base64）。管理端列表请使用 GET /api/site-assets?omitImage=1，或改为外链 imageUrl。';
    errorResponse.statusCode = 413;
    errorResponse.code = 'RESPONSE_PAYLOAD_TOO_LARGE';
    console.error('Response serialization limit:', err);
  } else {
    errorResponse.code = 'INTERNAL_ERROR';
    console.error('Unexpected error:', err);
  }

  console.error(
    JSON.stringify({
      level: 'error',
      requestId: errorResponse.requestId,
      errorRef: errorResponse.errorRef,
      code: errorResponse.code ?? null,
      statusCode: errorResponse.statusCode,
      path: errorResponse.path,
      message: errorResponse.message,
    })
  );

  res.status(errorResponse.statusCode).json(errorResponse);
};

export default errorHandler;
