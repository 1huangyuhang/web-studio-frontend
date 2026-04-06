import type { SiteAsset } from '@prisma/client';
import type { z } from 'zod';
import * as repo from '../../infrastructure/persistence/siteAssetRepository';
import type { SiteAssetListRow } from '../../infrastructure/persistence/siteAssetRepository';
import { HttpError } from '../../utils/httpError';
import { serializeMediaFields } from '../../utils/serializeMedia';
import {
  createSiteAssetSchema,
  createSiteAssetFromUrlSchema,
  updateSiteAssetSchema,
} from '../../schemas/siteAssetSchema';
import type { SerializedSiteAsset } from './types';

export function serializeSiteAsset(row: SiteAsset): SerializedSiteAsset {
  const media = serializeMediaFields(row);
  return {
    id: row.id,
    page: row.page,
    groupKey: row.groupKey,
    sortOrder: row.sortOrder,
    title: row.title,
    alt: row.alt,
    content: row.content,
    meta: row.meta,
    ...media,
    videoUrl: row.videoUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** 列表精简：不序列化 BYTEA→Base64，编辑时再 GET /:id */
export function serializeSiteAssetListItem(
  row: SiteAssetListRow
): SerializedSiteAsset {
  const media = serializeMediaFields({
    image: null,
    imageUrl: row.imageUrl,
  });
  return {
    id: row.id,
    page: row.page,
    groupKey: row.groupKey,
    sortOrder: row.sortOrder,
    title: row.title,
    alt: row.alt,
    content: row.content,
    meta: row.meta,
    ...media,
    videoUrl: row.videoUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const emptyToNull = (v: string | undefined): string | null | undefined => {
  if (v === undefined) return undefined;
  const t = v.trim();
  return t === '' ? null : t;
};

type CreateParsed = z.infer<typeof createSiteAssetSchema>;
type UpdateParsed = z.infer<typeof updateSiteAssetSchema>;
type FromUrlParsed = z.infer<typeof createSiteAssetFromUrlSchema>;

const MAX_IMPORT_IMAGE_BYTES = 12 * 1024 * 1024;

export async function listSiteAssetsApplication(
  pageFilter?: string,
  options?: { omitImage?: boolean }
): Promise<SerializedSiteAsset[]> {
  const where = pageFilter ? { page: pageFilter } : {};
  if (options?.omitImage) {
    const list = await repo.findManySiteAssetsMeta(where);
    return list.map(serializeSiteAssetListItem);
  }
  const list = await repo.findManySiteAssets(where);
  return list.map(serializeSiteAsset);
}

export async function getSiteAssetByIdApplication(
  id: number
): Promise<SerializedSiteAsset> {
  if (Number.isNaN(id)) {
    throw new HttpError(400, 'Invalid id', 'VALIDATION_ERROR');
  }
  const row = await repo.findSiteAssetById(id);
  if (!row) {
    throw new HttpError(404, 'Site asset not found', 'NOT_FOUND');
  }
  return serializeSiteAsset(row);
}

export async function createSiteAssetApplication(
  parsed: CreateParsed,
  imageBuffer?: Buffer
): Promise<SerializedSiteAsset> {
  const hasImage = !!imageBuffer?.length;
  const hasImageUrl = !!(parsed.imageUrl && String(parsed.imageUrl).trim());
  const hasVideo = !!(parsed.videoUrl && String(parsed.videoUrl).trim());
  const hasText = !!(parsed.content && String(parsed.content).trim());
  if (!hasImage && !hasImageUrl && !hasVideo && !hasText) {
    throw new HttpError(
      400,
      '至少需要上传图片、填写视频地址或填写正文之一',
      'VALIDATION_ERROR'
    );
  }
  const row = await repo.createSiteAssetRow({
    page: parsed.page,
    groupKey: parsed.groupKey,
    sortOrder: parsed.sortOrder,
    title: emptyToNull(parsed.title) ?? null,
    alt: emptyToNull(parsed.alt) ?? null,
    content: emptyToNull(parsed.content) ?? null,
    meta: emptyToNull(parsed.meta) ?? null,
    videoUrl: emptyToNull(parsed.videoUrl) ?? null,
    image: imageBuffer?.length ? new Uint8Array(imageBuffer) : null,
    imageUrl: hasImageUrl ? String(parsed.imageUrl).trim() : null,
  });
  return serializeSiteAsset(row);
}

export async function updateSiteAssetApplication(
  id: number,
  parsed: UpdateParsed,
  imageBuffer?: Buffer
): Promise<SerializedSiteAsset> {
  if (Number.isNaN(id)) {
    throw new HttpError(400, 'Invalid id', 'VALIDATION_ERROR');
  }
  const existing = await repo.findSiteAssetById(id);
  if (!existing) {
    throw new HttpError(404, 'Site asset not found', 'NOT_FOUND');
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.page !== undefined) updateData['page'] = parsed.page;
  if (parsed.groupKey !== undefined) updateData['groupKey'] = parsed.groupKey;
  if (parsed.sortOrder !== undefined)
    updateData['sortOrder'] = parsed.sortOrder;
  if (parsed.title !== undefined) {
    updateData['title'] = emptyToNull(parsed.title) ?? null;
  }
  if (parsed.alt !== undefined) {
    updateData['alt'] = emptyToNull(parsed.alt) ?? null;
  }
  if (parsed.videoUrl !== undefined) {
    updateData['videoUrl'] = emptyToNull(parsed.videoUrl) ?? null;
  }
  if (parsed.content !== undefined) {
    updateData['content'] = emptyToNull(parsed.content) ?? null;
  }
  if (parsed.meta !== undefined) {
    updateData['meta'] = emptyToNull(parsed.meta) ?? null;
  }
  if ('imageUrl' in parsed && parsed.imageUrl !== undefined) {
    updateData['imageUrl'] = emptyToNull(parsed.imageUrl as string) ?? null;
  }
  if (imageBuffer?.length) {
    updateData['image'] = new Uint8Array(imageBuffer);
  }
  const row = await repo.updateSiteAssetRow(id, updateData as any);
  return serializeSiteAsset(row);
}

export async function deleteSiteAssetApplication(id: number): Promise<void> {
  if (Number.isNaN(id)) {
    throw new HttpError(400, 'Invalid id', 'VALIDATION_ERROR');
  }
  const existing = await repo.findSiteAssetById(id);
  if (!existing) {
    throw new HttpError(404, 'Site asset not found', 'NOT_FOUND');
  }
  await repo.deleteSiteAssetRow(id);
}

export async function createSiteAssetFromUrlApplication(
  parsed: FromUrlParsed
): Promise<SerializedSiteAsset> {
  const imgRes = await fetch(parsed.imageUrl, {
    redirect: 'follow',
    headers: { Accept: 'image/*,*/*' },
  });
  if (!imgRes.ok) {
    throw new HttpError(
      400,
      `无法下载图片：HTTP ${imgRes.status}`,
      'UPSTREAM_ERROR'
    );
  }
  const ct = (imgRes.headers.get('content-type') || '').toLowerCase();
  const looksLikeImage =
    !ct ||
    ct.startsWith('image/') ||
    ct.includes('octet-stream') ||
    ct.includes('binary');
  if (!looksLikeImage) {
    throw new HttpError(400, 'URL 返回的内容类型不是图片', 'VALIDATION_ERROR');
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  if (buf.length === 0) {
    throw new HttpError(400, '图片内容为空', 'VALIDATION_ERROR');
  }
  if (buf.length > MAX_IMPORT_IMAGE_BYTES) {
    throw new HttpError(400, '图片超过大小限制（12MB）', 'VALIDATION_ERROR');
  }

  const row = await repo.createSiteAssetRow({
    page: parsed.page,
    groupKey: parsed.groupKey,
    sortOrder: parsed.sortOrder,
    title: emptyToNull(parsed.title) ?? null,
    alt: emptyToNull(parsed.alt) ?? null,
    content: emptyToNull(parsed.content) ?? null,
    meta: emptyToNull(parsed.meta) ?? null,
    videoUrl: emptyToNull(parsed.videoUrl) ?? null,
    image: new Uint8Array(buf),
    imageUrl: parsed.imageUrl.trim(),
  });
  return serializeSiteAsset(row);
}
