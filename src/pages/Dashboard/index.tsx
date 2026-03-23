import { Card, Row, Col, Button } from 'antd';
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import './index.less';

const Dashboard = () => {
  const handleExport = () => {
    console.log('导出数据');
  };

  const handleRefresh = () => {
    console.log('刷新数据');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="page-title">仪表盘</h1>
        <div className="header-actions">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
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
            导出数据
          </Button>
        </div>
      </div>
      <Row gutter={[16, 16]} className="dashboard-content">
        <Col span={24}>
          <Card className="dashboard-card">
            <h2>数据概览</h2>
            <div className="overview-content">
              <p>欢迎来到仪表盘，这里展示了系统的核心数据和功能。</p>
              <p>您可以在这里查看各种统计数据、监控系统状态、管理用户等。</p>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="dashboard-card">
            <h2>用户统计</h2>
            <div className="chart-placeholder">
              <p>用户增长趋势图</p>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className="dashboard-card">
            <h2>销售统计</h2>
            <div className="chart-placeholder">
              <p>销售额分布图</p>
            </div>
          </Card>
        </Col>
        <Col span={24}>
          <Card className="dashboard-card">
            <h2>近期订单</h2>
            <div className="table-placeholder">
              <p>订单列表</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
