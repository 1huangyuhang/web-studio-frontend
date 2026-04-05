import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import './index.less';
import { animateNumber, checkAndAnimate, checkVisibility } from '@/animations';
import { redwoodImages } from '@/assets/images/redwood';
import {
  assetsInGroup,
  fetchSiteAssetsByPage,
  parseHomeStatRow,
  type HomeStatRow,
} from '@/services/siteAssets';
import { processImageUrl } from '@/utils/imageUtils';
import HomeScrollyVideo from './sections/HomeScrollyVideo';
import HomeTopGallery from './sections/HomeTopGallery';
import HomeStatsSection from './sections/HomeStatsSection';
import HomeValueSection from './sections/HomeValueSection';
import HomeProductsSection from './sections/HomeProductsSection';
import HomeHeritageSection from './sections/HomeHeritageSection';
import HomeActionSection from './sections/HomeActionSection';

const {
  redwood1,
  redwoodDetail1,
  redwoodDetail2,
  redwoodDetail3,
  redwoodDetail4,
  redwoodDetail5,
  redwoodScenery,
  redwoodFactory,
  redwoodRaw1,
} = redwoodImages;

const DEFAULT_HERO_VIDEO = 'https://scrollyvideo.js.org/goldengate.mp4';

const DEFAULT_STATS: HomeStatRow[] = [
  { label: '客户', value: 10000, color: 'var(--app-accent-cinnabar)' },
  { label: '产品系列', value: 60, color: 'var(--app-accent-cinnabar)' },
  { label: '销售地区', value: 150, color: 'var(--app-accent-cinnabar)' },
  { label: '年销量', value: 1000000, color: 'var(--app-accent-cinnabar)' },
];

const FALLBACK_TOP_GALLERY = [redwoodRaw1, redwoodDetail1, redwoodFactory];
const FALLBACK_CATEGORY_IMAGES = [
  redwood1,
  redwoodDetail1,
  redwoodDetail2,
  redwoodDetail3,
];
const FALLBACK_HERITAGE = [redwoodDetail3, redwoodDetail4, redwoodDetail5];

export default function Home() {
  const { data: assets = [], isError } = useQuery({
    queryKey: ['siteAssets', 'home'],
    queryFn: () => fetchSiteAssetsByPage('home'),
    staleTime: 60_000,
  });

  const heroVideo =
    assetsInGroup(assets, 'hero_video')[0]?.videoUrl?.trim() ||
    DEFAULT_HERO_VIDEO;

  const galleryCopy = assetsInGroup(assets, 'gallery_copy')[0];
  const galleryTitle = galleryCopy?.title?.trim() || '红木古韵 传承利好';
  const galleryDescription =
    galleryCopy?.content?.trim() ||
    '张家港作为中国红木产业的重要基地，凭借得天独厚的地理位置和丰富的木材资源， 已经成为全国最大的红木家具生产和销售中心之一。';

  const topGalleryRows = assetsInGroup(assets, 'top_gallery');
  const topGallerySrcs = useMemo(() => {
    return [0, 1, 2].map((i) => {
      const row = topGalleryRows[i];
      if (row) {
        const url = processImageUrl(row.image ?? row.imageUrl);
        if (url) return url;
      }
      return FALLBACK_TOP_GALLERY[i] ?? redwoodRaw1;
    });
  }, [topGalleryRows]) as [string, string, string];

  const statsIntro = assetsInGroup(assets, 'stats_intro')[0];
  const statsIntroTitle = statsIntro?.title?.trim() || '深受行业领导者信赖';
  const statsIntroBody =
    statsIntro?.content?.trim() ||
    '林之源为众多行业提供可靠的红木解决方案，从高端家具到工艺品制造等，助力客户获得竞争优势。';

  const stats = useMemo(() => {
    const parsed = assetsInGroup(assets, 'stats_metric')
      .map(parseHomeStatRow)
      .filter((x): x is HomeStatRow => x != null);
    return parsed.length ? parsed : DEFAULT_STATS;
  }, [assets]);

  const valueCopy = assetsInGroup(assets, 'value_copy')[0];
  const valueTitle = valueCopy?.title?.trim() || '传承红木文化，创新工艺技术';
  const valueDescription =
    valueCopy?.content?.trim() ||
    '我们致力于传承和发扬红木文化，结合现代工艺技术， 打造出既有传统韵味又符合现代审美的红木产品。';

  const valueImageRow = assetsInGroup(assets, 'value_proposition')[0];
  const valueImageSrc = useMemo(() => {
    if (valueImageRow) {
      const url = processImageUrl(
        valueImageRow.image ?? valueImageRow.imageUrl
      );
      if (url) return url;
    }
    return redwoodScenery;
  }, [valueImageRow]);

  const categoryRows = assetsInGroup(assets, 'product_categories');
  const productCategories = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const row = categoryRows[i];
      const name =
        row?.title?.trim() ||
        ['红木家具', '红木饰品', '红木工艺', '红木定制'][i] ||
        '';
      let image = FALLBACK_CATEGORY_IMAGES[i] ?? redwood1;
      if (row) {
        const url = processImageUrl(row.image ?? row.imageUrl);
        if (url) image = url;
      }
      return { id: i + 1, name, image };
    });
  }, [categoryRows]);

  const heritageCopy = assetsInGroup(assets, 'heritage_copy')[0];
  const heritageTitle = heritageCopy?.title?.trim() || '匠心工艺，传承百年';
  const heritageDescription =
    heritageCopy?.content?.trim() ||
    '我们拥有一支技艺精湛的工匠团队， 传承百年红木工艺，每一件产品都凝聚了匠人的心血和智慧。';

  const heritageRows = assetsInGroup(assets, 'heritage');
  const heritageSrcs = useMemo(() => {
    return [0, 1, 2].map((i) => {
      const row = heritageRows[i];
      if (row) {
        const url = processImageUrl(row.image ?? row.imageUrl);
        if (url) return url;
      }
      return FALLBACK_HERITAGE[i] ?? redwoodDetail3;
    });
  }, [heritageRows]) as [string, string, string];

  const ctaCopy = assetsInGroup(assets, 'cta_copy')[0];
  const ctaTitle = ctaCopy?.title?.trim() || '懂红木才会爱上红木';
  const ctaDescription =
    ctaCopy?.content?.trim() ||
    '我们邀请您深入了解红木文化，感受红木的独特魅力， 选择最适合您的红木产品。';

  const animatedElementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (isError) {
      console.warn(
        '[Home] 站点素材接口不可用，已使用本地兜底文案与图片。请确认后端已启动且已执行 seed。'
      );
    }
  }, [isError]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      console.warn(
        'IntersectionObserver not supported, animations will not work'
      );
      return;
    }

    const observer = new IntersectionObserver(checkAndAnimate, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px',
    });

    const cards = document.querySelectorAll('.animate-card');
    const numbers = document.querySelectorAll('.animate-number');

    cards.forEach((card) => observer.observe(card));
    numbers.forEach((number) => observer.observe(number));

    const checkImmediately = () => {
      numbers.forEach((element) => {
        if (checkVisibility(element)) {
          if (element.classList.contains('animate-number')) {
            animateNumber(element);
          }
        }
      });
    };

    checkImmediately();

    const savedAnimatedElementsRef = animatedElementsRef.current;

    return () => {
      observer.disconnect();
      if (
        (window as unknown as { scrollTimeout?: ReturnType<typeof setTimeout> })
          .scrollTimeout
      ) {
        clearTimeout(
          (
            window as unknown as {
              scrollTimeout: ReturnType<typeof setTimeout>;
            }
          ).scrollTimeout
        );
      }
      savedAnimatedElementsRef.clear();
    };
  }, [stats, assets]);

  return (
    <div className="home-page home-premium">
      <HomeScrollyVideo src={heroVideo} />
      <HomeTopGallery
        topGallerySrcs={topGallerySrcs}
        galleryTitle={galleryTitle}
        galleryDescription={galleryDescription}
      />
      <HomeStatsSection
        statsIntroTitle={statsIntroTitle}
        statsIntroBody={statsIntroBody}
        stats={stats}
      />
      <HomeValueSection
        valueTitle={valueTitle}
        valueDescription={valueDescription}
        valueImageSrc={valueImageSrc}
      />
      <HomeProductsSection productCategories={productCategories} />
      <HomeHeritageSection
        heritageTitle={heritageTitle}
        heritageDescription={heritageDescription}
        heritageSrcs={heritageSrcs}
      />
      <HomeActionSection ctaTitle={ctaTitle} ctaDescription={ctaDescription} />
    </div>
  );
}
