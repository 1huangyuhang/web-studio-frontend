import { z } from 'zod';

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
});

// 新闻查询参数的Zod schema
export const newsQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, '页码必须大于0'),
  pageSize: z
    .string()
    .default('10')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, '每页数量必须在1-100之间'),
  search: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD')
    .optional(),
});

// 导出类型
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type NewsQueryInput = z.infer<typeof newsQuerySchema>;
