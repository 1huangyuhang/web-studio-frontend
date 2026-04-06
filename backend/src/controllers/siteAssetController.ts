import { Request, Response, NextFunction } from 'express';
import {
  createSiteAssetSchema,
  createSiteAssetFromUrlSchema,
  updateSiteAssetSchema,
} from '../schemas/siteAssetSchema';
import {
  listSiteAssetsApplication,
  getSiteAssetByIdApplication,
  createSiteAssetApplication,
  updateSiteAssetApplication,
  deleteSiteAssetApplication,
  createSiteAssetFromUrlApplication,
} from '../application/site-asset/siteAssetApplication';

function parseOmitImageFlag(raw: unknown): boolean {
  if (raw === true) return true;
  if (typeof raw !== 'string') return false;
  const t = raw.trim().toLowerCase();
  return t === '1' || t === 'true' || t === 'yes';
}

export const getSiteAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query['page'] as string | undefined;
    const omitImage = parseOmitImageFlag(req.query['omitImage']);
    const list = await listSiteAssetsApplication(page, { omitImage });
    res.json({ data: list });
  } catch (e) {
    next(e);
  }
};

export const getSiteAssetById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params['id'] || '', 10);
    const data = await getSiteAssetByIdApplication(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
};

export const createSiteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = createSiteAssetSchema.parse(req.body);
    const data = await createSiteAssetApplication(parsed, req.file?.buffer);
    res.status(201).json({ data });
  } catch (e) {
    next(e);
  }
};

export const updateSiteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params['id'] || '', 10);
    const parsed = updateSiteAssetSchema.parse(req.body);
    const data = await updateSiteAssetApplication(id, parsed, req.file?.buffer);
    res.json({ data });
  } catch (e) {
    next(e);
  }
};

export const deleteSiteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params['id'] || '', 10);
    await deleteSiteAssetApplication(id);
    res.json({ data: { message: 'Site asset deleted successfully' } });
  } catch (e) {
    next(e);
  }
};

export const createSiteAssetFromUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = createSiteAssetFromUrlSchema.parse(req.body);
    const data = await createSiteAssetFromUrlApplication(parsed);
    res.status(201).json({ data });
  } catch (e) {
    next(e);
  }
};
