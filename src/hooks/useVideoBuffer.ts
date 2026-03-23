import { useEffect, useState } from 'react';

/**
 * 视频缓冲钩子，用于监听视频缓冲状态
 * @param videoRef 视频元素引用
 * @returns 缓冲状态和缓冲进度
 */
export const useVideoBuffer = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        setBufferProgress(
          video.buffered.end(video.buffered.length - 1) / video.duration
        );
      }
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
    };
  }, [videoRef]);

  return {
    isBuffering,
    bufferProgress,
  };
};
