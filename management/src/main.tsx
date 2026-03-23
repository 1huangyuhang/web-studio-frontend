import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ManagementLayout from './pages/Layout/index';
import ProductManagement from './pages/Product';
import ActivityManagement from './pages/Activity';
import NewsManagement from './pages/News';
import Dashboard from './pages/Dashboard';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

// 过滤掉Prisma查询引擎的Go指针日志和其他不必要的日志
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;
const originalConsoleInfo = console.info;
const originalConsoleTrace = console.trace;
const originalConsoleAssert = console.assert;
const originalConsoleDir = console.dir;
const originalConsoleDirxml = console.dirxml;
const originalConsoleGroup = console.group;
const originalConsoleGroupCollapsed = console.groupCollapsed;
const originalConsoleGroupEnd = console.groupEnd;

const filterPrismaLogs = (args: any[]) => {
  // 处理不同类型的日志参数
  for (const arg of args) {
    let argStr = '';

    // 更安全的参数转换
    try {
      argStr = typeof arg === 'string' ? arg : JSON.stringify(arg);
    } catch (e) {
      argStr = String(arg);
    }

    // 匹配包含Go指针的日志
    if (/\[0xc[0-9a-f]+(\s+0xc[0-9a-f]+)*\]/.test(argStr)) {
      return false;
    }

    // 匹配其他可能的Prisma查询引擎日志
    if (
      /Prisma Query Engine|Query Engine|prisma:query|prisma:info|prisma:warn|prisma:error/.test(
        argStr
      )
    ) {
      return false;
    }
  }
  return true;
};

// 重写所有console方法，应用日志过滤
const createFilteredConsoleMethod = (
  originalMethod: (...args: any[]) => void
) => {
  return (...args: any[]) => {
    if (filterPrismaLogs(args)) {
      originalMethod.apply(console, args);
    }
  };
};

console.log = createFilteredConsoleMethod(originalConsoleLog);
console.error = createFilteredConsoleMethod(originalConsoleError);
console.warn = createFilteredConsoleMethod(originalConsoleWarn);
console.debug = createFilteredConsoleMethod(originalConsoleDebug);
console.info = createFilteredConsoleMethod(originalConsoleInfo);
console.trace = createFilteredConsoleMethod(originalConsoleTrace);
console.assert = createFilteredConsoleMethod(originalConsoleAssert);
console.dir = createFilteredConsoleMethod(originalConsoleDir);
console.dirxml = createFilteredConsoleMethod(originalConsoleDirxml);
console.group = createFilteredConsoleMethod(originalConsoleGroup);
console.groupCollapsed = createFilteredConsoleMethod(
  originalConsoleGroupCollapsed
);
console.groupEnd = createFilteredConsoleMethod(originalConsoleGroupEnd);

// 添加水平滚动支持，包括流畅的左右滑动手势和惯性滚动
document.addEventListener('DOMContentLoaded', () => {
  const horizontalScrollContainers =
    document.querySelectorAll('.table-container');

  horizontalScrollContainers.forEach((container) => {
    const htmlContainer = container as HTMLElement;

    // 滚动状态变量
    let isScrolling = false;
    let startTime = 0;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let momentumInterval: number | null = null;

    // 滚动配置
    const SCROLL_CONFIG = {
      friction: 0.95, // 摩擦系数，影响惯性滚动
      momentumThreshold: 20, // 触发惯性滚动的最小速度
      bounceStrength: 0.2, // 边界回弹强度
      bounceTime: 300, // 边界回弹动画时间
      minVelocity: 0.1, // 停止惯性滚动的最小速度
    };

    // 水平滚轮滚动支持
    htmlContainer.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        // 仅当鼠标滚轮是水平滚动或垂直滚动且容器可以水平滚动时才处理
        if (
          e.deltaX !== 0 ||
          (e.deltaY !== 0 &&
            htmlContainer.scrollWidth > htmlContainer.clientWidth)
        ) {
          e.preventDefault();

          // 平滑滚动
          const scrollAmount = e.deltaX + e.deltaY;
          htmlContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth',
          });

          // 更新滚动状态
          updateScrollIndicators(htmlContainer);
        }
      },
      { passive: false }
    );

    // 触摸开始事件
    htmlContainer.addEventListener('touchstart', (e: TouchEvent) => {
      // 取消正在进行的惯性滚动
      if (momentumInterval) {
        clearInterval(momentumInterval);
        momentumInterval = null;
      }

      isScrolling = true;
      startTime = Date.now();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY; // 保存触摸开始时的Y坐标
      scrollLeft = htmlContainer.scrollLeft;
      lastX = startX;
      lastTime = startTime;
      velocity = 0;

      // 添加触摸反馈样式
      htmlContainer.style.transition = 'none';
      htmlContainer.classList.add('is-touching');
    });

    // 触摸移动事件
    htmlContainer.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (
          !isScrolling ||
          htmlContainer.scrollWidth <= htmlContainer.clientWidth
        )
          return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const currentTime = Date.now();
        const deltaX = currentX - startX;
        const deltaY = currentY - startY; // 修正：使用触摸开始时的Y坐标

        // 计算当前速度
        const timeDiff = currentTime - lastTime;
        const xDiff = currentX - lastX;
        velocity = xDiff / timeDiff; // 速度（像素/毫秒）

        lastX = currentX;
        lastTime = currentTime;

        // 仅当水平滚动距离大于垂直滚动距离时才处理，避免影响垂直滚动
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault();

          // 计算新的滚动位置
          let newScrollLeft = scrollLeft - deltaX;

          // 边界回弹效果
          const maxScroll =
            htmlContainer.scrollWidth - htmlContainer.clientWidth;

          if (newScrollLeft < 0) {
            // 左侧边界回弹
            newScrollLeft =
              -Math.abs(newScrollLeft) * SCROLL_CONFIG.bounceStrength;
          } else if (newScrollLeft > maxScroll) {
            // 右侧边界回弹
            newScrollLeft =
              maxScroll +
              (newScrollLeft - maxScroll) * SCROLL_CONFIG.bounceStrength;
          }

          htmlContainer.scrollLeft = newScrollLeft;

          // 更新滚动状态
          updateScrollIndicators(htmlContainer);
        }
      },
      { passive: false }
    );

    // 触摸结束事件
    htmlContainer.addEventListener('touchend', () => {
      if (!isScrolling) return;

      isScrolling = false;
      htmlContainer.classList.remove('is-touching');

      // 惯性滚动
      const endTime = Date.now();
      const touchDuration = endTime - startTime;

      // 只有当触摸时间较短且速度足够大时才触发惯性滚动
      if (
        touchDuration < 200 &&
        Math.abs(velocity) > SCROLL_CONFIG.momentumThreshold
      ) {
        startMomentumScroll();
      } else {
        // 恢复正常状态
        resetScrollPosition();
      }
    });

    // 触摸取消事件
    htmlContainer.addEventListener('touchcancel', () => {
      isScrolling = false;
      htmlContainer.classList.remove('is-touching');
      if (momentumInterval) {
        clearInterval(momentumInterval);
        momentumInterval = null;
      }
      resetScrollPosition();
    });

    // 开始惯性滚动
    const startMomentumScroll = () => {
      let currentVelocity = velocity;

      // 清除之前的惯性滚动
      if (momentumInterval) {
        clearInterval(momentumInterval);
      }

      momentumInterval = window.setInterval(() => {
        // 应用摩擦力
        currentVelocity *= SCROLL_CONFIG.friction;

        // 如果速度足够小，停止惯性滚动
        if (Math.abs(currentVelocity) < SCROLL_CONFIG.minVelocity) {
          clearInterval(momentumInterval!);
          momentumInterval = null;
          resetScrollPosition();
          return;
        }

        // 计算滚动距离
        const scrollDistance = currentVelocity * 10; // 放大速度影响
        const newScrollLeft = htmlContainer.scrollLeft + scrollDistance;

        // 边界处理
        const maxScroll = htmlContainer.scrollWidth - htmlContainer.clientWidth;

        if (newScrollLeft < 0 || newScrollLeft > maxScroll) {
          clearInterval(momentumInterval!);
          momentumInterval = null;
          resetScrollPosition();
          return;
        }

        // 应用滚动
        htmlContainer.scrollLeft = newScrollLeft;

        // 更新滚动状态
        updateScrollIndicators(htmlContainer);
      }, 16); // 约60fps
    };

    // 重置滚动位置到有效范围
    const resetScrollPosition = () => {
      const maxScroll = htmlContainer.scrollWidth - htmlContainer.clientWidth;
      const currentScrollLeft = htmlContainer.scrollLeft;

      // 如果超出左边界，回弹到0
      if (currentScrollLeft < 0) {
        htmlContainer.style.transition = `scroll-left ${SCROLL_CONFIG.bounceTime}ms ease-out`;
        htmlContainer.scrollLeft = 0;
      }
      // 如果超出右边界，回弹到最大位置
      else if (currentScrollLeft > maxScroll) {
        htmlContainer.style.transition = `scroll-left ${SCROLL_CONFIG.bounceTime}ms ease-out`;
        htmlContainer.scrollLeft = maxScroll;
      }

      // 恢复正常过渡效果
      setTimeout(() => {
        htmlContainer.style.transition = '';
      }, SCROLL_CONFIG.bounceTime);

      // 更新滚动状态
      updateScrollIndicators(htmlContainer);
    };

    // 更新滚动指示器（阴影效果）
    const updateScrollIndicators = (container: HTMLElement) => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;

      // 使用CSS变量来控制阴影透明度
      container.style.setProperty('--scroll-left', currentScroll.toString());
      container.style.setProperty('--scroll-max', maxScroll.toString());

      // 如果是最左侧，隐藏左侧阴影
      if (currentScroll <= 5) {
        container.classList.add('scroll-start');
      } else {
        container.classList.remove('scroll-start');
      }

      // 如果是最右侧，隐藏右侧阴影
      if (currentScroll >= maxScroll - 5) {
        container.classList.add('scroll-end');
      } else {
        container.classList.remove('scroll-end');
      }
    };

    // 初始更新滚动指示器
    updateScrollIndicators(htmlContainer);

    // 窗口大小变化时更新滚动指示器
    window.addEventListener('resize', () => {
      updateScrollIndicators(htmlContainer);
    });
  });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagementLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="activities" element={<ActivityManagement />} />
          <Route path="news" element={<NewsManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
