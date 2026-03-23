// 数字动画相关的工具函数

/**
 * 缓动函数：easeOutCubic
 * @param t - 时间进度（0-1）
 * @returns 缓动后的数值
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * 格式化数字，添加千分位
 * @param num - 要格式化的数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 数字动画函数
 * @param element - 要执行动画的DOM元素
 */
export const animateNumber = (element: Element) => {
  const htmlElement = element as HTMLElement;
  const targetValue = parseInt(htmlElement.getAttribute('data-target') || '0');
  const duration = 2000;
  const startTime = performance.now();
  let currentValue = 0;

  const updateNumber = (timestamp: number) => {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    currentValue = Math.floor(targetValue * easedProgress);
    htmlElement.textContent = formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      htmlElement.textContent = formatNumber(targetValue);
    }
  };

  requestAnimationFrame(updateNumber);
};

/**
 * 检查并执行动画
 * @param entries - Intersection Observer条目数组
 */
export const checkAndAnimate = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const element = entry.target;

      // 只处理数字动画，卡片动画由AnimatedImage组件处理
      if (element.classList.contains('animate-number')) {
        animateNumber(element);
      }
    }
  });
};

/**
 * 检查元素可见性
 * @param element - 要检查的DOM元素
 * @returns 是否可见
 */
export const checkVisibility = (element: Element) => {
  const rect = element.getBoundingClientRect();
  // 更宽松的可见性检测条件
  const isVisible =
    rect.top < window.innerHeight + 100 && // 元素顶部在视口底部下方100px内
    rect.bottom > -100; // 元素底部在视口顶部上方100px内

  return isVisible;
};
