import { Card, Row, Col, Typography, Tag, Divider } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import { CheckOutlined, StarFilled } from '@ant-design/icons';
import { useState } from 'react';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '@/utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

interface PricingPlan {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular: boolean;
  image: string;
  tag?: string;
}

export default function PricesView() {
  const [pricingPlans] = useState<PricingPlan[]>([
    {
      id: 1,
      name: '基础会员',
      price: 99,
      description: '适合红木爱好者和初学者',
      features: [
        '访问基础课程库',
        '每月1次专家在线咨询',
        '红木知识资料下载',
        '会员专属优惠',
        '社区交流权限',
        '每周工艺更新',
      ],
      isPopular: false,
      image: 'https://picsum.photos/seed/基础会员/500/300',
    },
    {
      id: 2,
      name: '高级会员',
      price: 199,
      description: '适合红木从业者和收藏者',
      features: [
        '访问全部课程',
        '每月4次专家在线咨询',
        '优先参与线下活动',
        '享受专属折扣',
        '定制化学习计划',
        '一对一指导机会',
        '行业报告访问',
        '专属客服支持',
      ],
      isPopular: true,
      tag: '推荐',
      image: 'https://picsum.photos/seed/高级会员/500/300',
    },
    {
      id: 3,
      name: '企业会员',
      price: 999,
      description: '适合红木企业和机构',
      features: [
        '团队无限访问',
        '定制化企业培训',
        '专家上门指导',
        '品牌合作机会',
        '行业资源对接',
        '市场推广支持',
        '专属定制服务',
        '7x24小时技术支持',
      ],
      isPopular: false,
      image: 'https://picsum.photos/seed/企业会员/500/300',
    },
  ]);

  return (
    <Row gutter={[24, 24]} className="pricing-grid">
      {pricingPlans.map((plan) => (
        <Col xs={24} sm={12} lg={8} key={plan.id}>
          <Card
            className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}
            bordered={false}
          >
            {plan.tag && <Tag className="popular-tag">{plan.tag}</Tag>}

            <div className="plan-image-wrapper">
              <img
                src={processImageUrl(plan.image)}
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
