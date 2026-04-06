import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import wsService from '@/services/websocket';
import type { WebSocketEvent } from '@/services/websocket';
import { queryKeys } from '@/queryKeys';
import { emitMgmtStatsSummaryRefresh } from '@/utils/managementStatsRefresh';

/**
 * 在 AdminLayout 层挂载：任意管理页写操作经 WebSocket 广播后，工作台统计与顶栏角标均可刷新。
 * 避免将监听绑在 Dashboard（离开首页即卸载导致不同步）。
 */
export function useManagementStatsSync(): void {
  const queryClient = useQueryClient();

  const bumpStats = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    emitMgmtStatsSummaryRefresh();
  }, [queryClient]);

  const wsPairs = useMemo(
    () =>
      [
        ['product:created', bumpStats],
        ['product:updated', bumpStats],
        ['product:deleted', bumpStats],
        ['activity:created', bumpStats],
        ['activity:updated', bumpStats],
        ['activity:deleted', bumpStats],
        ['news:created', bumpStats],
        ['news:updated', bumpStats],
        ['news:deleted', bumpStats],
        ['course:created', bumpStats],
        ['course:updated', bumpStats],
        ['course:deleted', bumpStats],
        ['pricingPlan:created', bumpStats],
        ['pricingPlan:updated', bumpStats],
        ['pricingPlan:deleted', bumpStats],
        ['contactMessage:created', bumpStats],
        ['contactMessage:deleted', bumpStats],
        ['supportTicket:created', bumpStats],
        ['supportTicket:updated', bumpStats],
        ['supportTicket:deleted', bumpStats],
      ] as [keyof WebSocketEvent, () => void][],
    [bumpStats]
  );

  useEffect(() => {
    wsPairs.forEach(([ev, fn]) => wsService.on(ev, fn));
    return () => {
      wsPairs.forEach(([ev, fn]) => wsService.off(ev, fn));
    };
  }, [wsPairs]);
}
