import React, { useState, CSSProperties } from 'react';
import '../styles/AnimatedImage.less';

// 组件属性接口 - 移除了动画相关属性
export interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties; // 自定义样式
  fallbackSrc?: string; // 图片加载失败时的备用图片
}

/**
 * 基础图片组件
 * 移除了所有滚动触发动画效果，仅保留基础图片渲染功能
 */
const AnimatedImageComponent: React.FC<AnimatedImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZjZjZjZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjIwMHgxMDA8L3RleHQ+PC9zdmc+',
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  // 图片加载失败处理
  const handleImageError = () => {
    setCurrentSrc(fallbackSrc);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`animated-image ${className}`}
      loading="lazy"
      onError={handleImageError}
      style={style}
    />
  );
};

// 设置组件的显示名称，便于调试
AnimatedImageComponent.displayName = 'AnimatedImage';

export default AnimatedImageComponent;
