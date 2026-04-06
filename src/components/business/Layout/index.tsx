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
import {
  Suspense,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { logout } from '@/redux/slices/userSlice';
import BrandLogo from '@/components/ui/BrandLogo/BrandLogo';
import ProgressBar from '@/components/ui/ProgressBar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SiteFooter from '@/components/business/SiteFooter/SiteFooter';
import './index.less';

const { Header: AntHeader } = AntLayout;

/** 纵向位移超过该值才切换顶栏/导航显隐，抑制触控板微抖动 */
const SCROLL_DIR_THRESHOLD_PX = 10;

/** 首页顶栏「叠视频」混合：scrollY ≤ START 为 1，≥ END 为 0，之间线性 */
const CHROME_BLEND_SCROLL_START = 72;
const CHROME_BLEND_SCROLL_END = 260;
/** rAF 每帧向目标靠拢比例，越小越柔 */
const CHROME_BLEND_LERP = 0.09;

function computeChromeTargetBlend(scrollY: number): number {
  if (scrollY <= CHROME_BLEND_SCROLL_START) return 1;
  if (scrollY >= CHROME_BLEND_SCROLL_END) return 0;
  return (
    (CHROME_BLEND_SCROLL_END - scrollY) /
    (CHROME_BLEND_SCROLL_END - CHROME_BLEND_SCROLL_START)
  );
}

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [topBarHeight, setTopBarHeight] = useState(52); // 顶部栏高度，移动端 44px
  const [navHeight, setNavHeight] = useState(64); // 导航栏高度，移动端48px
  const lastScrollYRef = useRef(0); // 使用ref替代state，避免不必要的重新渲染
  /** 合并到单帧，避免一次滚动排队多个 RAF 导致顺序错乱、导航条抖动 */
  const navRafRef = useRef<number | null>(null);
  const topLayoutRef = useRef<HTMLDivElement | null>(null);
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  const chromeTargetRef = useRef(0);
  const chromeSmoothedRef = useRef(0);
  const chromeBlendLoopRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);
  // 监听窗口大小变化，动态调整顶部栏和导航栏高度
  useEffect(() => {
    const updateHeights = () => {
      const isMobile = window.innerWidth <= 768;
      setTopBarHeight(isMobile ? 44 : 52);
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

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      reduceMotionRef.current = false;
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      reduceMotionRef.current = mq.matches;
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const applyChromeBlendToDom = useCallback((value: number) => {
    topLayoutRef.current?.style.setProperty(
      '--chrome-media-blend',
      value.toFixed(4)
    );
  }, []);

  const tickChromeBlend = useCallback(() => {
    chromeBlendLoopRef.current = null;
    if (pathnameRef.current !== '/') {
      chromeSmoothedRef.current = 0;
      chromeTargetRef.current = 0;
      applyChromeBlendToDom(0);
      return;
    }

    const target = chromeTargetRef.current;
    let s = chromeSmoothedRef.current;
    if (reduceMotionRef.current) {
      s = target;
    } else {
      s += (target - s) * CHROME_BLEND_LERP;
    }
    chromeSmoothedRef.current = s;
    applyChromeBlendToDom(s);

    const converged = reduceMotionRef.current || Math.abs(target - s) < 0.004;
    if (!converged) {
      chromeBlendLoopRef.current = requestAnimationFrame(tickChromeBlend);
    }
  }, [applyChromeBlendToDom]);

  const ensureChromeBlendLoop = useCallback(() => {
    if (chromeBlendLoopRef.current != null) return;
    chromeBlendLoopRef.current = requestAnimationFrame(tickChromeBlend);
  }, [tickChromeBlend]);

  useLayoutEffect(() => {
    if (location.pathname !== '/') {
      if (chromeBlendLoopRef.current != null) {
        cancelAnimationFrame(chromeBlendLoopRef.current);
        chromeBlendLoopRef.current = null;
      }
      chromeSmoothedRef.current = 0;
      chromeTargetRef.current = 0;
      applyChromeBlendToDom(0);
      return;
    }

    const t = computeChromeTargetBlend(window.scrollY);
    chromeTargetRef.current = t;
    chromeSmoothedRef.current = t;
    const sync = () => applyChromeBlendToDom(t);
    sync();
    if (!topLayoutRef.current) {
      requestAnimationFrame(sync);
    }
  }, [location.pathname, applyChromeBlendToDom]);

  useEffect(() => {
    return () => {
      if (chromeBlendLoopRef.current != null) {
        cancelAnimationFrame(chromeBlendLoopRef.current);
      }
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
      if (location.pathname === '/') {
        chromeTargetRef.current = computeChromeTargetBlend(window.scrollY);
        ensureChromeBlendLoop();
      }
    });
  }, [updateNavVisibility, location.pathname, ensureChromeBlendLoop]);

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
    <AntLayout ref={topLayoutRef} className="top-layout">
      {/* 页面游览进度条，根据菜单栏显示状态自动控制显示/隐藏 */}
      <ProgressBar isMenuVisible={isNavVisible} />

      {/* 顶栏 + 主导航：单容器固定定位，一层玻璃底，消除两行之间的缝与叠影 */}
      <div
        className={`site-chrome-shell ${isNavVisible ? '' : 'nav-hidden'}`}
        style={{
          transform: isNavVisible
            ? 'translateY(0)'
            : `translateY(-${topBarHeight + navHeight}px)`,
          opacity: isNavVisible ? 1 : 0,
        }}
      >
        <div className="top-bar">
          <div className="site-chrome-inner">
            <div className="top-bar-left">
              <SearchOutlined className="top-bar-icon" />
              <span className="phone-number">+86 13910417182</span>
            </div>
            <div className="top-bar-center">
              <button
                type="button"
                className="logo-chip"
                onClick={() => navigate('/')}
                aria-label="林之源 · 返回首页"
              >
                <BrandLogo decorative className="logo" />
              </button>
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
        </div>

        <AntHeader
          className={`nav-bar ${isNavVisible ? '' : 'nav-hidden'}`}
          style={{
            margin: 0,
            padding: 0,
            height: navHeight,
            border: 'none',
          }}
        >
          <div className="site-chrome-inner site-chrome-inner--nav">
            <Menu
              mode="horizontal"
              items={navItems}
              selectedKeys={[location.pathname]}
              className="nav-menu"
              overflowedIndicator={<MenuOutlined />}
              style={{
                flex: 1,
                minWidth: 0,
              }}
            />
          </div>
        </AntHeader>
      </div>

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
