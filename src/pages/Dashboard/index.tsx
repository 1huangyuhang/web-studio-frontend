import { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Button, Alert, Typography, Spin } from 'antd';
import {
  ExportOutlined,
  ReloadOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '@/services/api/axiosInstance';
import './index.less';

const { Paragraph, Text } = Typography;

type StatKey =
  | 'productCount'
  | 'activityCount'
  | 'newsCount'
  | 'siteAssetCount'
  | 'courseCount'
  | 'pricingPlanCount'
  | 'contactMessageCount'
  | 'supportTicketCount'
  | 'unreadContactMessageCount'
  | 'pendingSupportTicketCount';

type StatsData = Record<StatKey, number | null>;

const STAT_LABELS: Record<StatKey, string> = {
  productCount: '商品',
  activityCount: '活动',
  newsCount: '新闻',
  siteAssetCount: '站点素材',
  courseCount: '课程',
  pricingPlanCount: '价格方案',
  contactMessageCount: '联系留言',
  supportTicketCount: '支持工单',
  unreadContactMessageCount: '未读留言',
  pendingSupportTicketCount: '待处理工单',
};

function isStatsBody(
  v: unknown
): v is { data: StatsData; meta: { degraded?: boolean } } {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.data === 'object' && o.data != null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [meta, setMeta] = useState<{ degraded?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'auth' | 'forbidden' | 'network' | null>(
    null
  );

  const loadStats = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('auth');
      setStats(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body: unknown = await axiosInstance.get('/stats/summary');
      if (!isStatsBody(body)) {
        setError('network');
        setStats(null);
        return;
      }
      setStats(body.data);
      setMeta(body.meta ?? null);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        setError('forbidden');
      } else if (axios.isAxiosError(e) && e.response?.status === 401) {
        setError('auth');
      } else {
        setError('network');
      }
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleExport = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats-summary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="dashboard-page ly-container dashboard-page--center">
        <Spin size="large" tip="加载统计数据…" />
      </div>
    );
  }

  if (error === 'auth') {
    return (
      <div className="dashboard-page ly-container">
        <Alert
          type="info"
          showIcon
          icon={<LoginOutlined />}
          message="需要登录"
          description="仪表盘数据来自管理接口，请先登录具有相应权限的账号。"
          action={
            <Link to="/login">
              <Button type="primary" size="small">
                去登录
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (error === 'forbidden') {
    return (
      <div className="dashboard-page ly-container">
        <Alert
          type="warning"
          showIcon
          message="无权访问"
          description="当前账号无法查看统计摘要，请联系管理员或使用 API Key 配置后端。"
        />
      </div>
    );
  }

  if (error === 'network' || !stats) {
    return (
      <div className="dashboard-page ly-container">
        <Alert
          type="error"
          showIcon
          message="暂时无法加载统计"
          description="请确认后端已启动且已登录。"
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => void loadStats()}
            >
              重试
            </Button>
          }
        />
      </div>
    );
  }

  const statEntries = Object.entries(STAT_LABELS) as [StatKey, string][];

  return (
    <div className="dashboard-page ly-container">
      <div className="dashboard-header">
        <h1 className="page-title">仪表盘</h1>
        <div className="header-actions">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => void loadStats()}
            className="action-button"
          >
            刷新数据
          </Button>
          <Button
            type="default"
            icon={<ExportOutlined />}
            onClick={handleExport}
            className="action-button"
          >
            导出 JSON
          </Button>
        </div>
      </div>

      {meta?.degraded ? (
        <Alert
          type="warning"
          showIcon
          className="dashboard-degraded-banner"
          message="部分统计项暂时不可用（数据库单项查询失败）"
        />
      ) : null}

      <Row gutter={[16, 16]} className="dashboard-content">
        <Col span={24}>
          <Card className="dashboard-card">
            <h2>数据概览</h2>
            <Paragraph>
              以下为后端聚合的业务计数（与{' '}
              <Text code>GET /api/stats/summary</Text>{' '}
              一致）。在管理端维护内容后，此处刷新即可看到更新。
            </Paragraph>
          </Card>
        </Col>
        {statEntries.map(([key, label]) => {
          const v = stats[key];
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={key}>
              <Card className="dashboard-card dashboard-stat-card" size="small">
                <div className="dashboard-stat-label">{label}</div>
                <div className="dashboard-stat-value">
                  {v === null || v === undefined ? '—' : v}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
