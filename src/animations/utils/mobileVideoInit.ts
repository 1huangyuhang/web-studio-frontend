/**
 * 移动端视频初始化工具
 * 用于处理移动端视频加载和播放的优化
 */

/**
 * 移动端检测正则表达式
 */
const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/**
 * 检测是否为移动端设备
 * @returns boolean
 */
export const isMobile = (): boolean => {
  return mobileRegex.test(navigator.userAgent);
};

/**
 * 移动端视频初始化函数
 * @param video HTMLVideoElement - 视频元素
 * @returns () => void - 清理函数
 */
export const initMobileVideo = (video: HTMLVideoElement): (() => void) => {
  if (!isMobile()) {
    // 非移动端，直接返回空清理函数
    return () => {};
  }

  // 定义触发视频加载的函数
  const triggerVideoLoad = () => {
    // 重置视频状态
    video.load();
    
    // 尝试播放视频，解决移动端首次加载问题
    video.play().catch(() => {
      // 自动播放失败时，至少确保视频已加载
      video.load();
    });
    
    // 移除所有事件监听器，避免重复触发
    document.removeEventListener('touchstart', triggerVideoLoad);
    document.removeEventListener('click', triggerVideoLoad);
    document.removeEventListener('scroll', triggerVideoLoad);
  };
  
  // 监听多种用户交互事件，确保视频能被触发
  document.addEventListener('touchstart', triggerVideoLoad, { once: true });
  document.addEventListener('click', triggerVideoLoad, { once: true });
  document.addEventListener('scroll', triggerVideoLoad, { once: true });
  
  // 返回清理函数
  return () => {
    document.removeEventListener('touchstart', triggerVideoLoad);
    document.removeEventListener('click', triggerVideoLoad);
    document.removeEventListener('scroll', triggerVideoLoad);
  };
};

export default {
  isMobile,
  initMobileVideo
};
