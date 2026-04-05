import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getIo } from '../socketInstance';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
} from '../schemas/courseSchema';
import { serializeMediaFields } from '../utils/serializeMedia';
import { prismaStringContains } from '../utils/prismaStringFilter';

function parseTags(raw: string): string {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return '[]';
    const strings = v.filter((x): x is string => typeof x === 'string');
    return JSON.stringify(strings);
  } catch {
    return '[]';
  }
}

function formatCourse(row: {
  id: number;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: { toString: () => string };
  description: string;
  image: Uint8Array | null;
  imageUrl: string | null;
  tags: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  let tags: string[] = [];
  try {
    const v = JSON.parse(row.tags) as unknown;
    if (Array.isArray(v)) {
      tags = v.filter((x): x is string => typeof x === 'string');
    }
  } catch {
    tags = [];
  }
  const media = serializeMediaFields(row);
  return {
    id: row.id,
    title: row.title,
    instructor: row.instructor,
    category: row.category,
    duration: row.duration,
    students: row.students,
    rating: row.rating,
    price: parseFloat(row.price.toString()),
    description: row.description,
    ...media,
    tags,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const getAllCourses = async (req: Request, res: Response) => {
  const q = courseQuerySchema.parse(req.query);
  const { page, pageSize, search, category } = q;
  const skip = (page - 1) * pageSize;
  const where: Record<string, unknown> = {};
  if (category) where['category'] = category;
  if (search) {
    where['OR'] = [
      { title: prismaStringContains(search) },
      { description: prismaStringContains(search) },
      { instructor: prismaStringContains(search) },
    ];
  }
  const [rows, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
    prisma.course.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  res.json({
    data: rows.map(formatCourse),
    pagination: { page, pageSize, total, totalPages },
  });
};

export const getCourseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const row = await prisma.course.findUnique({ where: { id } });
  if (!row) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json(formatCourse(row));
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const validated = createCourseSchema.parse(req.body);
    const tagsJson = parseTags(validated.tags ?? '[]');
    const { imageUrl, ...rest } = validated;
    const row = await prisma.course.create({
      data: {
        title: rest.title,
        instructor: rest.instructor,
        category: rest.category,
        duration: rest.duration,
        students: rest.students,
        rating: rest.rating,
        price: rest.price,
        description: rest.description,
        tags: tagsJson,
        sortOrder: rest.sortOrder ?? 0,
        image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
        imageUrl: imageUrl ?? null,
      },
    });
    const formatted = formatCourse(row);
    getIo().emit('course:created', formatted);
    res.status(201).json(formatted);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '创建失败';
    res.status(400).json({ error: msg });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] || '', 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    const validated = updateCourseSchema.parse(req.body);
    const data: Record<string, unknown> = {};
    if (validated.title !== undefined) data['title'] = validated.title;
    if (validated.instructor !== undefined)
      data['instructor'] = validated.instructor;
    if (validated.category !== undefined) data['category'] = validated.category;
    if (validated.duration !== undefined) data['duration'] = validated.duration;
    if (validated.students !== undefined) data['students'] = validated.students;
    if (validated.rating !== undefined) data['rating'] = validated.rating;
    if (validated.price !== undefined) data['price'] = validated.price;
    if (validated.description !== undefined)
      data['description'] = validated.description;
    if (validated.tags !== undefined) data['tags'] = parseTags(validated.tags);
    if (validated.sortOrder !== undefined)
      data['sortOrder'] = validated.sortOrder;
    if (validated.imageUrl !== undefined)
      data['imageUrl'] = validated.imageUrl ?? null;
    if (req.file?.buffer) data['image'] = new Uint8Array(req.file.buffer);

    const row = await prisma.course.update({
      where: { id },
      data: data as Parameters<typeof prisma.course.update>[0]['data'],
    });
    const formatted = formatCourse(row);
    getIo().emit('course:updated', formatted);
    res.json(formatted);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '更新失败';
    res.status(400).json({ error: msg });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '', 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    await prisma.course.delete({ where: { id } });
    getIo().emit('course:deleted', id);
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Course not found' });
  }
};
