import { TicketStatus } from '@prisma/client';
import { z } from 'zod';

/** multipart body 字段校验（不含文件） */
export const createSupportTicketBodySchema = z.object({
  fullName: z.string().min(1).max(255),
  phoneNumber: z.string().max(64).optional().nullable(),
  emailAddress: z.string().email().max(255),
  companyName: z.string().max(255).optional().nullable(),
  messageSubject: z.string().min(1).max(500),
  askYourQuestion: z.string().min(1),
});

export const supportTicketQuerySchema = z.object({
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
  status: z.nativeEnum(TicketStatus).optional(),
  search: z
    .string()
    .optional()
    .transform((v) => {
      const t = (v ?? '').trim();
      return t.length > 0 ? t : undefined;
    }),
});

export const patchSupportTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});
