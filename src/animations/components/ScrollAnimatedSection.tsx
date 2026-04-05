import React, { CSSProperties } from 'react';
import '../styles/ScrollAnimatedSection.less';

// 组件属性接口 - 移除了所有动画相关属性
export interface ScrollAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties; // 自定义样式
  id?: string; // 元素ID
  [key: string]: any; // 允许传递其他属性，如事件处理函数
}

/**
 * 基础section组件
 * 移除了所有滚动触发动画效果
 */
const ScrollAnimatedSectionComponent: React.FC<ScrollAnimatedSectionProps> = ({
  children,
  className = '',
  style = {},
  id,
  ...restProps // 接收所有其他属性，包括事件处理函数
}) => {
  return (
    <div
      id={id}
      className={`scroll-animated-section scroll-section--inview ${className} animate-visible`}
      style={{
        opacity: 1,
        transform: 'none',
        transition: 'none',
        ...style,
      }}
      {...restProps} // 传递所有其他属性，包括事件处理函数
    >
      {children}
    </div>
  );
};

// 使用React.memo优化性能
const ScrollAnimatedSection = React.memo(ScrollAnimatedSectionComponent);

// 设置组件的显示名称，便于调试
ScrollAnimatedSection.displayName = 'ScrollAnimatedSection';

export default ScrollAnimatedSection;
