# 为footer实现图片动态滚动显示效果

## 实现目标
当页面滚动时，footer元素从被其他内容遮盖的状态逐渐显示出来，具有平滑自然的过渡效果和视觉层次感，适应不同屏幕尺寸。

## 实现方案

### 1. CSS样式调整
- 为`.footer-section`添加初始隐藏状态（opacity: 0, transform: translateY(20px)）
- 添加过渡属性（transition: opacity 0.8s ease, transform 0.8s ease）
- 定义可见状态类（.visible），设置opacity: 1, transform: translateY(0)
- 确保z-index正确，实现视觉分层

### 2. JavaScript实现
- 使用Intersection Observer API检测footer元素的可见性
- 当footer进入视口时，添加.visible类触发动画
- 实现组件挂载时的初始化和卸载时的清理

### 3. 响应式设计
- 为不同屏幕尺寸调整动画参数
- 确保在移动设备和桌面设备上都有良好的显示效果

## 具体修改

### 1. 修改footer组件
- 文件：`src/pages/Home/index.tsx`
- 添加useRef和useEffect钩子
- 实现Intersection Observer逻辑
- 将ref附加到footer元素

### 2. 更新footer样式
- 文件：`src/pages/Home/index.less`
- 添加初始隐藏状态样式
- 添加可见状态样式
- 添加过渡效果

## 预期效果
- 页面滚动时，footer从底部平滑上升并渐显
- 过渡效果自然流畅
- 具有视觉层次感
- 适配不同屏幕尺寸

## 技术要点
- Intersection Observer API用于滚动检测
- CSS transitions用于平滑动画
- React hooks用于组件状态管理
- 响应式设计确保跨设备兼容性