import React from 'react';
import { Row, Col, Card, Alert, Button, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
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
import type {
  StatsSummaryDTO,
  StatsSummaryPartialDTO,
  StatsSummaryResponse,
} from '@/types/api';
import { queryKeys } from '@/queryKeys';
import { formatManagementListLoadError } from '@/utils/managementLoadErrorHint';

const emptyPartial: StatsSummaryPartialDTO = {
  productCount: null,
  activityCount: null,
  newsCount: null,
  siteAssetCount: null,
  courseCount: null,
  pricingPlanCount: null,
  contactMessageCount: null,
  supportTicketCount: null,
  unreadContactMessageCount: null,
  pendingSupportTicketCount: null,
};

type DashboardStatsState = {
  metrics: StatsSummaryPartialDTO;
  degraded: boolean;
  errors: Partial<Record<keyof StatsSummaryDTO, string>>;
};

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
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.stats.summary(),
    queryFn: async (): Promise<DashboardStatsState> => {
      const res = (await axiosInstance.get(
        '/stats/summary'
      )) as StatsSummaryResponse;
      if (!res?.data) {
        throw new Error('统计接口未返回 data');
      }
      return {
        metrics: res.data,
        degraded: res.meta?.degraded ?? false,
        errors: res.meta?.errors ?? {},
      };
    },
  });

  const metrics = data?.metrics ?? emptyPartial;
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

      {!isError && data?.degraded ? (
        <Alert
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          message="部分统计暂不可用"
          description="个别计数接口失败，已单独标为「—」；其余指标仍可参考。可稍后重试加载。"
        />
      ) : null}

      <Row gutter={[16, 16]} className="admin-dashboard__stats">
        {STAT_DEFS.map((def) => {
          const raw = metrics[def.key];
          const cellError = data?.errors?.[def.key];
          return (
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
                    ) : raw === null ? (
                      '—'
                    ) : (
                      raw
                    )}
                  </span>
                </div>
                <div className="admin-dashboard__kpi-label">{def.label}</div>
                {!showSkeleton && !isError && cellError ? (
                  <div
                    className="admin-dashboard__kpi-hint"
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: 'var(--app-text-tertiary, #888)',
                    }}
                  >
                    该项加载失败
                  </div>
                ) : null}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default Dashboard;
