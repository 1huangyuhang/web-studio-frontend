import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// 定义错误响应接口
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  errors?: { [key: string]: string };
}

// 全局错误处理中间件
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // 初始化错误响应
  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // 处理Zod验证错误
  if (err instanceof ZodError) {
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Invalid request data';
    errorResponse.statusCode = 400;

    // 格式化Zod错误信息
    const formattedErrors: { [key: string]: string } = {};
    err.issues.forEach((issue: any) => {
      const field = issue.path.join('.');
      formattedErrors[field] = issue.message;
    });
    errorResponse.errors = formattedErrors;
  }
  // 处理HTTP错误
  else if (err.statusCode) {
    errorResponse.error = err.name || 'HTTP Error';
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
  }
  // 处理其他错误
  else {
    console.error('Unexpected error:', err);
  }

  // 返回错误响应
  res.status(errorResponse.statusCode).json(errorResponse);
};

export default errorHandler;
