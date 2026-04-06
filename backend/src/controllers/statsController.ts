import { Request, Response } from 'express';
import prisma from '../utils/prisma';

type StatKey =
  | 'productCount'
  | 'activityCount'
  | 'newsCount'
  | 'siteAssetCount'
  | 'courseCount'
  | 'pricingPlanCount'
  | 'contactMessageCount'
  | 'supportTicketCount'
  | 'unreadContactMessageCount'
  | 'pendingSupportTicketCount';

const STAT_RUNNERS: { key: StatKey; run: () => Promise<number> }[] = [
  { key: 'productCount', run: () => prisma.product.count() },
  { key: 'activityCount', run: () => prisma.activity.count() },
  { key: 'newsCount', run: () => prisma.news.count() },
  { key: 'siteAssetCount', run: () => prisma.siteAsset.count() },
  { key: 'courseCount', run: () => prisma.course.count() },
  { key: 'pricingPlanCount', run: () => prisma.pricingPlan.count() },
  { key: 'contactMessageCount', run: () => prisma.contactMessage.count() },
  { key: 'supportTicketCount', run: () => prisma.supportTicket.count() },
  {
    key: 'unreadContactMessageCount',
    run: () => prisma.contactMessage.count({ where: { read: false } }),
  },
  {
    key: 'pendingSupportTicketCount',
    run: () =>
      prisma.supportTicket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
  },
];

function trimErrorMessage(reason: unknown): string {
  const msg =
    reason instanceof Error ? reason.message : String(reason ?? 'unknown');
  return msg.length > 120 ? 'count_failed' : msg;
}

/**
 * 管理端首页聚合统计：单表失败不拖垮整页，返回 null + meta.degraded。
 */
export const getStatsSummary = async (_req: Request, res: Response) => {
  const settled = await Promise.allSettled(
    STAT_RUNNERS.map(({ run }) => run())
  );

  const data = {} as Record<StatKey, number | null>;
  const errors: Partial<Record<StatKey, string>> = {};
  let degraded = false;

  settled.forEach((result, i) => {
    const { key } = STAT_RUNNERS[i]!;
    if (result.status === 'fulfilled') {
      data[key] = result.value;
    } else {
      degraded = true;
      data[key] = null;
      errors[key] = trimErrorMessage(result.reason);
    }
  });

  res.json({
    data,
    meta: {
      degraded,
      ...(degraded && Object.keys(errors).length > 0 ? { errors } : {}),
    },
  });
};
