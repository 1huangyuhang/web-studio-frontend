import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { io } from '../app';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/productSchema';

// 获取所有产品
const getAllProducts = async (req: Request, res: Response) => {
  // 使用Zod schema验证查询参数
  const queryParams = productQuerySchema.parse(req.query);

  // 计算分页偏移量
  const { page, pageSize, category, isNew, search } = queryParams;
  const skip = (page - 1) * parseInt(pageSize as any, 10);

  // 构建查询条件
  const where: any = {};
  if (category) {
    where.category = category;
  }
  if (isNew !== undefined) {
    where.isNew = isNew;
  }
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  // 查询产品列表和总数
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(pageSize as any, 10), // 确保take参数为数字类型
      orderBy: {
        createdAt: 'desc', // 默认按创建时间倒序排列
      },
    }),
    prisma.product.count({ where }),
  ]);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  // 将产品列表中的price字段从Decimal转换为Number，处理image为base64
  const formattedProducts = products.map((product) => ({
    ...product,
    price: parseFloat(product.price.toString()),
    image: product.image ? Buffer.from(product.image).toString('base64') : null,
  }));

  // 返回带分页信息的响应
  res.json({
    data: formattedProducts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
};

// 获取单个产品
const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Product ID is required' });
    return;
  }

  // 验证id是否为有效的数字
  const productId = parseInt(id);
  if (isNaN(productId)) {
    res.status(400).json({ error: 'Product ID must be a valid number' });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
  } else {
    // 将price字段从Decimal转换为Number，处理image为base64
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price.toString()),
      image: product.image
        ? Buffer.from(product.image).toString('base64')
        : null,
    };
    res.json(formattedProduct);
  }
};

// 创建产品
const createProduct = async (req: Request, res: Response) => {
  try {
    // 由于使用了multer处理文件上传，req.body是一个对象，不是JSON
    // 使用Zod schema验证请求数据
    const validatedData = createProductSchema.parse(req.body);

    // 处理image字段，确保兼容Prisma类型要求
    const productData = {
      ...validatedData,
      image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
      // 确保price是数字类型
      price:
        typeof validatedData.price === 'string'
          ? parseFloat(validatedData.price)
          : validatedData.price,
    };

    const product = await prisma.product.create({
      data: productData,
    });

    // 将price字段从Decimal转换为Number，处理image为base64
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price.toString()),
      image: product.image
        ? Buffer.from(product.image).toString('base64')
        : null,
    };

    // 发送WebSocket事件，通知客户端有新产品创建
    io.emit('product:created', formattedProduct);

    res.status(201).json(formattedProduct);
  } catch (error: any) {
    console.error('创建产品失败:', error);
    res.status(400).json({ error: error.message || '创建产品失败' });
  }
};

// 更新产品
const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 验证产品ID
    if (!id || isNaN(parseInt(id))) {
      res
        .status(400)
        .json({ error: 'Product ID is required and must be a number' });
      return;
    }

    // 检查产品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // 使用Zod schema验证请求数据
    const validatedData = updateProductSchema.parse(req.body);

    // 过滤掉undefined值，确保兼容Prisma的update类型
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined)
    ) as any;

    // 如果有文件上传，添加image字段
    if (req.file) {
      updateData['image'] = new Uint8Array(req.file.buffer);
    }

    // 确保price是数字类型（如果提供了price）
    if (updateData.price) {
      updateData.price =
        typeof updateData.price === 'string'
          ? parseFloat(updateData.price)
          : updateData.price;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // 将price字段从Decimal转换为Number，处理image为base64
    const formattedProduct = {
      ...updatedProduct,
      price: parseFloat(updatedProduct.price.toString()),
      image: updatedProduct.image
        ? Buffer.from(updatedProduct.image).toString('base64')
        : null,
    };

    // 发送WebSocket事件，通知客户端产品已更新
    io.emit('product:updated', formattedProduct);

    res.json(formattedProduct);
  } catch (error: any) {
    console.error('更新产品失败:', error);
    res.status(400).json({ error: error.message || '更新产品失败' });
  }
};

// 删除产品
const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  // 验证产品ID
  if (!id || isNaN(parseInt(id))) {
    res
      .status(400)
      .json({ error: 'Product ID is required and must be a number' });
    return;
  }

  // 检查产品是否存在
  const existingProduct = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingProduct) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  // 先获取要删除的产品信息
  const deletedProduct = await prisma.product.delete({
    where: { id: parseInt(id) },
  });

  // 发送WebSocket事件，通知客户端产品已删除
  io.emit('product:deleted', deletedProduct.id);

  res.json({ message: 'Product deleted successfully' });
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
