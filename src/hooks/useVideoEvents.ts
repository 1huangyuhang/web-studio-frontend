import { useEffect } from 'react';

interface VideoEventsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
}

/**
 * 视频事件钩子，用于处理视频播放相关事件
 * @param props 视频事件配置
 */
export const useVideoEvents = ({
  videoRef,
  onEnded,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
  onLoadedData,
  onCanPlay,
}: VideoEventsProps) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onEnded?.();
    };

    const handlePlay = () => {
      onPlay?.();
    };

    const handlePause = () => {
      onPause?.();
    };

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };

    const handleDurationChange = () => {
      onDurationChange?.(video.duration);
    };

    const handleLoadedData = () => {
      onLoadedData?.();
    };

    const handleCanPlay = () => {
      onCanPlay?.();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [
    videoRef,
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate,
    onDurationChange,
    onLoadedData,
    onCanPlay,
  ]);
};
