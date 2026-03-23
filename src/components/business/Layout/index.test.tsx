import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './index';

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  configurable: true,
  value: 0,
});

describe('Layout Component - Scroll Interaction', () => {
  beforeEach(() => {
    // 重置window.scrollY
    window.scrollY = 0;
  });

  test('should render Layout component correctly', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 检查导航栏是否可见
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('商店')).toBeInTheDocument();
  });

  test('should show navigation bar when scrollY is 0', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 模拟滚动事件
    window.scrollY = 0;
    fireEvent.scroll(window);

    // 导航栏应该可见
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('should hide navigation bar when scrolling down', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 模拟向下滚动
    window.scrollY = 100;
    fireEvent.scroll(window);

    // 导航栏应该隐藏
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('nav-hidden');
  });

  test('should show navigation bar when scrolling up', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 首先模拟向下滚动，隐藏导航栏
    window.scrollY = 100;
    fireEvent.scroll(window);

    // 然后模拟向上滚动，显示导航栏
    window.scrollY = 50;
    fireEvent.scroll(window);

    // 导航栏应该可见
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('should show navigation bar on initial load', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 初始加载时，导航栏应该可见
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('');
    expect(navBar).not.toHaveClass('nav-hidden');
  });

  test('should not toggle navigation bar for small scroll movements', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 模拟小距离向下滚动
    window.scrollY = 5; // 小于滚动阈值（10px）
    fireEvent.scroll(window);

    // 导航栏应该保持可见
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveClass('');
    expect(navBar).not.toHaveClass('nav-hidden');
  });
});

// 测试响应式设计
describe('Layout Component - Responsive Design', () => {
  test('should apply mobile styles when viewport is small', () => {
    // 设置小视口
    global.innerWidth = 375;
    global.innerHeight = 667;

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 触发resize事件
    fireEvent.resize(window);

    // 检查导航栏是否应用了移动样式
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveStyle('height: 48px');
  });

  test('should apply desktop styles when viewport is large', () => {
    // 设置大视口
    global.innerWidth = 1200;
    global.innerHeight = 800;

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    // 触发resize事件
    fireEvent.resize(window);

    // 检查导航栏是否应用了桌面样式
    const navBar = document.querySelector('.nav-bar');
    expect(navBar).toHaveStyle('height: 64px');
  });
});
