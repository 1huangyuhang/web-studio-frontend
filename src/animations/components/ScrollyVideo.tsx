import React, { useRef, useEffect, useState } from 'react';
import '../styles/ScrollyVideo.less';
import { initMobileVideo } from '../utils/mobileVideoInit';

interface ScrollyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  id?: string;
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

  const handleScroll = () => {
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

      // 滚动进度计算：
      // 当页面顶部与视频容器顶部对齐时，进度为0（视频开始）
      // 当视频容器完全离开视口底部时，进度为1（视频结束）
      // 简化计算公式，直接使用容器顶部位置
      const scrollProgress = Math.max(
        0,
        Math.min(
          1,
          (-containerTop) / viewportHeight
        )
      );
      
      // 避免微小的进度变化导致频繁更新
      if (Math.abs(scrollProgress - lastScrollProgressRef.current) > 0.001) {
        // 根据滚动进度更新视频播放位置
        if (video.duration) {
          video.currentTime = video.duration * scrollProgress;
        }
        
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
  };

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
  }, [isVideoEnded]);

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
  }, [src]);

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
        // 添加样式，避免刷新页面时视频闪帧
        style={{
          opacity: isVideoLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

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
