/** 与 useQuery 搭配，便于 invalidateQueries 按资源批量失效 */

export type ActivityListParams = {
  page: number;
  pageSize: number;
  search: string;
};

export type ProductListParams = {
  page: number;
  pageSize: number;
  search: string;
};

export type NewsListParams = {
  page: number;
  pageSize: number;
  search: string;
};

const actRoot = ['activities'] as const;
const prodRoot = ['products'] as const;
const newsRoot = ['news'] as const;
const siteAssetsRoot = ['site-assets'] as const;
const statsRoot = ['stats'] as const;

export const queryKeys = {
  stats: {
    all: statsRoot,
    summary: () => [...statsRoot, 'summary'] as const,
  },
  activities: {
    all: actRoot,
    lists: () => [...actRoot, 'list'] as const,
    list: (p: ActivityListParams) => [...actRoot, 'list', p] as const,
  },
  products: {
    all: prodRoot,
    lists: () => [...prodRoot, 'list'] as const,
    list: (p: ProductListParams) => [...prodRoot, 'list', p] as const,
  },
  news: {
    all: newsRoot,
    lists: () => [...newsRoot, 'list'] as const,
    list: (p: NewsListParams) => [...newsRoot, 'list', p] as const,
  },
  siteAssets: {
    all: siteAssetsRoot,
    lists: () => [...siteAssetsRoot, 'list'] as const,
    /** 管理端列表固定 omitImage=1，避免 BYTEA→Base64 撑爆 JSON */
    list: (pageTab: string) =>
      [...siteAssetsRoot, 'list', pageTab, { omitImage: true }] as const,
  },
};
