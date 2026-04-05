import { z } from 'zod';
import {
  listQueryPage,
  listQueryPageSize,
  listQuerySearch,
} from './listQueryCommon';

const optionalImageUrl = z
  .union([z.string().url().max(2048), z.literal('')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v));

// 新闻创建请求的Zod schema
export const createNewsSchema = z.object({
  title: z
    .string()
    .min(1, '新闻标题不能为空')
    .max(200, '新闻标题不能超过200个字符'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, '时间格式必须为HH:MM'),
  summary: z
    .string()
    .min(1, '新闻摘要不能为空')
    .max(500, '新闻摘要不能超过500个字符'),
  content: z.string().min(1, '新闻内容不能为空'),
  imageUrl: optionalImageUrl,
});

// 新闻更新请求的Zod schema
export const updateNewsSchema = z.object({
  title: z
    .string()
    .min(1, '新闻标题不能为空')
    .max(200, '新闻标题不能超过200个字符')
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD')
    .optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, '时间格式必须为HH:MM')
    .optional(),
  summary: z
    .string()
    .min(1, '新闻摘要不能为空')
    .max(500, '新闻摘要不能超过500个字符')
    .optional(),
  content: z.string().min(1, '新闻内容不能为空').optional(),
  imageUrl: optionalImageUrl,
});

// 新闻查询参数的Zod schema
export const newsQuerySchema = z.object({
  page: listQueryPage,
  pageSize: listQueryPageSize,
  search: listQuerySearch,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD')
    .optional(),
});

// 导出类型
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type NewsQueryInput = z.infer<typeof newsQuerySchema>;
