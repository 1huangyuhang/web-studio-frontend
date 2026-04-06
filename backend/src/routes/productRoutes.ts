import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

/** 官网可匿名浏览 */
export const productPublicRouter = express.Router();
productPublicRouter.get('/', getAllProducts);
productPublicRouter.get('/:id', getProductById);

/** 管理端写入：需 API Key 或管理 JWT */
export const productManagementRouter = express.Router();
productManagementRouter.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  createProduct
);
productManagementRouter.put(
  '/:id',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  updateProduct
);
productManagementRouter.delete('/:id', deleteProduct);
