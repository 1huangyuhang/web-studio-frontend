import type { Prisma, SiteAsset } from '@prisma/client';
import prisma from '../../utils/prisma';

/** 列表用：不读 BYTEA，避免大 JSON / 内存峰值 */
export const siteAssetListSelect = {
  id: true,
  page: true,
  groupKey: true,
  sortOrder: true,
  title: true,
  alt: true,
  content: true,
  meta: true,
  imageUrl: true,
  videoUrl: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.SiteAssetSelect;

export type SiteAssetListRow = Prisma.SiteAssetGetPayload<{
  select: typeof siteAssetListSelect;
}>;

export async function findManySiteAssets(
  where: Prisma.SiteAssetWhereInput
): Promise<SiteAsset[]> {
  return prisma.siteAsset.findMany({
    where,
    orderBy: [{ page: 'asc' }, { groupKey: 'asc' }, { sortOrder: 'asc' }],
  });
}

export async function findManySiteAssetsMeta(
  where: Prisma.SiteAssetWhereInput
): Promise<SiteAssetListRow[]> {
  return prisma.siteAsset.findMany({
    where,
    orderBy: [{ page: 'asc' }, { groupKey: 'asc' }, { sortOrder: 'asc' }],
    select: siteAssetListSelect,
  });
}

export async function findSiteAssetById(id: number): Promise<SiteAsset | null> {
  return prisma.siteAsset.findUnique({ where: { id } });
}

export async function createSiteAssetRow(
  data: Prisma.SiteAssetCreateInput
): Promise<SiteAsset> {
  return prisma.siteAsset.create({ data });
}

export async function updateSiteAssetRow(
  id: number,
  data: Prisma.SiteAssetUpdateInput
): Promise<SiteAsset> {
  return prisma.siteAsset.update({ where: { id }, data });
}

export async function deleteSiteAssetRow(id: number): Promise<void> {
  await prisma.siteAsset.delete({ where: { id } });
}
