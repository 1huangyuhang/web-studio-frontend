import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { getIo } from '../socketInstance';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
} from '../schemas/activitySchema';
import { serializeMediaFields } from '../utils/serializeMedia';
import { prismaStringContains } from '../utils/prismaStringFilter';

function formatActivity<
  T extends { image: Uint8Array | null; imageUrl: string | null },
>(activity: T) {
  const media = serializeMediaFields(activity);
  // 不把 BYTEA 展开进 JSON；展示字段由 media 提供
  const { image: _image, ...rest } = activity;
  void _image;
  return { ...rest, ...media };
}

// 获取所有活动
const getAllActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = activityQuerySchema.parse(req.query);
    const { page, pageSize, search } = queryParams;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (search) {
      where['OR'] = [
        { title: prismaStringContains(search) },
        { description: prismaStringContains(search) },
      ];
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.activity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const formattedActivities = activities.map((activity) =>
      formatActivity(activity)
    );

    res.json({
      data: formattedActivities,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (e) {
    next(e);
  }
};

// 获取单个活动
const getActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Activity ID is required' });
      return;
    }

    // 验证id是否为有效的数字
    const activityId = parseInt(id);
    if (isNaN(activityId)) {
      res.status(400).json({ error: 'Activity ID must be a valid number' });
      return;
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
    } else {
      res.json(formatActivity(activity));
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

// 创建活动
const createActivity = async (req: Request, res: Response) => {
  try {
    // 由于使用了multer处理文件上传，req.body是一个对象，不是JSON
    // 使用Zod schema验证请求数据
    const validatedData = createActivitySchema.parse(req.body);

    // 处理image字段，确保兼容Prisma类型要求
    const { imageUrl, ...rest } = validatedData;
    const activityData = {
      ...rest,
      image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
      imageUrl: imageUrl ?? null,
    };

    const activity = await prisma.activity.create({
      data: activityData,
    });

    const formattedActivity = formatActivity(activity);

    // 发送WebSocket事件，通知客户端有新活动创建
    getIo().emit('activity:created', formattedActivity);

    res.status(201).json(formattedActivity);
  } catch (error: any) {
    console.error('创建活动失败:', error);
    res.status(400).json({ error: error.message || '创建活动失败' });
  }
};

// 更新活动
const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 验证活动ID
    if (!id || isNaN(parseInt(id))) {
      res
        .status(400)
        .json({ error: 'Activity ID is required and must be a number' });
      return;
    }

    // 检查活动是否存在
    const existingActivity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingActivity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // 使用Zod schema验证请求数据
    const validatedData = updateActivitySchema.parse(req.body);

    // 过滤掉undefined值，确保兼容Prisma的update类型
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined)
    ) as any;

    // 如果有文件上传，添加image字段
    if (req.file) {
      updateData['image'] = new Uint8Array(req.file.buffer);
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    const formattedActivity = formatActivity(updatedActivity);

    // 发送WebSocket事件，通知客户端活动已更新
    getIo().emit('activity:updated', formattedActivity);

    res.json(formattedActivity);
  } catch (error: any) {
    console.error('更新活动失败:', error);
    res.status(400).json({ error: error.message || '更新活动失败' });
  }
};

// 删除活动
const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 验证活动ID
    if (!id || isNaN(parseInt(id))) {
      res
        .status(400)
        .json({ error: 'Activity ID is required and must be a number' });
      return;
    }

    // 检查活动是否存在
    const existingActivity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingActivity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // 先获取要删除的活动信息
    const deletedActivity = await prisma.activity.delete({
      where: { id: parseInt(id) },
    });

    // 发送WebSocket事件，通知客户端活动已删除
    getIo().emit('activity:deleted', deletedActivity.id);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error: any) {
    console.error('删除活动失败:', error);
    res.status(400).json({ error: error.message || '删除活动失败' });
  }
};

export {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
