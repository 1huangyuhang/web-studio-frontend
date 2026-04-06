import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import '../styles/ScrollyVideo.less';
import { initMobileVideo } from '../utils/mobileVideoInit';

/** 视为「在页面顶部」时的 scrollY 容差，用于 resize 时是否重采锚点 */
const SCROLL_TOP_EPS = 1;

interface ScrollyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  id?: string;
  /** 叠在视频上的 Hero 内容（标题、按钮等），置于渐变遮罩之上 */
  children?: React.ReactNode;
}

/**
 * 滚动控制视频组件，根据页面滚动位置同步视频播放
 */
const ScrollyVideo: React.FC<ScrollyVideoProps> = ({
  src,
  poster,
  className = '',
  height = '100vh',
  width = '100%',
  id,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);

  // 提取滚动处理函数到组件作用域
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const lastScrollProgressRef = useRef<number>(-1);
  /** 首屏布局下容器顶相对视口的 top，用于从「当前位置」起算 scrub，避免须滚到 top≤0 才动 */
  const anchorTopRef = useRef<number | null>(null);

  const captureScrollAnchor = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    anchorTopRef.current = el.getBoundingClientRect().top;
  }, []);

  // 挂载及换源后按当前视口重采锚点（含滚动恢复后首帧，避免用错误的 0 基准）
  useLayoutEffect(() => {
    captureScrollAnchor();
  }, [src, captureScrollAnchor]);

  const handleScroll = useCallback(() => {
    // 使用requestAnimationFrame节流，避免频繁计算
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    animationFrameIdRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      const container = containerRef.current;

      if (!video || !container) return;

      const containerRect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerTop = containerRect.top;

      const anchorTop = anchorTopRef.current;
      let scrollProgress: number;
      if (anchorTop == null) {
        scrollProgress = Math.max(
          0,
          Math.min(1, -containerTop / viewportHeight)
        );
      } else {
        const denom = anchorTop + viewportHeight;
        if (denom <= 0) {
          scrollProgress = Math.max(
            0,
            Math.min(1, -containerTop / viewportHeight)
          );
        } else {
          scrollProgress = Math.max(
            0,
            Math.min(1, (anchorTop - containerTop) / denom)
          );
        }
      }

      // 避免微小的进度变化导致频繁更新
      if (Math.abs(scrollProgress - lastScrollProgressRef.current) > 0.001) {
        // 根据滚动进度更新视频播放位置
        if (video.duration) {
          video.currentTime = video.duration * scrollProgress;
        }

        container.style.setProperty(
          '--scrolly-progress',
          scrollProgress.toFixed(4)
        );

        // 根据滚动进度设置视频结束状态
        // 只有当进度变化超过阈值时才更新状态，减少重渲染
        if (scrollProgress >= 1.0 && !isVideoEnded) {
          setIsVideoEnded(true);
        } else if (scrollProgress < 1.0 && isVideoEnded) {
          setIsVideoEnded(false);
        }

        lastScrollProgressRef.current = scrollProgress;
      }
    });
  }, [isVideoEnded]);

  // 视口高度变化且用户大致在页顶时重采锚点，避免移动端地址栏/横竖屏后错位
  useEffect(() => {
    const onResize = () => {
      if (window.scrollY <= SCROLL_TOP_EPS) {
        captureScrollAnchor();
        handleScroll();
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [captureScrollAnchor, handleScroll]);

  // 滚动同步逻辑
  useEffect(() => {
    // 监听滚动事件
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初始执行一次
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [handleScroll]);

  // 视频事件处理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      // 视频加载完成后，重新计算滚动进度，确保初始位置正确
      handleScroll();
    };

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      // 视频可以播放时，重新计算滚动进度，确保初始位置正确
      handleScroll();
    };

    const handleEnded = () => {
      // 视频播放结束后，设置为结束状态
      setIsVideoEnded(true);
    };

    const handlePlay = () => {
      setIsVideoEnded(false);
    };

    const handlePause = () => {
      // 视频暂停处理
    };

    const handleTimeUpdate = () => {
      if (video && Math.abs(video.currentTime - video.duration) < 0.5) {
        // 视频接近结束时，设置为结束状态
        setIsVideoEnded(true);
      }
    };

    const handleError = (e: Event) => {
      setIsVideoLoaded(true);
      if (process.env.NODE_ENV === 'development') {
        console.error('Video error:', e);
        console.error('Video error details:', {
          error: video.error?.code,
          message: video.error?.message,
        });
      }
    };

    // 监听视频缓冲事件
    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const progress = bufferedEnd / video.duration;
        setBufferProgress(progress);
      }
    };

    // 添加事件监听器
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('progress', handleProgress);

    // 使用导入的移动端视频初始化工具
    const cleanupMobileVideo = initMobileVideo(video);

    return () => {
      // 移除事件监听器
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('progress', handleProgress);
      // 调用移动端视频初始化的清理函数
      cleanupMobileVideo();
    };
  }, [src, handleScroll]);

  return (
    <div
      id={id}
      className={`scrolly-video-container ${className} ${isVideoEnded ? 'video-ended' : ''}`}
      ref={containerRef}
      style={{
        height,
        width,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        className="scrolly-video-element video-ready"
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        style={{ opacity: 1 }}
      />

      {children ? (
        <div
          className={`scrolly-video-overlay${isVideoLoaded ? ' scrolly-video-overlay--media-ready' : ''}`}
        >
          <div className="scrolly-video-overlay__scrim" aria-hidden="true" />
          <div className="scrolly-video-overlay__inner">{children}</div>
        </div>
      ) : null}

      {/* 缓冲指示器 */}
      {isBuffering && (
        <div className="scrolly-video-buffering">
          <div className="loading-spinner"></div>
          <div className="buffer-progress">
            缓冲中: {Math.round(bufferProgress * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollyVideo;
