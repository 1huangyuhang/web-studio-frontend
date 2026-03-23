import { PrismaClient } from '@prisma/client';

// 配置Prisma客户端，只记录错误日志，减少调试日志输出
const prisma = new PrismaClient({
  log: ['error'],
});

export default prisma;
