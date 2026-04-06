/**
 * 与 Express 控制器返回结构对齐的管理端 DTO（前后端契约层）。
 * Prisma 实体在接口层已格式化为 number / string（如 Decimal→number，Bytes→base64）。
 */

export interface PaginationDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: PaginationDTO;
}

export interface StatsSummaryDTO {
  productCount: number;
  activityCount: number;
  newsCount: number;
  siteAssetCount: number;
  courseCount: number;
  pricingPlanCount: number;
  contactMessageCount: number;
  supportTicketCount: number;
  /** 未读留言条数（工作台角标） */
  unreadContactMessageCount: number;
  /** 待处理工单：OPEN + IN_PROGRESS（工作台角标） */
  pendingSupportTicketCount: number;
}

/** 统计接口单项计数失败时为 null，不拖垮整页 */
export type StatsSummaryPartialDTO = {
  [K in keyof StatsSummaryDTO]: number | null;
};

export interface StatsSummaryMeta {
  degraded: boolean;
  errors?: Partial<Record<keyof StatsSummaryDTO, string>>;
}

export interface StatsSummaryResponse {
  data: StatsSummaryPartialDTO;
  meta?: StatsSummaryMeta;
}

/** 解析列表接口：统一处理 { data, pagination } 与旧式数组 */
export function parsePaginatedList<T>(response: unknown): {
  list: T[];
  total: number;
} {
  if (Array.isArray(response)) {
    return { list: response as T[], total: response.length };
  }
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as PaginatedResponseDTO<T>).data)
  ) {
    const r = response as PaginatedResponseDTO<T>;
    const total =
      r.pagination && typeof r.pagination.total === 'number'
        ? r.pagination.total
        : r.data.length;
    return { list: r.data, total };
  }
  return { list: [], total: 0 };
}
