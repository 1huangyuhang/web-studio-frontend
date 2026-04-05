import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { getIo } from '../socketInstance';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/productSchema';
import { serializeMediaFields } from '../utils/serializeMedia';
import {
  prismaStringContains,
  prismaStringEquals,
} from '../utils/prismaStringFilter';

const productInclude = { category: true } satisfies Prisma.ProductInclude;
type ProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

async function resolveProductCategoryId(
  categoryId: number | undefined,
  category: string | undefined
): Promise<number> {
  if (categoryId != null && Number.isFinite(categoryId)) {
    const c = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!c) throw new Error('无效的分类 ID');
    return c.id;
  }
  const label = category?.trim();
  if (label) {
    const c = await prisma.category.findFirst({
      where: {
        OR: [
          { name: prismaStringEquals(label) },
          { slug: prismaStringEquals(label) },
        ],
      },
    });
    if (!c) {
      throw new Error(
        '未知的商品分类，请使用管理端维护的类目或有效的 categoryId'
      );
    }
    return c.id;
  }
  throw new Error('必须提供 categoryId 或 category');
}

function formatProduct(p: ProductWithCategory) {
  const media = serializeMediaFields(p);
  return {
    id: p.id,
    name: p.name,
    price: parseFloat(p.price.toString()),
    categoryId: p.categoryId,
    category: p.category.name,
    ...media,
    isNew: p.isNew,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function buildCategoryWhere(
  categoryParam: string | undefined
): Prisma.ProductWhereInput | undefined {
  if (!categoryParam?.trim()) return undefined;
  const idNum = parseInt(categoryParam, 10);
  if (!Number.isNaN(idNum) && String(idNum) === categoryParam.trim()) {
    return { categoryId: idNum };
  }
  const q = categoryParam.trim();
  return {
    OR: [
      { category: { name: prismaStringEquals(q) } },
      { category: { slug: prismaStringEquals(q) } },
    ],
  };
}

const getAllProducts = async (req: Request, res: Response) => {
  const queryParams = productQuerySchema.parse(req.query);
  const { page, pageSize, category, isNew, search } = queryParams;
  const skip = (page - 1) * pageSize;

  const parts: Prisma.ProductWhereInput[] = [];
  const catWhere = buildCategoryWhere(category);
  if (catWhere) parts.push(catWhere);
  if (isNew !== undefined) parts.push({ isNew });
  if (search?.trim()) {
    const q = search.trim();
    parts.push({
      OR: [
        { name: prismaStringContains(q) },
        { category: { name: prismaStringContains(q) } },
      ],
    });
  }
  const where: Prisma.ProductWhereInput =
    parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : { AND: parts };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  res.json({
    data: products.map(formatProduct),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
};

const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Product ID is required' });
    return;
  }

  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) {
    res.status(400).json({ error: 'Product ID must be a valid number' });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(formatProduct(product));
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const categoryId = await resolveProductCategoryId(
      validatedData.categoryId,
      validatedData.category
    );

    const productData: Prisma.ProductCreateInput = {
      name: validatedData.name,
      price: validatedData.price,
      category: { connect: { id: categoryId } },
      isNew: validatedData.isNew,
      image: req.file?.buffer ? new Uint8Array(req.file.buffer) : null,
      imageUrl: validatedData.imageUrl ?? null,
    };

    const product = await prisma.product.create({
      data: productData,
      include: productInclude,
    });

    const formattedProduct = formatProduct(product);
    getIo().emit('product:created', formattedProduct);
    res.status(201).json(formattedProduct);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      next(error);
      return;
    }
    console.error('创建产品失败:', error);
    const message = error instanceof Error ? error.message : '创建产品失败';
    res.status(400).json({ error: message });
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(parseInt(id, 10))) {
      res
        .status(400)
        .json({ error: 'Product ID is required and must be a number' });
      return;
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const validatedData = updateProductSchema.parse(req.body);

    const updateData: Prisma.ProductUpdateInput = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.price !== undefined) {
      updateData.price =
        typeof validatedData.price === 'string'
          ? parseFloat(validatedData.price)
          : validatedData.price;
    }
    if (validatedData.isNew !== undefined)
      updateData.isNew = validatedData.isNew;
    if (validatedData.imageUrl !== undefined) {
      updateData.imageUrl = validatedData.imageUrl ?? null;
    }

    if (
      validatedData.categoryId !== undefined ||
      validatedData.category !== undefined
    ) {
      const cid = await resolveProductCategoryId(
        validatedData.categoryId,
        validatedData.category
      );
      updateData.category = { connect: { id: cid } };
    }

    if (req.file?.buffer) {
      updateData.image = new Uint8Array(req.file.buffer);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: productInclude,
    });

    const formattedProduct = formatProduct(updatedProduct);
    getIo().emit('product:updated', formattedProduct);
    res.json(formattedProduct);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      next(error);
      return;
    }
    console.error('更新产品失败:', error);
    const message = error instanceof Error ? error.message : '更新产品失败';
    res.status(400).json({ error: message });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Number.isNaN(parseInt(id, 10))) {
    res
      .status(400)
      .json({ error: 'Product ID is required and must be a number' });
    return;
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!existingProduct) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const deletedProduct = await prisma.product.delete({
    where: { id: parseInt(id, 10) },
  });

  getIo().emit('product:deleted', deletedProduct.id);
  res.json({ message: 'Product deleted successfully' });
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
