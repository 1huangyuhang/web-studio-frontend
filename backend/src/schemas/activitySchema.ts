import { z } from 'zod';

// 活动创建请求的Zod schema
export const createActivitySchema = z.object({
  title: z
    .string()
    .min(1, '活动标题不能为空')
    .max(200, '活动标题不能超过200个字符'),
  description: z.string().min(1, '活动描述不能为空'),
});

// 活动更新请求的Zod schema
export const updateActivitySchema = z.object({
  title: z
    .string()
    .min(1, '活动标题不能为空')
    .max(200, '活动标题不能超过200个字符')
    .optional(),
  description: z.string().min(1, '活动描述不能为空').optional(),
});

// 活动查询参数的Zod schema
export const activityQuerySchema = z.object({
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
});

// 导出类型
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
