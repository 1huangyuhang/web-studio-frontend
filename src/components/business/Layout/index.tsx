import { Layout as AntLayout, Menu, Button, Dropdown } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { logo } from '@/assets/images/common';
import ProgressBar from '@/components/ui/ProgressBar';
import './index.less';

const { Header: AntHeader } = AntLayout;

const Layout = () => {
  const navigate = useNavigate();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [topBarHeight, setTopBarHeight] = useState(56); // 顶部栏高度，移动端44px
  const [navHeight, setNavHeight] = useState(64); // 导航栏高度，移动端48px
  const lastScrollYRef = useRef(0); // 使用ref替代state，避免不必要的重新渲染

  // 监听窗口大小变化，动态调整顶部栏和导航栏高度
  useEffect(() => {
    const updateHeights = () => {
      const isMobile = window.innerWidth <= 768;
      setTopBarHeight(isMobile ? 44 : 56);
      setNavHeight(isMobile ? 48 : 64);
    };

    // 初始调用一次
    updateHeights();

    // 监听窗口大小变化
    window.addEventListener('resize', updateHeights);

    // 清理函数
    return () => {
      window.removeEventListener('resize', updateHeights);
    };
  }, []);

  // 节流函数
  // 限制函数在一定时间内最多执行一次
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= wait) {
        lastCall = now;
        func(...args);
      }
    };
  };

  // 保存最新的滚动状态，用于requestAnimationFrame
  const scrollStateRef = useRef({
    currentScrollY: 0,
    lastScrollY: lastScrollYRef.current,
  });

  // 更新导航栏可见性，使用requestAnimationFrame优化性能
  const updateNavVisibility = useCallback(() => {
    const { currentScrollY, lastScrollY } = scrollStateRef.current;

    // 计算滚动差异
    const scrollDiff = currentScrollY - lastScrollY;

    // 直接根据滚动方向判断，移除阈值限制
    // 向下滑动 - 隐藏菜单栏
    if (scrollDiff > 0) {
      setIsNavVisible(false);
    }
    // 向上滑动 - 显示菜单栏
    else if (scrollDiff < 0) {
      setIsNavVisible(true);
    }

    // 处理边界情况：页面顶部（scrollY <= 0）时始终显示导航栏
    if (currentScrollY <= 0) {
      setIsNavVisible(true);
    }

    // 始终更新上一次滚动位置的ref，确保下一次滚动时能正确判断方向
    lastScrollYRef.current = currentScrollY;
  }, []);

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    // 获取当前滚动位置
    const currentScrollY = window.scrollY;
    const lastScrollY = lastScrollYRef.current;

    // 更新滚动状态
    scrollStateRef.current = {
      currentScrollY,
      lastScrollY,
    };

    // 使用requestAnimationFrame优化状态更新
    requestAnimationFrame(updateNavVisibility);
  }, [updateNavVisibility]);

  // 创建节流处理函数，限制每秒最多执行60次（约16ms一次）
  const throttledHandleScroll = useCallback(throttle(handleScroll, 16), [
    handleScroll,
  ]);

  useEffect(() => {
    // 添加滚动事件监听器，使用passive选项优化性能
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // 初始化滚动位置
    lastScrollYRef.current = window.scrollY;

    // 清理函数
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [throttledHandleScroll]);

  // 处理退出登录
  const handleLogout = () => {
    navigate('/login');
  };

  // 导航菜单
  const navItems = [
    {
      key: '/',
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/shop',
      label: '商店',
      onClick: () => navigate('/shop'),
    },
    {
      key: '/activities',
      label: '活动',
      onClick: () => navigate('/activities'),
    },
    {
      key: '/courses',
      label: '课程',
      onClick: () => navigate('/courses'),
    },
    {
      key: '/prices',
      label: '价格',
      onClick: () => navigate('/prices'),
    },
    {
      key: '/company',
      label: '公司',
      children: [
        {
          key: '/company/news',
          label: '新闻',
          onClick: () => navigate('/company/news'),
        },
        {
          key: '/company/case',
          label: '成功案例',
          onClick: () => navigate('/company/case'),
        },
        {
          key: '/company/about',
          label: '关于我们',
          onClick: () => navigate('/company/about'),
        },
      ],
    },
    {
      key: '/help',
      label: '帮助',
      onClick: () => navigate('/help'),
    },
    {
      key: '/contact',
      label: '联系我们',
      onClick: () => navigate('/contact'),
    },
  ];

  // 用户菜单
  const userMenu = [
    {
      key: 'application',
      label: '应用程序',
    },
    {
      key: 'account',
      label: '我的账户',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="top-layout">
      {/* 页面游览进度条，根据菜单栏显示状态自动控制显示/隐藏 */}
      <ProgressBar isMenuVisible={isNavVisible} />

      {/* 顶部栏 */}
      <div
        className={`top-bar ${isNavVisible ? '' : 'nav-hidden'}`}
        style={{
          transform: isNavVisible
            ? 'translateY(0)'
            : `translateY(-${topBarHeight}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <div className="top-bar-left">
          <SearchOutlined className="top-bar-icon" />
          <span className="phone-number">+86 1391041782</span>
        </div>
        <div className="top-bar-center">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="top-bar-right">
          <ShoppingCartOutlined className="top-bar-icon" />
          <Dropdown menu={{ items: userMenu }} trigger={['click']}>
            <UserOutlined className="top-bar-icon user-icon" />
          </Dropdown>
          <Button
            type="primary"
            className="contact-button"
            onClick={() => navigate('/contact')}
          >
            联系我们
          </Button>
        </div>
      </div>

      {/* 导航栏 */}
      <AntHeader
        className={`nav-bar ${isNavVisible ? '' : 'nav-hidden'}`}
        style={{
          transform: isNavVisible
            ? 'translateY(0)'
            : `translateY(-${topBarHeight + navHeight}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: topBarHeight,
          left: 0,
          right: 0,
          zIndex: 1000,
          margin: 0,
          padding: 0,
          height: navHeight,
          border: 'none',
        }}
      >
        {/* 导航菜单 */}
        <Menu
          mode="horizontal"
          items={navItems}
          selectedKeys={[window.location.pathname]}
          className="nav-menu"
          overflowedIndicator={<MenuOutlined />}
          style={{
            transition: 'all 0.3s ease-in-out',
            flex: 1,
          }}
        />
      </AntHeader>

      {/* 占位元素，避免内容被固定定位的导航栏遮挡 */}
      <div
        style={{
          height: `${topBarHeight + navHeight}px`,
          width: '100%',
        }}
      />

      {/* 内容区域 - 直接使用Outlet，移除app-content div */}
      <Outlet />
    </AntLayout>
  );
};

export default Layout;
