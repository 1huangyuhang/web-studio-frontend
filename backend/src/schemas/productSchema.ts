import { z } from 'zod';

// 产品创建请求的Zod schema
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, '产品名称不能为空')
    .max(100, '产品名称不能超过100个字符'),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), '价格必须是有效的数字')
    .refine((val) => val > 0, '价格必须大于0'),
  category: z.string().min(1, '分类不能为空').max(50, '分类不能超过50个字符'),
  isNew: z
    .union([z.boolean(), z.string()])
    .transform((val) =>
      typeof val === 'string' ? val.toLowerCase() === 'true' : val
    )
    .optional()
    .default(false),
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
  category: z
    .string()
    .min(1, '分类不能为空')
    .max(50, '分类不能超过50个字符')
    .optional(),
  isNew: z
    .union([z.boolean(), z.string()])
    .transform((val) =>
      typeof val === 'string' ? val.toLowerCase() === 'true' : val
    )
    .optional(),
});

// 产品查询参数的Zod schema
export const productQuerySchema = z.object({
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
  category: z.string().optional(),
  isNew: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  search: z.string().optional(),
});

// 导出类型
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
