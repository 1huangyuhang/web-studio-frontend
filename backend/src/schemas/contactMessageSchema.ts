import { z } from 'zod';

export const createContactMessageSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(1).max(64),
  email: z.string().email().max(255),
  company: z.string().max(255).optional().nullable(),
  subject: z.string().max(500).optional().nullable(),
  message: z.string().min(1),
});

export const contactMessageQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0),
  pageSize: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100),
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  search: z
    .string()
    .optional()
    .transform((v) => {
      const t = (v ?? '').trim();
      return t.length > 0 ? t : undefined;
    }),
});
