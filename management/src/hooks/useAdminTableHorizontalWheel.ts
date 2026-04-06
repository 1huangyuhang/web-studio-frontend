import { useEffect, useRef, type RefObject } from 'react';

const LINE_PX = 16;
const PAGE_PX = 800;

function normalizeWheelDelta(e: WheelEvent): { dx: number; dy: number } {
  let dx = e.deltaX;
  let dy = e.deltaY;
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    dx *= LINE_PX;
    dy *= LINE_PX;
  } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    dx *= PAGE_PX;
    dy *= PAGE_PX;
  }
  return { dx, dy };
}

/** 若返回非 null，表示应由表格横向消费该滚轮（可 preventDefault） */
function horizontalIntentDelta(e: WheelEvent): number | null {
  const { dx, dy } = normalizeWheelDelta(e);
  if (e.shiftKey) {
    return dx + dy;
  }
  if (Math.abs(dx) > Math.abs(dy) && dx !== 0) {
    return dx;
  }
  return null;
}

function updateAdminTableEdgeClasses(
  wrapper: HTMLElement | null,
  scroll: HTMLElement | null
) {
  if (!wrapper || !scroll) {
    wrapper?.classList.remove(
      'admin-h-scroll--active',
      'admin-h-scroll--at-start',
      'admin-h-scroll--at-end'
    );
    return;
  }
  const max = scroll.scrollWidth - scroll.clientWidth;
  const overflow = max > 2;
  if (!overflow) {
    wrapper.classList.remove(
      'admin-h-scroll--active',
      'admin-h-scroll--at-start',
      'admin-h-scroll--at-end'
    );
    return;
  }
  wrapper.classList.add('admin-h-scroll--active');
  const sl = scroll.scrollLeft;
  if (sl <= 2) wrapper.classList.add('admin-h-scroll--at-start');
  else wrapper.classList.remove('admin-h-scroll--at-start');
  if (sl >= max - 2) wrapper.classList.add('admin-h-scroll--at-end');
  else wrapper.classList.remove('admin-h-scroll--at-end');
}

/**
 * 在 Ant Table 的 .ant-table-content 上合并滚轮 delta（rAF），避免 scrollBy smooth 堆叠；
 * 仅在 shift / 触控板横滑 / 横移占优时拦截，不抢普通纵向翻页。
 */
export function useAdminTableHorizontalWheel(
  rootRef: RefObject<HTMLElement | null>
): void {
  const pendingRef = useRef(0);
  const rafRef = useRef(0);
  const scrollRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const detachScrollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const resolve = () => {
      const nextScroll = root.querySelector(
        '.ant-table-content'
      ) as HTMLElement | null;
      const nextWrap = root.querySelector(
        '.ant-table-wrapper'
      ) as HTMLElement | null;

      if (nextScroll !== scrollRef.current) {
        detachScrollRef.current?.();
        detachScrollRef.current = null;
        scrollRef.current = nextScroll;
        wrapperRef.current = nextWrap;
        if (nextScroll) {
          const onScroll = () =>
            updateAdminTableEdgeClasses(wrapperRef.current, scrollRef.current);
          nextScroll.addEventListener('scroll', onScroll, { passive: true });
          detachScrollRef.current = () => {
            nextScroll.removeEventListener('scroll', onScroll);
          };
        }
      } else {
        wrapperRef.current = nextWrap;
      }
      updateAdminTableEdgeClasses(wrapperRef.current, scrollRef.current);
    };

    resolve();
    const id = requestAnimationFrame(resolve);

    const ro = new ResizeObserver(() => resolve());
    ro.observe(root);

    const mo = new MutationObserver(() => {
      requestAnimationFrame(resolve);
    });
    mo.observe(root, { childList: true, subtree: true });

    const flush = () => {
      rafRef.current = 0;
      const el = scrollRef.current;
      if (!el || el.scrollWidth <= el.clientWidth + 1) return;
      const max = el.scrollWidth - el.clientWidth;
      const delta = pendingRef.current;
      pendingRef.current = 0;
      if (delta === 0) return;
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + delta));
      updateAdminTableEdgeClasses(wrapperRef.current, el);
    };

    const onWheel = (e: WheelEvent) => {
      const el = scrollRef.current;
      if (!el || el.scrollWidth <= el.clientWidth + 1) return;

      const delta = horizontalIntentDelta(e);
      if (delta === null) return;

      e.preventDefault();
      pendingRef.current += delta;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    root.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      mo.disconnect();
      root.removeEventListener('wheel', onWheel, true);
      detachScrollRef.current?.();
      detachScrollRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pendingRef.current = 0;
    };
  }, [rootRef]);
}
