import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { io } from '../app';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
} from '../schemas/activitySchema';

// 获取所有活动
const getAllActivities = async (req: Request, res: Response) => {
  // 使用Zod schema验证查询参数
  const queryParams = activityQuerySchema.parse(req.query);

  // 计算分页偏移量
  const { page, pageSize, search } = queryParams;
  const skip = (page - 1) * parseInt(pageSize as any, 10);

  // 构建查询条件
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 查询活动列表和总数
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take: parseInt(pageSize as any, 10), // 确保take参数为数字类型
      orderBy: {
        createdAt: 'desc', // 默认按创建时间倒序排列
      },
    }),
    prisma.activity.count({ where }),
  ]);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  // 将活动列表中的image转换为base64
  const formattedActivities = activities.map((activity) => ({
    ...activity,
    image: activity.image
      ? Buffer.from(activity.image).toString('base64')
      : null,
  }));

  // 返回带分页信息的响应
  res.json({
    data: formattedActivities,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
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
      // 将image转换为base64
      const formattedActivity = {
        ...activity,
        image: activity.image
          ? Buffer.from(activity.image).toString('base64')
          : null,
      };
      res.json(formattedActivity);
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
    const activityData = {
      ...validatedData,
      image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
    };

    const activity = await prisma.activity.create({
      data: activityData,
    });

    // 将image转换为base64
    const formattedActivity = {
      ...activity,
      image: activity.image
        ? Buffer.from(activity.image).toString('base64')
        : null,
    };

    // 发送WebSocket事件，通知客户端有新活动创建
    io.emit('activity:created', formattedActivity);

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

    // 将image转换为base64
    const formattedActivity = {
      ...updatedActivity,
      image: updatedActivity.image
        ? Buffer.from(updatedActivity.image).toString('base64')
        : null,
    };

    // 发送WebSocket事件，通知客户端活动已更新
    io.emit('activity:updated', formattedActivity);

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
    io.emit('activity:deleted', deletedActivity.id);

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
