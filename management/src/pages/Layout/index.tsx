import React from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { useState, useRef, useEffect } from 'react';
import {
  HomeOutlined,
  ProductOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MenuOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import './index.less';

const { Header, Content } = Layout;

const ManagementLayout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  // 菜单滑动功能状态管理
  const [slidePosition, setSlidePosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 引用DOM元素
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 触摸事件状态管理
  const touchStartXRef = useRef<number>(0);
  const touchMoveXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'products',
      icon: <ProductOutlined />,
      label: '产品管理',
    },
    {
      key: 'activities',
      icon: <CalendarOutlined />,
      label: '活动管理',
    },
    {
      key: 'news',
      icon: <FileTextOutlined />,
      label: '新闻管理',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    const { key } = e;
    if (key === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
    setMobileMenuVisible(false);
  };

  // 检测菜单是否溢出
  const checkMenuOverflow = () => {
    if (!menuContainerRef.current || !menuRef.current) return;

    const containerWidth = menuContainerRef.current.clientWidth;
    const menuWidth = menuRef.current.scrollWidth;
    const maxSlide = Math.max(0, menuWidth - containerWidth);

    // 当容器宽度大于菜单宽度时，重置滑动位置
    if (containerWidth >= menuWidth && slidePosition > 0) {
      setSlidePosition(0);
      return;
    }

    // 确保滑动位置不超过最大值
    if (slidePosition > maxSlide) {
      setSlidePosition(maxSlide);
      return;
    }

    // 检测是否需要显示左右箭头
    setShowLeftArrow(slidePosition > 0);
    setShowRightArrow(slidePosition < maxSlide);
  };

  // 滑动菜单
  const slideMenu = (direction: 'left' | 'right') => {
    if (!menuContainerRef.current || !menuRef.current) return;

    const containerWidth = menuContainerRef.current.clientWidth;
    const menuWidth = menuRef.current.scrollWidth;
    const maxSlide = menuWidth - containerWidth;

    let newPosition = slidePosition;

    if (direction === 'left') {
      // 向右滑动（显示左侧内容）
      newPosition = Math.max(0, slidePosition - containerWidth / 2);
    } else {
      // 向左滑动（显示右侧内容）
      newPosition = Math.min(maxSlide, slidePosition + containerWidth / 2);
    }

    setSlidePosition(newPosition);
  };

  // 窗口大小变化时重新检测溢出
  useEffect(() => {
    checkMenuOverflow();
    window.addEventListener('resize', checkMenuOverflow);
    return () => window.removeEventListener('resize', checkMenuOverflow);
  }, [slidePosition]);

  // 滑动位置变化时重新检测溢出
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.scrollLeft = slidePosition;
      checkMenuOverflow();
    }
  }, [slidePosition]);

  return (
    <Layout className="management-layout">
      {/* 顶部导航栏 - 模仿腾讯云样式 */}
      <Header className="tencent-cloud-header">
        <div className="header-content">
          <div className="header-left">
            {/* 品牌Logo */}
            <div className="logo-container">
              <h1 className="logo">企业管理系统</h1>
            </div>

            {/* 菜单滑动容器 */}
            <div className="menu-slide-container">
              {/* 左滑动按钮 */}
              {showLeftArrow && (
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={() => slideMenu('left')}
                  className="menu-slide-btn menu-slide-btn-left"
                />
              )}

              {/* 菜单容器 */}
              <div className="menu-container" ref={menuContainerRef}>
                <div
                  className="menu-wrapper"
                  ref={menuRef}
                  onTouchStart={(e) => {
                    touchStartXRef.current = e.touches[0].clientX;
                    isDraggingRef.current = true;
                  }}
                  onTouchMove={(e) => {
                    if (
                      !isDraggingRef.current ||
                      !menuContainerRef.current ||
                      !menuRef.current
                    )
                      return;

                    touchMoveXRef.current = e.touches[0].clientX;
                    const deltaX =
                      touchMoveXRef.current - touchStartXRef.current;
                    const containerWidth = menuContainerRef.current.clientWidth;
                    const menuWidth = menuRef.current.scrollWidth;
                    const maxSlide = Math.max(0, menuWidth - containerWidth);

                    // 计算新的滑动位置
                    let newPosition = slidePosition - deltaX;
                    newPosition = Math.max(0, Math.min(maxSlide, newPosition));

                    // 实时更新滑动位置
                    setSlidePosition(newPosition);
                    touchStartXRef.current = touchMoveXRef.current;
                  }}
                  onTouchEnd={() => {
                    isDraggingRef.current = false;
                  }}
                >
                  {/* 桌面端导航菜单 - 优化核心功能可见性 */}
                  <Menu
                    mode="horizontal"
                    defaultSelectedKeys={['dashboard']}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="tencent-cloud-menu"
                    overflowedIndicator={null} // 移除溢出菜单指示器
                  />
                </div>
              </div>

              {/* 右滑动按钮 */}
              {showRightArrow && (
                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={() => slideMenu('right')}
                  className="menu-slide-btn menu-slide-btn-right"
                />
              )}
            </div>
          </div>

          <div className="header-right">
            {/* 用户中心 */}
            <div className="user-center">
              <UserOutlined />
              <span className="admin-name">管理员</span>
            </div>

            {/* 移动端菜单按钮 */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-btn"
            />
          </div>
        </div>
      </Header>

      <Layout>
        {/* 移动端侧边栏 */}
        <Drawer
          title="菜单"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            items={menuItems}
            onClick={handleMenuClick}
            className="mobile-menu"
          />
        </Drawer>

        {/* 主内容区 */}
        <Layout className="management-content-layout">
          <Content className="management-main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ManagementLayout;
