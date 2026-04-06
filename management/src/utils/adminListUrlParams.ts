/** 与产品列表 URL 约定一致，供活动/新闻等复用 */

export const ADMIN_LIST_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type AdminListUrlParams = {
  page: number;
  pageSize: number;
  search: string;
};

export function parseAdminListUrlParams(
  searchParams: URLSearchParams
): AdminListUrlParams {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const rawPs = Number(searchParams.get('pageSize'));
  const pageSize = ADMIN_LIST_PAGE_SIZE_OPTIONS.includes(
    rawPs as (typeof ADMIN_LIST_PAGE_SIZE_OPTIONS)[number]
  )
    ? rawPs
    : 10;
  const search = searchParams.get('search')?.trim() ?? '';
  return { page, pageSize, search };
}
