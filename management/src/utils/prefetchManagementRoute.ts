/**
 * 与 main.tsx 中 lazy(() => import(...)) 使用相同路径，便于悬停菜单时预拉 chunk，减少切换路由时的 Suspense 全页骨架闪动。
 */
const loaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Dashboard'),
  '/products': () => import('@/pages/Product'),
  '/activities': () => import('@/pages/Activity'),
  '/news': () => import('@/pages/News'),
  '/site-assets': () => import('@/pages/SiteAsset'),
  '/courses': () => import('@/pages/Course'),
  '/pricing-plans': () => import('@/pages/PricingPlan'),
  '/contact-messages': () => import('@/pages/ContactMessages'),
  '/support-tickets': () => import('@/pages/SupportTickets'),
};

export function prefetchManagementRoute(menuKey: string): void {
  const load = loaders[menuKey];
  if (load) void load();
}
