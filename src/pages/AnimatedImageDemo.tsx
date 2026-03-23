import React from 'react';
import { AnimatedImage } from '@/animations';
import './AnimatedImageDemo.less';

/**
 * AnimatedImage组件示例页面
 * 展示不同动画类型的滚动触发效果
 */
const AnimatedImageDemo: React.FC = () => {
  // 示例图片数据
  const images = [
    {
      id: 1,
      src: 'https://picsum.photos/id/1018/800/600',
      alt: '示例图片1',
      animationType: 'fadeIn' as const,
      title: '淡入效果 (fadeIn)',
    },
    {
      id: 2,
      src: 'https://picsum.photos/id/1015/800/600',
      alt: '示例图片2',
      animationType: 'slideUp' as const,
      title: '向上滑动效果 (slideUp)',
    },
    {
      id: 3,
      src: 'https://picsum.photos/id/1019/800/600',
      alt: '示例图片3',
      animationType: 'slideDown' as const,
      title: '向下滑动效果 (slideDown)',
    },
    {
      id: 4,
      src: 'https://picsum.photos/id/1020/800/600',
      alt: '示例图片4',
      animationType: 'zoomIn' as const,
      title: '放大效果 (zoomIn)',
    },
    {
      id: 5,
      src: 'https://picsum.photos/id/1021/800/600',
      alt: '示例图片5',
      animationType: 'zoomOut' as const,
      title: '缩小效果 (zoomOut)',
    },
    {
      id: 6,
      src: 'https://picsum.photos/id/1022/800/600',
      alt: '示例图片6',
      animationType: 'slideLeft' as const,
      title: '向左滑动效果 (slideLeft)',
    },
    {
      id: 7,
      src: 'https://picsum.photos/id/1023/800/600',
      alt: '示例图片7',
      animationType: 'slideRight' as const,
      title: '向右滑动效果 (slideRight)',
    },
    {
      id: 8,
      src: 'https://picsum.photos/id/1024/800/600',
      alt: '示例图片8',
      animationType: 'fadeIn' as const,
      title: '淡入效果 - 长延迟',
      delay: 300,
    },
    {
      id: 9,
      src: 'https://picsum.photos/id/1025/800/600',
      alt: '示例图片9',
      animationType: 'zoomIn' as const,
      title: '放大效果 - 快速动画',
      duration: 400,
    },
  ];

  return (
    <div className="animated-image-demo">
      <div className="demo-header">
        <h1>滚动触发图片动画效果</h1>
        <p>基于Dify官网风格的平滑过渡动画，支持多种动画类型</p>
      </div>

      <div className="demo-content">
        {images.map((image, index) => (
          <div key={image.id} className="demo-item">
            <div className="demo-item-title">
              <h3>
                {index + 1}. {image.title}
              </h3>
              <code>{image.animationType}</code>
            </div>
            <div className="demo-item-image">
              <AnimatedImage
                src={image.src}
                alt={image.alt}
                className="demo-image"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="demo-footer">
        <p>向下滚动页面查看更多动画效果</p>
      </div>
    </div>
  );
};

export default AnimatedImageDemo;
