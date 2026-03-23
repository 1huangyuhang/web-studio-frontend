import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { io } from '../app';
import {
  createNewsSchema,
  updateNewsSchema,
  newsQuerySchema,
} from '../schemas/newsSchema';

// 获取所有新闻
const getAllNews = async (req: Request, res: Response) => {
  // 使用Zod schema验证查询参数
  const queryParams = newsQuerySchema.parse(req.query);

  // 计算分页偏移量
  const { page, pageSize, search, date } = queryParams;
  const skip = (page - 1) * parseInt(pageSize as any, 10);

  // 构建查询条件
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (date) {
    where.date = date;
  }

  // 查询新闻列表和总数
  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: parseInt(pageSize as any, 10), // 确保take参数为数字类型
      orderBy: {
        createdAt: 'desc', // 默认按创建时间倒序排列
      },
    }),
    prisma.news.count({ where }),
  ]);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  // 将新闻列表中的image转换为base64
  const formattedNews = news.map((newsItem) => ({
    ...newsItem,
    image: newsItem.image
      ? Buffer.from(newsItem.image).toString('base64')
      : null,
  }));

  // 返回带分页信息的响应
  res.json({
    data: formattedNews,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
};

// 获取单个新闻
const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'News ID is required' });
      return;
    }

    // 验证id是否为有效的数字
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      res.status(400).json({ error: 'News ID must be a valid number' });
      return;
    }

    const newsItem = await prisma.news.findUnique({
      where: { id: newsId },
    });
    if (!newsItem) {
      res.status(404).json({ error: 'News not found' });
    } else {
      // 将image转换为base64
      const formattedNews = {
        ...newsItem,
        image: newsItem.image
          ? Buffer.from(newsItem.image).toString('base64')
          : null,
      };
      res.json(formattedNews);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

// 创建新闻
const createNews = async (req: Request, res: Response) => {
  // 使用Zod schema验证请求数据
  const validatedData = createNewsSchema.parse(req.body);

  // 处理image字段，确保兼容Prisma类型要求
  const newsData = {
    ...validatedData,
    image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
  };

  const news = await prisma.news.create({
    data: newsData,
  });

  // 将image转换为base64
  const formattedNews = {
    ...news,
    image: news.image ? Buffer.from(news.image).toString('base64') : null,
  };

  // 发送WebSocket事件，通知客户端有新闻创建
  io.emit('news:created', formattedNews);

  res.status(201).json(formattedNews);
};

// 更新新闻
const updateNews = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 验证新闻ID
  if (!id || isNaN(parseInt(id))) {
    res.status(400).json({ error: 'News ID is required and must be a number' });
    return;
  }

  // 检查新闻是否存在
  const existingNews = await prisma.news.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingNews) {
    res.status(404).json({ error: 'News not found' });
    return;
  }

  // 使用Zod schema验证请求数据
  const validatedData = updateNewsSchema.parse(req.body);

  // 过滤掉undefined值，确保兼容Prisma的update类型
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([, value]) => value !== undefined)
  ) as any;

  // 如果有文件上传，添加image字段
  if (req.file) {
    updateData['image'] = new Uint8Array(req.file.buffer);
  }

  const updatedNews = await prisma.news.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  // 将image转换为base64
  const formattedNews = {
    ...updatedNews,
    image: updatedNews.image
      ? Buffer.from(updatedNews.image).toString('base64')
      : null,
  };

  // 发送WebSocket事件，通知客户端新闻已更新
  io.emit('news:updated', formattedNews);

  res.json(formattedNews);
};

// 删除新闻
const deleteNews = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 验证新闻ID
  if (!id || isNaN(parseInt(id))) {
    res.status(400).json({ error: 'News ID is required and must be a number' });
    return;
  }

  // 检查新闻是否存在
  const existingNews = await prisma.news.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingNews) {
    res.status(404).json({ error: 'News not found' });
    return;
  }

  // 先获取要删除的新闻信息
  const deletedNews = await prisma.news.delete({
    where: { id: parseInt(id) },
  });

  // 发送WebSocket事件，通知客户端新闻已删除
  io.emit('news:deleted', deletedNews.id);

  res.json({ message: 'News deleted successfully' });
};

export { getAllNews, getNewsById, createNews, updateNews, deleteNews };
