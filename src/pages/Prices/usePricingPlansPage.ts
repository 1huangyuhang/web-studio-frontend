import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import { fetchAllPaginatedList } from '@/utils/apiListResponse';
import { type PricingPlanDTO, parsePricingPlanDto } from '@/types/dto';

export function usePricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchAllPaginatedList<Record<string, unknown>>(
        axiosInstance,
        '/pricing-plans'
      );
      const list = rows
        .map(parsePricingPlanDto)
        .filter((p): p is PricingPlanDTO => p != null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      setPlans(list);
    } catch (e) {
      setError('获取价格方案失败，请稍后重试');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  return { plans, loading, error, loadPlans };
}
