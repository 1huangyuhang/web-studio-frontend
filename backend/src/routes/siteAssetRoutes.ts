import express from 'express';
import {
  getSiteAssets,
  getSiteAssetById,
  createSiteAsset,
  createSiteAssetFromUrl,
  updateSiteAsset,
  deleteSiteAsset,
} from '../controllers/siteAssetController';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

export const siteAssetPublicRouter = express.Router();
siteAssetPublicRouter.get('/', getSiteAssets);
siteAssetPublicRouter.get('/:id', getSiteAssetById);

export const siteAssetManagementRouter = express.Router();
siteAssetManagementRouter.post('/import-url', createSiteAssetFromUrl);
siteAssetManagementRouter.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  createSiteAsset
);
siteAssetManagementRouter.put(
  '/:id',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  updateSiteAsset
);
siteAssetManagementRouter.delete('/:id', deleteSiteAsset);
