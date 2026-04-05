import { z } from 'zod';
import {
  listQueryPage,
  listQueryPageSize,
  listQuerySearch,
} from './listQueryCommon';

const optionalImageUrl = z
  .union([z.string().url('请输入有效图片 URL').max(2048), z.literal('')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v));

// 产品创建请求的Zod schema
export const createProductSchema = z
  .object({
    name: z
      .string()
      .min(1, '产品名称不能为空')
      .max(100, '产品名称不能超过100个字符'),
    price: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val), '价格必须是有效的数字')
      .refine((val) => val > 0, '价格必须大于0'),
    categoryId: z.coerce.number().int().positive().optional(),
    category: z.string().min(1, '分类不能为空').max(100).optional(),
    isNew: z
      .union([z.boolean(), z.string()])
      .transform((val) =>
        typeof val === 'string' ? val.toLowerCase() === 'true' : val
      )
      .optional()
      .default(false),
    imageUrl: optionalImageUrl,
  })
  .superRefine((data, ctx) => {
    if (data.categoryId == null && (!data.category || !data.category.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请提供 categoryId 或 category（与已有类目名称匹配）',
        path: ['categoryId'],
      });
    }
  });

// 产品更新请求的Zod schema
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, '产品名称不能为空')
    .max(100, '产品名称不能超过100个字符')
    .optional(),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), '价格必须是有效的数字')
    .refine((val) => val > 0, '价格必须大于0')
    .optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  category: z.string().min(1).max(100).optional(),
  isNew: z
    .union([z.boolean(), z.string()])
    .transform((val) =>
      typeof val === 'string' ? val.toLowerCase() === 'true' : val
    )
    .optional(),
  imageUrl: optionalImageUrl,
});

// 产品查询参数的Zod schema
export const productQuerySchema = z.object({
  page: listQueryPage,
  pageSize: listQueryPageSize,
  category: z.string().optional(),
  isNew: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  search: listQuerySearch,
});

// 导出类型
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
