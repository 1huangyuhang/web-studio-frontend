import type { ReactNode } from 'react';
import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import {
  BookOutlined,
  ShopOutlined,
  CalendarOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import './index.less';

const { Title, Text, Paragraph } = Typography;

type AppItem = {
  key: string;
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  tag?: string;
};

const applications: AppItem[] = [
  {
    key: 'courses',
    title: '学习中心',
    description: '浏览课程目录、报名与进度管理，系统化提升技能。',
    path: '/courses',
    icon: <BookOutlined />,
  },
  {
    key: 'shop',
    title: '在线商店',
    description: '选购产品与服务，查看购物车与订单相关入口。',
    path: '/shop',
    icon: <ShopOutlined />,
  },
  {
    key: 'activities',
    title: '活动专区',
    description: '最新市场活动、促销与线下活动资讯一站汇总。',
    path: '/activities',
    icon: <CalendarOutlined />,
  },
  {
    key: 'dashboard',
    title: '数据仪表盘',
    description: '查看业务概览、统计图表与近期动态（演示数据）。',
    path: '/dashboard',
    icon: <DashboardOutlined />,
    tag: '管理',
  },
  {
    key: 'help',
    title: '帮助中心',
    description: '常见问题、使用指南与工单提交，快速获得支持。',
    path: '/help',
    icon: <QuestionCircleOutlined />,
  },
  {
    key: 'contact',
    title: '联系我们',
    description: '商务合作、售前咨询与客服渠道，我们尽快与您联系。',
    path: '/contact',
    icon: <CustomerServiceOutlined />,
  },
];

export default function Applications() {
  const navigate = useNavigate();

  return (
    <MarketingPageShell
      pageClass="applications-page"
      customHeader={
        <div className="applications-hero">
          <Tag
            icon={<RocketOutlined />}
            color="volcano"
            className="applications-hero-tag"
          >
            站内应用
          </Tag>
          <Title level={1} className="applications-title">
            应用程序
          </Title>
          <Paragraph className="applications-lead">
            从学习到购物、活动与客服，以下入口与站点主要功能一一对应。选择应用即可跳转。
          </Paragraph>
        </div>
      }
    >
      <Row gutter={[20, 20]} className="applications-grid">
        {applications.map((app) => (
          <Col xs={24} sm={12} lg={8} key={app.key}>
            <Card className="applications-card" bordered={false}>
              <div className="applications-card-icon">{app.icon}</div>
              <div className="applications-card-head">
                <Title level={4} className="applications-card-title">
                  {app.title}
                </Title>
                {app.tag ? (
                  <Tag className="applications-card-tag">{app.tag}</Tag>
                ) : null}
              </div>
              <Text type="secondary" className="applications-card-desc">
                {app.description}
              </Text>
              <Button
                type="primary"
                block
                className="applications-card-cta"
                onClick={() => navigate(app.path)}
              >
                进入
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="applications-footnote" bordered={false}>
        <Text type="secondary">
          更多端侧应用（如移动端
          App）上线后，将同步展示在此页面的「客户端下载」区域。
        </Text>
      </Card>
    </MarketingPageShell>
  );
}
