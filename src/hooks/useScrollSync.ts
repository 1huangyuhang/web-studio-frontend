import { useEffect, useRef } from 'react';

interface ScrollSyncProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  scrollElement?: HTMLElement | Window;
  containerRef?: React.RefObject<HTMLElement>;
  onProgressChange?: (progress: number) => void;
}

/**
 * 滚动同步钩子，用于根据滚动位置同步视频播放
 * @param props 滚动同步配置
 */
export const useScrollSync = ({
  videoRef,
  scrollElement = window,
  containerRef,
  onProgressChange,
}: ScrollSyncProps) => {
  // 动画状态引用
  const animationRef = useRef({
    animationFrameId: null as number | null,
    isActive: false,
    targetProgress: 0,
    currentProgress: 0,
    lastScrollProgress: 0,
    velocity: 0,
    lastTimestamp: 0,
  });

  // 保存上一次更新的视频时间，用于减少不必要的更新
  const lastVideoTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 计算当前滚动位置对应的视频进度
    const calculateProgress = (scrollTop: number) => {
      let scrollProgress: number = 0;

      if (containerRef && containerRef.current) {
        // 计算容器的实际高度
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerHeight = containerRect.height;

        // 滚动进度计算
        const totalScrollableDistance = containerHeight;

        // 计算精确的滚动进度
        scrollProgress = Math.max(
          0,
          Math.min(1, scrollTop / totalScrollableDistance)
        );
      } else {
        // 回退到页面整体滚动计算
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollableHeight = documentHeight - viewportHeight;

        scrollProgress =
          scrollableHeight > 0
            ? Math.max(0, Math.min(1, scrollTop / scrollableHeight))
            : 0;
      }

      return scrollProgress;
    };

    // 设置视频进度的函数，添加阈值检查和视频就绪状态检查
    const setVideoProgress = (progress: number) => {
      // 确保视频已加载并可播放，避免在未就绪时设置currentTime导致的错误
      if (video.readyState < 1 || video.duration <= 0) {
        return;
      }

      const videoDuration = video.duration || 0;
      const targetTime = progress * videoDuration;

      // 只有当目标时间与上一次更新的时间差值超过0.05秒时才更新，减少不必要的资源消耗
      if (Math.abs(targetTime - lastVideoTimeRef.current) > 0.05) {
        try {
          video.currentTime = targetTime;
          lastVideoTimeRef.current = targetTime;
        } catch (error) {
          console.warn('Error setting video currentTime:', error);
        }
      }
    };

    // 主动画循环 - 实现平滑的视频进度更新和阻塞效果
    const animateVideoProgress = () => {
      if (!video) return;

      animationRef.current.lastTimestamp = Date.now();

      // 计算与目标进度的差值
      const progressDiff =
        animationRef.current.targetProgress -
        animationRef.current.currentProgress;

      // 只有当进度差值足够大时才进行更新
      if (Math.abs(progressDiff) > 0.001) {
        // 使用缓动函数实现平滑过渡
        // 这里使用指数缓动，使动画开始快，结束慢，创造阻塞效果
        const easingFactor = 0.1; // 阻塞效果的强度，值越大阻塞感越强
        const progressIncrement = progressDiff * easingFactor;

        // 更新当前进度
        animationRef.current.currentProgress += progressIncrement;

        // 确保进度在合法范围内
        animationRef.current.currentProgress = Math.max(
          0,
          Math.min(1, animationRef.current.currentProgress)
        );

        // 设置视频进度
        setVideoProgress(animationRef.current.currentProgress);

        // 调用进度变化回调
        if (onProgressChange) {
          onProgressChange(animationRef.current.currentProgress);
        }

        // 继续动画
        animationRef.current.animationFrameId =
          requestAnimationFrame(animateVideoProgress);
      } else {
        // 进度已接近目标，停止动画
        animationRef.current.isActive = false;
        animationRef.current.animationFrameId = null;
      }
    };

    // 处理滚动事件
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const currentScrollProgress = calculateProgress(scrollTop);

      // 更新目标进度
      animationRef.current.targetProgress = currentScrollProgress;

      // 计算滚动速度
      const now = Date.now();
      if (animationRef.current.lastTimestamp > 0) {
        const deltaTime = now - animationRef.current.lastTimestamp;
        const deltaProgress =
          currentScrollProgress - animationRef.current.lastScrollProgress;
        animationRef.current.velocity = deltaProgress / deltaTime;
      }

      // 更新状态
      animationRef.current.lastScrollProgress = currentScrollProgress;
      animationRef.current.lastTimestamp = now;

      // 启动动画（如果未激活）
      if (!animationRef.current.isActive) {
        animationRef.current.isActive = true;
        animationRef.current.animationFrameId =
          requestAnimationFrame(animateVideoProgress);
      }
    };

    // 添加滚动事件监听
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    // 初始化
    const initialProgress = calculateProgress(window.scrollY);
    animationRef.current.targetProgress = initialProgress;
    animationRef.current.currentProgress = initialProgress;
    animationRef.current.lastScrollProgress = initialProgress;
    animationRef.current.lastTimestamp = Date.now();

    // 设置初始视频进度
    setVideoProgress(initialProgress);

    // 调用初始化进度回调
    if (onProgressChange) {
      onProgressChange(initialProgress);
    }

    // 保存当前动画帧ID到局部变量，避免闭包问题
    const animationFrameId = animationRef.current.animationFrameId;

    return () => {
      // 清理事件监听
      scrollElement.removeEventListener('scroll', handleScroll);

      // 清理动画
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [videoRef, scrollElement, containerRef, onProgressChange]);
};
