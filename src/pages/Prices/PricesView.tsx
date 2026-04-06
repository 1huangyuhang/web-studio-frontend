import { Card, Row, Col, Typography, Tag, Divider, Alert, Empty } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import { CheckOutlined, StarFilled } from '@ant-design/icons';
import { handleImageError, handleImageLoad } from '@/utils/imageUtils';
import { mediaDisplaySrc, type PricingPlanDTO } from '@/types/dto';
import { usePricingPlansPage } from './usePricingPlansPage';
import { MarketingListSkeleton } from '@/components/page-shell/MarketingListSkeleton';

const { Title, Text, Paragraph } = Typography;

export default function PricesView() {
  const { plans, loading, error, loadPlans } = usePricingPlansPage();

  if (loading) {
    return (
      <MarketingListSkeleton items={6} colProps={{ xs: 24, sm: 12, lg: 8 }} />
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
              onClick={() => void loadPlans()}
            >
              重试
            </SiteButton>
          }
        />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Empty description="暂无价格方案" image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <SiteButton variant="primary" onClick={() => void loadPlans()}>
          重新加载
        </SiteButton>
      </Empty>
    );
  }

  return (
    <Row gutter={[24, 24]} className="pricing-grid">
      {plans.map((plan: PricingPlanDTO) => (
        <Col xs={24} sm={12} lg={8} key={plan.id}>
          <Card
            className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}
            bordered={false}
          >
            {(plan.tag?.trim() || plan.isPopular) && (
              <Tag className="popular-tag">{plan.tag?.trim() || '推荐'}</Tag>
            )}

            <div className="plan-image-wrapper">
              <img
                src={mediaDisplaySrc(plan)}
                alt={plan.name}
                className="plan-image"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>

            <div className="plan-info">
              <Title level={3} className="plan-name">
                {plan.name}
              </Title>
              <Paragraph className="plan-description">
                {plan.description}
              </Paragraph>

              <div className="plan-price">
                <Text className="price-value">¥{plan.price}</Text>
                <Text className="price-unit">/月</Text>
              </div>

              <Divider className="plan-divider" />

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <CheckOutlined className="feature-icon" />
                    <Text className="feature-text">{feature}</Text>
                  </div>
                ))}
              </div>

              <div className="plan-rating">
                {[...Array(5)].map((_, index) => (
                  <StarFilled
                    key={index}
                    className={`rating-star ${index < 5 ? 'filled' : ''}`}
                  />
                ))}
                <Text className="rating-text">5.0</Text>
              </div>

              <SiteButton
                variant={plan.isPopular ? 'primary' : 'outline'}
                className="select-plan-btn"
              >
                立即选择
              </SiteButton>
              <Text type="secondary" className="plan-footnote">
                可随时调整方案，具体以合约为准
              </Text>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
