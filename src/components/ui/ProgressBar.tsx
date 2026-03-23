import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProgressBar.less';

interface ProgressBarProps {
  // 菜单栏显示状态，true表示显示（展开），false表示隐藏（收回）
  isMenuVisible?: boolean;
}

/**
 * 节流函数
 * 限制函数在一定时间内最多执行一次
 */
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * 页面游览进度条组件
 * 显示当前页面的滚动进度，固定在页面顶部
 * 随着用户滚动实时更新，包含平滑的动画效果
 * 根据菜单栏显示状态自动控制显示/隐藏：
 * - 菜单栏展开时（isMenuVisible=true）：隐藏进度条
 * - 菜单栏收回时（isMenuVisible=false）：显示进度条
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ isMenuVisible = true }) => {
  // 滚动进度值，范围0-100
  const [progress, setProgress] = useState(0);
  // 滚动进度状态
  const [scrolled, setScrolled] = useState(0);

  // 保存最新的滚动状态，用于requestAnimationFrame
  const scrollStateRef = useRef({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  // 更新滚动状态，使用requestAnimationFrame优化性能
  const updateScrollState = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = scrollStateRef.current;

    // 计算滚动进度百分比
    const progressValue = Math.min(
      100,
      Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100)
    );

    setProgress(progressValue);
    setScrolled(scrollTop);
  }, []);

  /**
   * 处理滚动事件，计算滚动进度
   */
  const handleScroll = useCallback(() => {
    // 更新滚动状态
    scrollStateRef.current = {
      scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
      scrollHeight:
        document.documentElement.scrollHeight || document.body.scrollHeight,
      clientHeight: document.documentElement.clientHeight || window.innerHeight,
    };

    // 使用requestAnimationFrame优化状态更新
    requestAnimationFrame(updateScrollState);
  }, [updateScrollState]);

  // 创建节流处理函数，限制每秒最多执行60次（约16ms一次）
  const throttledHandleScroll = useCallback(throttle(handleScroll, 16), [
    handleScroll,
  ]);

  /**
   * 组件挂载时添加滚动事件监听
   * 组件卸载时移除滚动事件监听
   */
  useEffect(() => {
    // 添加滚动事件监听，使用passive选项优化性能
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // 初始调用一次，设置初始状态
    handleScroll();

    // 清理函数，移除事件监听
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [throttledHandleScroll, handleScroll]);

  // 决定进度条是否显示：
  // 1. 菜单栏展开时（isMenuVisible=true）：隐藏进度条
  // 2. 菜单栏收回时（isMenuVisible=false）：显示进度条
  // 3. 只有当页面滚动了一定距离（scrolled > 0）时才显示
  const shouldShowProgressBar = !isMenuVisible && scrolled > 0;

  return (
    <div
      className={`progress-bar-container ${shouldShowProgressBar ? 'visible' : ''}`}
    >
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
