import React, { useCallback, useEffect, useState } from 'react';
import { Space, Button, Badge, Input, Grid, Tooltip } from 'antd';
import {
  MailOutlined,
  CustomerServiceOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '@/services/axiosInstance';
import type { StatsSummaryResponse } from '@/types/api';
import { MGMT_STATS_SUMMARY_REFRESH } from '@/utils/managementStatsRefresh';

/**
 * 顶栏下方工作台条：快捷入口（留言/工单带待处理角标）、产品搜索。
 */
const AdminWorkbenchBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isCompact = screens.lg === false;

  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const [pendingTicketCount, setPendingTicketCount] = useState(0);

  const loadSummary = useCallback(async () => {
    try {
      const res = (await axiosInstance.get(
        '/stats/summary'
      )) as StatsSummaryResponse;
      const d = res?.data;
      if (!d) return;
      setUnreadContactCount(
        d.unreadContactMessageCount == null ? 0 : d.unreadContactMessageCount
      );
      setPendingTicketCount(
        d.pendingSupportTicketCount == null ? 0 : d.pendingSupportTicketCount
      );
    } catch {
      /* 静默失败，避免与 Dashboard 重复弹窗 */
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, location.pathname]);

  useEffect(() => {
    const onRefresh = () => {
      void loadSummary();
    };
    window.addEventListener(MGMT_STATS_SUMMARY_REFRESH, onRefresh);
    return () =>
      window.removeEventListener(MGMT_STATS_SUMMARY_REFRESH, onRefresh);
  }, [loadSummary]);

  const onSearch = (raw: string) => {
    const q = raw.trim();
    if (!q) {
      navigate('/products');
      return;
    }
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const quick = (
    <Space size="small" wrap>
      <Tooltip title="联系留言（未读条数）">
        <Badge count={unreadContactCount} size="small" offset={[-2, 2]}>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<MailOutlined />}
            onClick={() => navigate('/contact-messages')}
          >
            {!isCompact ? '留言' : null}
          </Button>
        </Badge>
      </Tooltip>
      <Tooltip title="帮助工单（待处理）">
        <Badge count={pendingTicketCount} size="small" offset={[-2, 2]}>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<CustomerServiceOutlined />}
            onClick={() => navigate('/support-tickets')}
          >
            {!isCompact ? '工单' : null}
          </Button>
        </Badge>
      </Tooltip>
      <Tooltip title="产品管理 · 新建请在此页操作">
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => navigate('/products')}
        >
          {!isCompact ? '产品' : null}
        </Button>
      </Tooltip>
    </Space>
  );

  const search = (
    <Input.Search
      className="admin-workbench__search"
      placeholder={isCompact ? '搜产品' : '按名称搜索产品…'}
      allowClear
      enterButton={<SearchOutlined />}
      size="middle"
      onSearch={onSearch}
      style={{ maxWidth: isCompact ? 200 : 280 }}
    />
  );

  if (isCompact) {
    return (
      <div className="admin-workbench admin-workbench--compact">
        <div className="admin-workbench__row">{quick}</div>
        <div className="admin-workbench__row admin-workbench__row--search">
          {search}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-workbench">
      <div className="admin-workbench__inner">
        <div className="admin-workbench__center">{quick}</div>
        <div className="admin-workbench__right">{search}</div>
      </div>
    </div>
  );
};

export default AdminWorkbenchBar;
