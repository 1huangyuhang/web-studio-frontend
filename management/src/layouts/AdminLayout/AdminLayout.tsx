import React, { useEffect, useMemo, useState } from 'react';
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  Drawer,
  Grid,
  Dropdown,
  Avatar,
  theme as antdTheme,
  Alert,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { ADMIN_NAV_GROUPS, getBreadcrumbSegments } from '@/config/menuConfig';
import {
  formatManagementHealthProbeLabel,
  getManagementHealthProbeUrl,
} from '@/config/managementApiBase';
import AdminWorkbenchBar from '@/components/AdminWorkbenchBar';
import { useManagementStatsSync } from '@/realtime/useManagementStatsSync';
import './index.less';

const { Header, Content, Sider } = Layout;

const SIDER_EXPANDED = 232;
const SIDER_COLLAPSED = 72;

const MGMT_HINT_EVENT = 'mgmt-api-hint';
const SESSION_DISMISS_NETWORK = 'mgmt-hint-network-dismissed';
const SESSION_DISMISS_READONLY = 'mgmt-hint-readonly-dismissed';
const SESSION_DISMISS_BACKEND_HEALTH = 'mgmt-hint-backend-health-dismissed';

const AdminLayout: React.FC = () => {
  useManagementStatsSync();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isCompact = screens.lg === false;
  const { token } = antdTheme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiHint, setApiHint] = useState<null | 'network' | 'readOnly'>(null);
  const [backendHealthBad, setBackendHealthBad] = useState(false);

  /** 开发：同源 GET /health，经 Vite 代理到 REDWOOD_PORT_API；生产：后端 HTTP 源上的 /health */
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_DISMISS_BACKEND_HEALTH)) return;
    const ac = new AbortController();
    const timer = window.setTimeout(() => ac.abort(), 4000);
    void fetch(getManagementHealthProbeUrl(), {
      signal: ac.signal,
    })
      .then((res) => {
        if (!res.ok) setBackendHealthBad(true);
      })
      .catch(() => setBackendHealthBad(true))
      .finally(() => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const onHint = (e: Event) => {
      const ce = e as CustomEvent<{ kind?: 'network' | 'readOnly' }>;
      const kind = ce.detail?.kind;
      if (kind !== 'network' && kind !== 'readOnly') return;
      const dismissed =
        kind === 'network'
          ? sessionStorage.getItem(SESSION_DISMISS_NETWORK)
          : sessionStorage.getItem(SESSION_DISMISS_READONLY);
      if (dismissed) return;
      setApiHint(kind);
    };
    window.addEventListener(MGMT_HINT_EVENT, onHint);
    return () => window.removeEventListener(MGMT_HINT_EVENT, onHint);
  }, []);

  const dismissApiHint = () => {
    if (apiHint === 'network')
      sessionStorage.setItem(SESSION_DISMISS_NETWORK, '1');
    if (apiHint === 'readOnly')
      sessionStorage.setItem(SESSION_DISMISS_READONLY, '1');
    setApiHint(null);
  };

  const dismissBackendHealthHint = () => {
    sessionStorage.setItem(SESSION_DISMISS_BACKEND_HEALTH, '1');
    setBackendHealthBad(false);
  };

  const selectedKey = location.pathname === '' ? '/' : location.pathname;

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      ADMIN_NAV_GROUPS.map((group) => ({
        type: 'group' as const,
        label: group.label,
        children: group.routes.map((r) => ({
          key: r.menuKey,
          icon: <r.Icon />,
          label: r.label,
        })),
      })),
    []
  );

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key === '/' ? '/' : key);
    setMobileMenuOpen(false);
  };

  const breadcrumbItems = useMemo(() => {
    const segments = getBreadcrumbSegments(location.pathname);
    return segments.map((seg, i, arr) => {
      const isLast = i === arr.length - 1;
      if (isLast) {
        return { title: seg.title };
      }
      if (seg.path) {
        return {
          title: (
            <Link to={seg.path} className="admin-shell__crumb-link">
              {seg.title}
            </Link>
          ),
        };
      }
      return {
        title: (
          <span style={{ color: token.colorTextSecondary }}>{seg.title}</span>
        ),
      };
    });
  }, [location.pathname, token.colorTextSecondary]);

  const onUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('authToken');
      navigate('/login', { replace: true });
    }
  };

  const userMenu: MenuProps = {
    onClick: onUserMenuClick,
    items: [
      {
        key: 'profile',
        label: '账号设置',
        icon: <SettingOutlined />,
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
  };

  const siderMenu = (
    <>
      <div className="admin-shell__logo">
        <Link
          to="/"
          className="admin-shell__logo-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="admin-shell__logo-mark">管</span>
          {!collapsed || isCompact ? (
            <span className="admin-shell__logo-text">企业运营后台</span>
          ) : null}
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={onMenuClick}
        className="admin-shell__menu"
      />
    </>
  );

  const mainOffset = isCompact
    ? 0
    : collapsed
      ? SIDER_COLLAPSED
      : SIDER_EXPANDED;

  return (
    <Layout className="admin-shell">
      {!isCompact && (
        <Sider
          className="admin-shell__sider"
          width={SIDER_EXPANDED}
          collapsedWidth={SIDER_COLLAPSED}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="dark"
          trigger={null}
        >
          {siderMenu}
        </Sider>
      )}

      <Layout className="admin-shell__main" style={{ marginLeft: mainOffset }}>
        <Header className="admin-shell__header">
          <Button
            type="text"
            className="admin-shell__trigger"
            aria-label={
              isCompact ? '打开菜单' : collapsed ? '展开侧栏' : '收起侧栏'
            }
            icon={
              isCompact ? (
                <MenuUnfoldOutlined />
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() => {
              if (isCompact) {
                setMobileMenuOpen(true);
              } else {
                setCollapsed((c) => !c);
              }
            }}
          />

          <div className="admin-shell__breadcrumb">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="admin-shell__header-right">
            <Dropdown
              menu={userMenu}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="admin-shell__user" role="button" tabIndex={0}>
                <Avatar
                  size={36}
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                <span className="admin-shell__user-name">管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <div className="admin-shell__workbench-wrap">
          <div className="admin-shell__content-inner">
            <AdminWorkbenchBar />
          </div>
        </div>

        <Content className="admin-shell__content">
          <div className="admin-shell__content-inner">
            {backendHealthBad ? (
              <Alert
                type="error"
                showIcon
                closable
                onClose={dismissBackendHealthHint}
                message="后端服务未响应（/health）"
                description={`已探测 ${formatManagementHealthProbeLabel()} 失败。说明：/health 只表示「本机 Node 后端是否在监听」，不检查数据库是否已启动；库已开但后端没跑、或后端启动时因连库失败立刻退出，都会出现本提示。请在另一终端执行 cd backend && npm run dev，并确认终端持续打印 Server is running；若进程秒退，请看 DATABASE_URL / Prisma 迁移报错。PORT 须与 scripts/dev-ports.env 的 REDWOOD_PORT_API 一致。联调自检：npm run check:management-api。`}
                style={{ marginBottom: 16 }}
              />
            ) : null}
            {apiHint === 'network' ? (
              <Alert
                type="warning"
                showIcon
                closable
                onClose={dismissApiHint}
                message="无法连接后端 API"
                description="官网与管理端列表可能无法加载。请先在本机启动后端 API（cd backend && npm run dev）；数据库需可用但若仅库开着而后端未监听端口仍会失败。也可使用仓库根目录 npm run start:all。"
                style={{ marginBottom: 16 }}
              />
            ) : null}
            {apiHint === 'readOnly' ? (
              <Alert
                type="info"
                showIcon
                closable
                onClose={dismissApiHint}
                message="当前为只读账号"
                description="保存、删除等写操作会被拒绝。如需维护内容，请使用具备写权限的管理员账号登录。"
                style={{ marginBottom: 16 }}
              />
            ) : null}
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Drawer
        title="导航菜单"
        placement="left"
        width={280}
        onClose={() => setMobileMenuOpen(false)}
        open={isCompact && mobileMenuOpen}
        styles={{
          body: { padding: 0, background: 'var(--admin-sider-bg, #121820)' },
        }}
      >
        <div
          style={{
            background: 'var(--admin-sider-bg, #121820)',
            minHeight: '100%',
          }}
        >
          <div
            className="admin-shell__logo"
            style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}
          >
            <Link
              to="/"
              className="admin-shell__logo-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="admin-shell__logo-mark">管</span>
              <span className="admin-shell__logo-text">企业运营后台</span>
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={onMenuClick}
            className="admin-shell__menu"
            style={{ background: 'var(--admin-sider-bg, #121820)' }}
          />
        </div>
      </Drawer>
    </Layout>
  );
};

export default AdminLayout;
