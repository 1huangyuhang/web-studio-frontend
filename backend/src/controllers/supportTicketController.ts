import { Request, Response } from 'express';
import type { Prisma, TicketStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { getIo } from '../socketInstance';
import {
  createSupportTicketBodySchema,
  supportTicketQuerySchema,
  patchSupportTicketSchema,
} from '../schemas/supportTicketSchema';
import { prismaStringContains } from '../utils/prismaStringFilter';

function listRow(row: {
  id: number;
  fullName: string;
  emailAddress: string;
  messageSubject: string;
  status: TicketStatus;
  createdAt: Date;
  attachment: Uint8Array | null;
  attachmentName: string | null;
}) {
  return {
    id: row.id,
    fullName: row.fullName,
    emailAddress: row.emailAddress,
    messageSubject: row.messageSubject,
    status: row.status,
    createdAt: row.createdAt,
    hasAttachment: row.attachment != null && row.attachment.length > 0,
    attachmentName: row.attachmentName,
  };
}

export const createSupportTicket = async (req: Request, res: Response) => {
  try {
    const v = createSupportTicketBodySchema.parse(req.body);
    const file = req.file;
    const row = await prisma.supportTicket.create({
      data: {
        fullName: v.fullName,
        phoneNumber: v.phoneNumber ?? null,
        emailAddress: v.emailAddress,
        companyName: v.companyName ?? null,
        messageSubject: v.messageSubject,
        askYourQuestion: v.askYourQuestion,
        attachment: file?.buffer ? new Uint8Array(file.buffer) : null,
        attachmentName: file?.originalname
          ? String(file.originalname).slice(0, 255)
          : null,
      },
    });
    getIo().emit('supportTicket:created', { id: row.id });
    res.status(201).json({
      id: row.id,
      message: '工单已提交，我们将在工作日内与您联系。',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '提交失败';
    res.status(400).json({ error: msg });
  }
};

export const getAllSupportTickets = async (req: Request, res: Response) => {
  const q = supportTicketQuerySchema.parse(req.query);
  const { page, pageSize, status, search } = q;
  const skip = (page - 1) * pageSize;
  const where: Prisma.SupportTicketWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { fullName: prismaStringContains(search) },
            { emailAddress: prismaStringContains(search) },
            { messageSubject: prismaStringContains(search) },
            { askYourQuestion: prismaStringContains(search) },
            { companyName: prismaStringContains(search) },
            { phoneNumber: prismaStringContains(search) },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  res.json({
    data: rows.map(listRow),
    pagination: { page, pageSize, total, totalPages },
  });
};

export const getSupportTicketById = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const row = await prisma.supportTicket.findUnique({ where: { id } });
  if (!row) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({
    id: row.id,
    fullName: row.fullName,
    phoneNumber: row.phoneNumber,
    emailAddress: row.emailAddress,
    companyName: row.companyName,
    messageSubject: row.messageSubject,
    askYourQuestion: row.askYourQuestion,
    status: row.status,
    attachmentName: row.attachmentName,
    hasAttachment: row.attachment != null && row.attachment.length > 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
};

export const downloadSupportTicketAttachment = async (
  req: Request,
  res: Response
) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const row = await prisma.supportTicket.findUnique({ where: { id } });
  if (!row || !row.attachment || row.attachment.length === 0) {
    res.status(404).json({ error: '无附件' });
    return;
  }
  const name = row.attachmentName || `ticket-${id}-attachment`;
  const buf = Buffer.from(row.attachment);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(name)}`
  );
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', String(buf.length));
  res.send(buf);
};

export const patchSupportTicket = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] || '', 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const v = patchSupportTicketSchema.parse(req.body);
    const row = await prisma.supportTicket.update({
      where: { id },
      data: { status: v.status },
    });
    getIo().emit('supportTicket:updated', { id: row.id, status: row.status });
    res.json(listRow(row));
  } catch (e: unknown) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      (e as { code?: string }).code === 'P2025'
    ) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const msg = e instanceof Error ? e.message : '更新失败';
    res.status(400).json({ error: msg });
  }
};

export const deleteSupportTicket = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    await prisma.supportTicket.delete({ where: { id } });
    getIo().emit('supportTicket:deleted', id);
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
};
