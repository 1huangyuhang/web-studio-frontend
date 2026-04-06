import { Row, Col, Typography, Card, Button, Alert, Modal, Empty } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import EventCalendar from '@/components/EventCalendar';
import { handleImageError, handleImageLoad } from '@/utils/imageUtils';
import { mediaDisplaySrc } from '@/types/dto';
import { useActivitiesPage } from './useActivitiesPage';
import { MarketingListSkeleton } from '@/components/page-shell/MarketingListSkeleton';

const { Title, Paragraph } = Typography;

export default function ActivitiesView() {
  const {
    activities,
    loading,
    error,
    loadActivities,
    selectedActivity,
    isModalVisible,
    handleModalClose,
    handleActivityClick,
  } = useActivitiesPage();

  if (loading) {
    return (
      <MarketingListSkeleton items={6} colProps={{ xs: 24, sm: 12, md: 8 }} />
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert
          message="暂时无法加载"
          description={error}
          type="error"
          showIcon
          action={
            <SiteButton
              size="sm"
              variant="primary"
              onClick={() => void loadActivities()}
            >
              重试
            </SiteButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      {activities.length > 0 ? (
        <Row gutter={[24, 24]} className="activities-grid">
          {activities.map((activity) => (
            <Col xs={24} sm={12} md={8} key={activity.id}>
              <Card hoverable className="activity-card">
                <div className="activity-image-wrapper">
                  <img
                    src={mediaDisplaySrc(activity)}
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
                  <Paragraph
                    className="activity-description"
                    ellipsis={{ rows: 3 }}
                  >
                    {activity.description}
                  </Paragraph>
                  <SiteButton
                    variant="primary"
                    className="activity-button"
                    onClick={() => handleActivityClick(activity)}
                  >
                    了解详情
                  </SiteButton>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="empty-state" aria-live="polite">
          <Empty
            description="目前没有可用的活动信息，敬请期待"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

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

      <div className="calendar-section">
        <div className="calendar-section__intro">
          <span className="calendar-section__kicker">排期一览</span>
          <Title level={3}>活动日历</Title>
          <Paragraph type="secondary" className="calendar-section__lede">
            按月份浏览展会与文化活动；悬停卡片可预览简介，点击打开详情。
          </Paragraph>
        </div>
        <div className="calendar-container">
          <EventCalendar
            activities={activities}
            onActivityClick={handleActivityClick}
          />
        </div>
      </div>

      <Modal
        title={selectedActivity?.title || '活动详情'}
        open={isModalVisible}
        onCancel={handleModalClose}
        width="min(560px, 92vw)"
        styles={{
          body: { maxHeight: 'min(72vh, 560px)', overflowY: 'auto' },
        }}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            关闭
          </Button>,
          <SiteButton key="detail" variant="primary" onClick={handleModalClose}>
            确定
          </SiteButton>,
        ]}
      >
        {selectedActivity && (
          <div className="activity-detail">
            <div className="activity-detail-image">
              <img
                src={mediaDisplaySrc(selectedActivity)}
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
  );
}
