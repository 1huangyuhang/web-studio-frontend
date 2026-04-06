import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { getIo } from '../socketInstance';
import { prismaStringContains } from '../utils/prismaStringFilter';
import {
  createContactMessageSchema,
  contactMessageQuerySchema,
} from '../schemas/contactMessageSchema';

export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const v = createContactMessageSchema.parse(req.body);
    const row = await prisma.contactMessage.create({
      data: {
        name: v.name,
        phone: v.phone,
        email: v.email,
        company: v.company ?? null,
        subject: v.subject ?? null,
        message: v.message,
      },
    });
    getIo().emit('contactMessage:created', { id: row.id });
    res.status(201).json({
      id: row.id,
      message: '提交成功，我们会尽快与您联系。',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '提交失败';
    res.status(400).json({ error: msg });
  }
};

export const getAllContactMessages = async (req: Request, res: Response) => {
  const q = contactMessageQuerySchema.parse(req.query);
  const { page, pageSize, unreadOnly, search } = q;
  const skip = (page - 1) * pageSize;
  const where: Prisma.ContactMessageWhereInput = {
    ...(unreadOnly ? { read: false } : {}),
    ...(search
      ? {
          OR: [
            { name: prismaStringContains(search) },
            { phone: prismaStringContains(search) },
            { email: prismaStringContains(search) },
            { message: prismaStringContains(search) },
            { subject: prismaStringContains(search) },
            { company: prismaStringContains(search) },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  res.json({
    data: rows,
    pagination: { page, pageSize, total, totalPages },
  });
};

export const markContactMessageRead = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const row = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
    res.json(row);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
};

export const deleteContactMessage = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    await prisma.contactMessage.delete({ where: { id } });
    getIo().emit('contactMessage:deleted', id);
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
};
