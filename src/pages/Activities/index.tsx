import { Row, Col, Typography, Card, Button, Spin, Alert, Modal } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import './index.less';
import axiosInstance from '../../services/api/axiosInstance';
import { Activity } from '../../types/activity';
import EventCalendar from '../../components/EventCalendar';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '../../utils/imageUtils';

const { Title, Paragraph } = Typography;

const Activities = () => {
  // 活动数据状态
  const [activities, setActivities] = useState<Activity[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 错误状态
  const [error, setError] = useState<string | null>(null);
  // 选中的活动
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  // 活动详情模态框显示状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 关闭模态框
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedActivity(null);
  };

  // 从API获取活动数据
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // 后端返回的数据格式是 { data: [...], pagination: {...} }
        const response = (await axiosInstance.get('/activities')) as any;
        // 需要从response.data中获取实际的活动数组
        const data = response.data || [];
        const formattedActivities: Activity[] = data.map(
          (activity: Activity) => ({
            ...activity,
            date: activity.date || '2025-12-20', // 默认日期
          })
        );
        setActivities(formattedActivities);
        setError(null);
      } catch (err) {
        setError('获取活动数据失败，请稍后重试');
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // 处理活动点击
  const handleActivityClick = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalVisible(true);
  }, []);

  return (
    <div className="activities-page">
      {/* 页面标题 */}
      <div className="page-header">
        <Title level={2}>活动展示</Title>
        <Paragraph>了解我们最新的活动和展览</Paragraph>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : error ? (
        <div className="error-container">
          <Alert message="错误" description={error} type="error" showIcon />
        </div>
      ) : (
        <>
          {/* 活动列表 */}
          {activities.length > 0 ? (
            <Row gutter={[24, 24]} className="activities-grid">
              {activities.map((activity) => (
                <Col xs={24} sm={12} md={8} key={activity.id}>
                  <Card hoverable className="activity-card">
                    <div className="activity-image-wrapper">
                      <img
                        src={processImageUrl(activity.image)}
                        alt={activity.title}
                        className="activity-image"
                        loading="lazy"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    </div>
                    <div className="activity-info">
                      <Title level={4} className="activity-title">
                        {activity.title}
                      </Title>
                      <Paragraph className="activity-description">
                        {activity.description}
                      </Paragraph>
                      <Button type="primary" className="activity-button">
                        了解详情
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state" aria-live="polite">
              <Alert
                message="暂无活动"
                description="目前没有可用的活动信息，敬请期待"
                type="info"
                showIcon
              />
            </div>
          )}

          {/* 活动统计 */}
          <div className="stats-section">
            <Title level={3}>活动统计</Title>
            <Row gutter={[32, 32]} className="stats-grid">
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">年度活动</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <div className="stat-number">5000+</div>
                  <div className="stat-label">参与人数</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <div className="stat-number">85%</div>
                  <div className="stat-label">满意度</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="stat-item">
                  <div className="stat-number">20+</div>
                  <div className="stat-label">合作机构</div>
                </div>
              </Col>
            </Row>
          </div>

          {/* 活动日历 */}
          <div className="calendar-section">
            <Title level={3}>活动日历</Title>
            <div className="calendar-container">
              <EventCalendar
                activities={activities}
                onActivityClick={handleActivityClick}
              />
            </div>
          </div>

          {/* 活动详情模态框 */}
          <Modal
            title={selectedActivity?.title || '活动详情'}
            open={isModalVisible}
            onCancel={handleModalClose}
            footer={[
              <Button key="close" onClick={handleModalClose}>
                关闭
              </Button>,
              <Button key="detail" type="primary" onClick={handleModalClose}>
                查看详情
              </Button>,
            ]}
          >
            {selectedActivity && (
              <div className="activity-detail">
                <div className="activity-detail-image">
                  <img
                    src={processImageUrl(selectedActivity.image)}
                    alt={selectedActivity.title}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
                <div className="activity-detail-content">
                  <p className="activity-detail-date">
                    日期：{selectedActivity.date}
                  </p>
                  <p className="activity-detail-description">
                    {selectedActivity.description}
                  </p>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default Activities;
