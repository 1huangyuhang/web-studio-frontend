import { z } from 'zod';

/**
 * 管理端 axios 与各类反向代理下，query 可能是 string / number / string[]。
 * 仅用 z.string() 会在部分环境校验失败；统一先做预处理再 coerce。
 */
export const listQueryPage = z.preprocess(
  (v) => (v === undefined || v === null || v === '' ? undefined : v),
  z.coerce.number().int().min(1).default(1)
);

export const listQueryPageSize = z.preprocess(
  (v) => (v === undefined || v === null || v === '' ? undefined : v),
  z.coerce.number().int().min(1).max(100).default(10)
);

export const listQuerySearch = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return undefined;
  if (Array.isArray(v)) {
    const first = v[0];
    return first === undefined || first === null ? undefined : String(first);
  }
  return String(v);
}, z.string().optional());
