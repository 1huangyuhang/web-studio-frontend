import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchSiteAssetsByPage,
  parseCaseItemMeta,
} from '@/services/siteAssets';
import { mediaDisplaySrc, type SiteAssetDTO } from '@/types/dto';

export type CaseStudyItem = {
  id: number;
  title: string;
  client: string;
  category: string;
  date: string;
  description: string;
  imageSrc: string;
  tags: string[];
};

function assetToCaseItem(a: SiteAssetDTO): CaseStudyItem | null {
  const title = a.title?.trim();
  if (!title) return null;
  const meta = parseCaseItemMeta(a.meta);
  return {
    id: a.id,
    title,
    client: meta.client?.trim() || '—',
    category: meta.category?.trim() || '—',
    date: meta.date?.trim() || '—',
    description: (a.content ?? '').trim() || '—',
    imageSrc: mediaDisplaySrc(a),
    tags: meta.tags?.length ? meta.tags : [],
  };
}

export function useCaseStudiesPage() {
  const [raw, setRaw] = useState<SiteAssetDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const assets = await fetchSiteAssetsByPage('case');
      setRaw(assets);
    } catch (e) {
      setError('获取案例数据失败，请稍后重试');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const caseData = useMemo(() => {
    return raw
      .filter((a) => a.groupKey === 'case_item')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map(assetToCaseItem)
      .filter((x): x is CaseStudyItem => x != null);
  }, [raw]);

  return { caseData, loading, error, loadCases };
}
