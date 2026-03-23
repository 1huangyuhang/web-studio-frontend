import React from 'react';
import './HoverText.less';

interface HoverTextProps {
  text: string; // 显示的文字
  className?: string; // 可选的自定义类名
  baseColor?: string; // 可选的基础颜色
  hoverColor?: string; // 可选的悬停颜色
}

/**
 * 悬停文本组件 - 当鼠标悬停时改变颜色并添加文字阴影效果，避免容器限制
 * @param {HoverTextProps} props - 组件属性
 * @returns {JSX.Element} 悬停文本组件
 */
const HoverText: React.FC<HoverTextProps> = ({
  text,
  className = '',
  baseColor = '#2c1810', // 默认基础颜色 - 深棕色
  hoverColor = '#165DFF', // 默认悬停颜色 - 蓝色
}) => {
  return (
    <span
      className={`hover-text ${className}`}
      style={
        {
          '--base-color': baseColor,
          '--hover-color': hoverColor,
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
};

export default HoverText;
