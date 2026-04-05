import {
  Layout as AntLayout,
  Menu,
  Button,
  Dropdown,
  Badge,
  Popover,
  Empty,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { logout } from '@/redux/slices/userSlice';
import { logo } from '@/assets/images/common';
import ProgressBar from '@/components/ui/ProgressBar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SiteFooter from '@/components/business/SiteFooter/SiteFooter';
import './index.less';

const { Header: AntHeader } = AntLayout;

/** 纵向位移超过该值才切换顶栏/导航显隐，抑制触控板微抖动 */
const SCROLL_DIR_THRESHOLD_PX = 10;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [topBarHeight, setTopBarHeight] = useState(56); // 顶部栏高度，移动端44px
  const [navHeight, setNavHeight] = useState(64); // 导航栏高度，移动端48px
  const lastScrollYRef = useRef(0); // 使用ref替代state，避免不必要的重新渲染
  /** 合并到单帧，避免一次滚动排队多个 RAF 导致顺序错乱、导航条抖动 */
  const navRafRef = useRef<number | null>(null);
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

  const updateNavVisibility = useCallback(() => {
    const y = window.scrollY;
    const prev = lastScrollYRef.current;
    const d = y - prev;

    if (y <= 1) {
      setIsNavVisible((p) => (p ? p : true));
      lastScrollYRef.current = y;
      return;
    }

    if (d >= SCROLL_DIR_THRESHOLD_PX) {
      setIsNavVisible((p) => (p === false ? p : false));
      lastScrollYRef.current = y;
      return;
    }

    if (d <= -SCROLL_DIR_THRESHOLD_PX) {
      setIsNavVisible((p) => (p === true ? p : true));
      lastScrollYRef.current = y;
      return;
    }

    // 微小抖动：不更新 lastScrollYRef，避免在临界区来回改「上一帧」导致误判
  }, []);

  const handleScroll = useCallback(() => {
    if (navRafRef.current != null) return;
    navRafRef.current = requestAnimationFrame(() => {
      navRafRef.current = null;
      updateNavVisibility();
    });
  }, [updateNavVisibility]);

  useEffect(() => {
    let lastCall = 0;
    const waitMs = 16;
    const throttledScroll = () => {
      const now = Date.now();
      if (now - lastCall < waitMs) return;
      lastCall = now;
      handleScroll();
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    lastScrollYRef.current = window.scrollY;

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  const handleLogout = () => {
    dispatch(logout());
    message.success('已退出登录');
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

  // 购物车数量：后续可接入全局状态 / 接口；默认 0 表示空车
  const [cartCount] = useState(0);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'application',
      icon: <AppstoreOutlined />,
      label: '应用程序',
      onClick: () => navigate('/applications'),
    },
    {
      key: 'account',
      icon: <IdcardOutlined />,
      label: '我的账户',
      onClick: () => navigate('/account'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const cartPanel = (
    <div className="top-bar-cart-panel">
      {cartCount === 0 ? (
        <>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="购物车还是空的"
            className="top-bar-cart-empty"
          />
          <Button
            type="primary"
            block
            className="top-bar-cart-cta"
            onClick={() => navigate('/shop')}
          >
            去商店选购
          </Button>
        </>
      ) : (
        <>
          <p className="top-bar-cart-summary">共 {cartCount} 件商品</p>
          <Button type="primary" block onClick={() => navigate('/shop')}>
            去结算
          </Button>
        </>
      )}
    </div>
  );

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
          <span className="phone-number">+86 13910417182</span>
        </div>
        <div className="top-bar-center">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="top-bar-right">
          <ThemeToggle />
          <Popover
            content={cartPanel}
            title="购物车"
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="top-bar-cart-popover"
          >
            <button
              type="button"
              className="top-bar-icon-btn cart-trigger"
              aria-label="打开购物车预览"
              aria-haspopup="dialog"
            >
              <Badge count={cartCount} size="small" offset={[4, 0]}>
                <span className="top-bar-badge-anchor">
                  <ShoppingCartOutlined aria-hidden />
                </span>
              </Badge>
            </button>
          </Popover>
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: 'top-bar-user-dropdown' }}
          >
            <button
              type="button"
              className="top-bar-icon-btn user-menu-trigger"
              aria-label="用户菜单"
              aria-haspopup="menu"
            >
              <UserOutlined aria-hidden />
            </button>
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
          selectedKeys={[location.pathname]}
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

      <main className="site-main">
        <Suspense
          fallback={
            <div
              className="site-outlet-fallback site-outlet-fallback--silent"
              aria-hidden
            />
          }
        >
          <Outlet />
        </Suspense>
        <SiteFooter />
      </main>
    </AntLayout>
  );
};

export default Layout;
