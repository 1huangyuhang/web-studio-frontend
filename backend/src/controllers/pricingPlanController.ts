import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getIo } from '../socketInstance';
import {
  createPricingPlanSchema,
  updatePricingPlanSchema,
  pricingPlanQuerySchema,
} from '../schemas/pricingPlanSchema';
import { serializeMediaFields } from '../utils/serializeMedia';
import { prismaStringContains } from '../utils/prismaStringFilter';

function parseFeatures(raw: string): string {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return '[]';
    const strings = v.filter((x): x is string => typeof x === 'string');
    return JSON.stringify(strings);
  } catch {
    throw new Error('features 须为 JSON 字符串数组');
  }
}

function formatPlan(row: {
  id: number;
  name: string;
  price: { toString: () => string };
  description: string;
  features: string;
  isPopular: boolean;
  tag: string | null;
  image: Uint8Array | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  let features: string[] = [];
  try {
    const v = JSON.parse(row.features) as unknown;
    if (Array.isArray(v)) {
      features = v.filter((x): x is string => typeof x === 'string');
    }
  } catch {
    features = [];
  }
  const media = serializeMediaFields(row);
  return {
    id: row.id,
    name: row.name,
    price: parseFloat(row.price.toString()),
    description: row.description,
    features,
    isPopular: row.isPopular,
    tag: row.tag,
    ...media,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const getAllPricingPlans = async (req: Request, res: Response) => {
  const q = pricingPlanQuerySchema.parse(req.query);
  const { page, pageSize, search } = q;
  const skip = (page - 1) * pageSize;
  const where: Record<string, unknown> = {};
  if (search) {
    where['OR'] = [
      { name: prismaStringContains(search) },
      { description: prismaStringContains(search) },
    ];
  }
  const [rows, total] = await Promise.all([
    prisma.pricingPlan.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
    prisma.pricingPlan.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  res.json({
    data: rows.map(formatPlan),
    pagination: { page, pageSize, total, totalPages },
  });
};

export const getPricingPlanById = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const row = await prisma.pricingPlan.findUnique({ where: { id } });
  if (!row) {
    res.status(404).json({ error: 'Pricing plan not found' });
    return;
  }
  res.json(formatPlan(row));
};

export const createPricingPlan = async (req: Request, res: Response) => {
  try {
    const validated = createPricingPlanSchema.parse(req.body);
    const featuresJson = parseFeatures(validated.features);
    const { imageUrl, ...rest } = validated;
    const row = await prisma.pricingPlan.create({
      data: {
        name: rest.name,
        price: rest.price,
        description: rest.description,
        features: featuresJson,
        isPopular: rest.isPopular ?? false,
        tag:
          rest.tag != null && String(rest.tag).trim() !== ''
            ? String(rest.tag).trim()
            : null,
        sortOrder: rest.sortOrder ?? 0,
        image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
        imageUrl: imageUrl ?? null,
      },
    });
    const formatted = formatPlan(row);
    getIo().emit('pricingPlan:created', formatted);
    res.status(201).json(formatted);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '创建失败';
    res.status(400).json({ error: msg });
  }
};

export const updatePricingPlan = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] || '', 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const existing = await prisma.pricingPlan.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Pricing plan not found' });
      return;
    }
    const validated = updatePricingPlanSchema.parse(req.body);
    const data: Record<string, unknown> = {};
    if (validated.name !== undefined) data['name'] = validated.name;
    if (validated.price !== undefined) data['price'] = validated.price;
    if (validated.description !== undefined)
      data['description'] = validated.description;
    if (validated.features !== undefined)
      data['features'] = parseFeatures(validated.features);
    if (validated.isPopular !== undefined)
      data['isPopular'] = validated.isPopular;
    if (validated.tag !== undefined) {
      const t = validated.tag;
      data['tag'] =
        t != null && String(t).trim() !== '' ? String(t).trim() : null;
    }
    if (validated.sortOrder !== undefined)
      data['sortOrder'] = validated.sortOrder;
    if (validated.imageUrl !== undefined)
      data['imageUrl'] = validated.imageUrl ?? null;
    if (req.file?.buffer) data['image'] = new Uint8Array(req.file.buffer);

    const row = await prisma.pricingPlan.update({
      where: { id },
      data: data as Parameters<typeof prisma.pricingPlan.update>[0]['data'],
    });
    const formatted = formatPlan(row);
    getIo().emit('pricingPlan:updated', formatted);
    res.json(formatted);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '更新失败';
    res.status(400).json({ error: msg });
  }
};

export const deletePricingPlan = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    await prisma.pricingPlan.delete({ where: { id } });
    getIo().emit('pricingPlan:deleted', id);
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Pricing plan not found' });
  }
};
