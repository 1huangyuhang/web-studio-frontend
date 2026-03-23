import prisma from './prisma';

/**
 * 执行数据库事务
 * @param callback 事务回调函数，包含需要在事务中执行的数据库操作
 * @returns 事务执行结果
 */
export const executeTransaction = async <T>(
  callback: () => Promise<T>
): Promise<T> => {
  try {
    // 使用Prisma的事务功能包装数据库操作
    const result = await prisma.$transaction(callback);
    return result;
  } catch (error) {
    // 记录事务错误
    console.error('事务执行失败:', error);
    // 重新抛出错误，让上层处理
    throw error;
  }
};

/**
 * 执行包含多个步骤的数据库事务
 * @param steps 事务步骤数组，每个步骤都是一个返回Promise的函数
 * @returns 事务执行结果数组
 */
export const executeTransactionSteps = async <T>(
  steps: Array<() => Promise<T>>
): Promise<T[]> => {
  try {
    // 使用Prisma的事务功能执行多个步骤
    // 由于Prisma事务不直接支持异步函数数组，我们使用回调函数的方式执行
    const results: T[] = [];
    await prisma.$transaction(async () => {
      for (const step of steps) {
        const result = await step();
        results.push(result);
      }
    });
    return results;
  } catch (error) {
    // 记录事务错误
    console.error('事务执行失败:', error);
    // 重新抛出错误，让上层处理
    throw error;
  }
};
