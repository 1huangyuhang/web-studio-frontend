import React, { useCallback, useEffect, useMemo } from 'react';
import { Row, Col, Card, Alert, Button, Spin } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingOutlined,
  CalendarOutlined,
  ReadOutlined,
  PictureOutlined,
  BookOutlined,
  TagOutlined,
  MailOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import axiosInstance from '../services/axiosInstance';
import wsService from '../services/websocket';
import type { WebSocketEvent } from '../services/websocket';
import type { StatsSummaryDTO, StatsSummaryResponse } from '@/types/api';
import { queryKeys } from '@/queryKeys';
import { formatManagementListLoadError } from '@/utils/managementLoadErrorHint';

const emptyStats: StatsSummaryDTO = {
  productCount: 0,
  activityCount: 0,
  newsCount: 0,
  siteAssetCount: 0,
  courseCount: 0,
  pricingPlanCount: 0,
  contactMessageCount: 0,
  supportTicketCount: 0,
  unreadContactMessageCount: 0,
  pendingSupportTicketCount: 0,
};

function mapStatsBody(d: StatsSummaryResponse['data']): StatsSummaryDTO {
  if (!d) return { ...emptyStats };
  return {
    productCount: d.productCount ?? 0,
    activityCount: d.activityCount ?? 0,
    newsCount: d.newsCount ?? 0,
    siteAssetCount: d.siteAssetCount ?? 0,
    courseCount: d.courseCount ?? 0,
    pricingPlanCount: d.pricingPlanCount ?? 0,
    contactMessageCount: d.contactMessageCount ?? 0,
    supportTicketCount: d.supportTicketCount ?? 0,
    unreadContactMessageCount: d.unreadContactMessageCount ?? 0,
    pendingSupportTicketCount: d.pendingSupportTicketCount ?? 0,
  };
}

type StatDef = {
  key: keyof StatsSummaryDTO;
  label: string;
  icon: React.ReactNode;
  accent: 'primary' | 'slate' | 'amber' | 'teal';
};

const STAT_DEFS: StatDef[] = [
  {
    key: 'productCount',
    label: '产品',
    icon: <ShoppingOutlined />,
    accent: 'primary',
  },
  {
    key: 'activityCount',
    label: '活动',
    icon: <CalendarOutlined />,
    accent: 'slate',
  },
  {
    key: 'newsCount',
    label: '新闻',
    icon: <ReadOutlined />,
    accent: 'slate',
  },
  {
    key: 'siteAssetCount',
    label: '站点素材',
    icon: <PictureOutlined />,
    accent: 'amber',
  },
  {
    key: 'courseCount',
    label: '课程',
    icon: <BookOutlined />,
    accent: 'teal',
  },
  {
    key: 'pricingPlanCount',
    label: '价格套餐',
    icon: <TagOutlined />,
    accent: 'primary',
  },
  {
    key: 'contactMessageCount',
    label: '联系留言',
    icon: <MailOutlined />,
    accent: 'teal',
  },
  {
    key: 'supportTicketCount',
    label: '帮助工单',
    icon: <CustomerServiceOutlined />,
    accent: 'amber',
  },
];

const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.stats.summary(),
    queryFn: async () => {
      const res = (await axiosInstance.get(
        '/stats/summary'
      )) as StatsSummaryResponse;
      if (!res?.data) {
        throw new Error('统计接口未返回 data');
      }
      return mapStatsBody(res.data);
    },
  });

  const invalidateStats = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
  }, [queryClient]);

  const wsPairs = useMemo(
    () =>
      [
        ['product:created', invalidateStats],
        ['product:updated', invalidateStats],
        ['product:deleted', invalidateStats],
        ['activity:created', invalidateStats],
        ['activity:updated', invalidateStats],
        ['activity:deleted', invalidateStats],
        ['news:created', invalidateStats],
        ['news:updated', invalidateStats],
        ['news:deleted', invalidateStats],
        ['course:created', invalidateStats],
        ['course:updated', invalidateStats],
        ['course:deleted', invalidateStats],
        ['pricingPlan:created', invalidateStats],
        ['pricingPlan:updated', invalidateStats],
        ['pricingPlan:deleted', invalidateStats],
        ['contactMessage:created', invalidateStats],
        ['contactMessage:deleted', invalidateStats],
        ['supportTicket:created', invalidateStats],
        ['supportTicket:updated', invalidateStats],
        ['supportTicket:deleted', invalidateStats],
      ] as [keyof WebSocketEvent, () => void][],
    [invalidateStats]
  );

  useEffect(() => {
    wsPairs.forEach(([ev, fn]) => wsService.on(ev, fn));
    return () => {
      wsPairs.forEach(([ev, fn]) => wsService.off(ev, fn));
    };
  }, [wsPairs]);

  const stats = data ?? emptyStats;
  const showSkeleton = isPending || (isFetching && !data);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__hero">
        <h1 className="admin-dashboard__title">工作台</h1>
        <p className="admin-dashboard__subtitle">
          数据总览与快捷感知；指标随列表与 WebSocket 事件自动刷新。
        </p>
      </div>

      {isError ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="统计数据加载失败"
          description={
            <span>
              {formatManagementListLoadError(error, '统计摘要')}
              <Button
                type="link"
                size="small"
                onClick={() => void refetch()}
                style={{ paddingLeft: 8 }}
              >
                重试
              </Button>
            </span>
          }
        />
      ) : null}

      <Row gutter={[16, 16]} className="admin-dashboard__stats">
        {STAT_DEFS.map((def) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={def.key}>
            <Card
              bordered={false}
              className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--${def.accent}`}
            >
              <div className="admin-dashboard__kpi-top">
                <span
                  className={`admin-dashboard__kpi-icon admin-dashboard__kpi-icon--${def.accent}`}
                  aria-hidden
                >
                  {def.icon}
                </span>
                <span className="admin-dashboard__kpi-value">
                  {showSkeleton ? (
                    <Spin size="small" />
                  ) : isError ? (
                    '—'
                  ) : (
                    stats[def.key]
                  )}
                </span>
              </div>
              <div className="admin-dashboard__kpi-label">{def.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
