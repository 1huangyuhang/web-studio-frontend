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

// 活动创建请求的Zod schema
export const createActivitySchema = z.object({
  title: z
    .string()
    .min(1, '活动标题不能为空')
    .max(200, '活动标题不能超过200个字符'),
  description: z.string().min(1, '活动描述不能为空'),
  imageUrl: optionalImageUrl,
});

// 活动更新请求的Zod schema
export const updateActivitySchema = z.object({
  title: z
    .string()
    .min(1, '活动标题不能为空')
    .max(200, '活动标题不能超过200个字符')
    .optional(),
  description: z.string().min(1, '活动描述不能为空').optional(),
  imageUrl: optionalImageUrl,
});

// 活动查询参数的Zod schema
export const activityQuerySchema = z.object({
  page: listQueryPage,
  pageSize: listQueryPageSize,
  search: listQuerySearch,
});

// 导出类型
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
