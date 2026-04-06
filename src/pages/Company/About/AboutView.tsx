import { Card, Typography, Row, Col, Image } from 'antd';
import {
  GoldOutlined,
  ToolOutlined,
  SketchOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { redwoodImages } from '@/assets/images/redwood';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '@/utils/imageUtils';

const { Title, Paragraph } = Typography;

export default function AboutView() {
  return (
    <div className="about-section-stack section-stack section-stack--loose">
      <div className="about-section">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <div className="about-image-wrapper">
              <Image
                src={processImageUrl(redwoodImages.redwood1)}
                alt="公司简介"
                className="about-image"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="about-content">
              <Title level={2} className="section-title">
                公司简介
              </Title>
              <Paragraph className="about-text">
                我们是一家专业从事红木家具设计、生产和销售的企业，拥有多年的行业经验和丰富的专业知识。公司致力于将传统红木工艺与现代设计理念相结合，打造出既具有传统韵味又符合现代生活需求的高品质红木产品。
              </Paragraph>
              <Paragraph className="about-text">
                我们坚持选用优质的红木材料，采用传统的榫卯结构和精湛的雕刻工艺，确保每一件产品都具有卓越的品质和独特的艺术价值。同时，我们也注重环保理念，所有产品均符合国家环保标准，让客户使用更加放心。
              </Paragraph>
              <Paragraph className="about-text">
                公司拥有一支专业的设计团队和生产团队，能够根据客户的需求提供定制化服务，满足不同客户的个性化需求。我们的产品涵盖了家具、工艺品、装修材料等多个领域，广泛应用于家庭、酒店、办公场所等各种场景。
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>

      <div
        className="about-section-soft-break"
        role="separator"
        aria-hidden="true"
      />

      <div className="advantages-section">
        <Title level={2} className="section-title">
          核心优势
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="advantage-card">
              <div className="advantage-icon-wrapper">
                <GoldOutlined className="advantage-icon" aria-hidden />
              </div>
              <Title level={4} className="advantage-title">
                优质材料
              </Title>
              <Paragraph className="advantage-description">
                选用优质的红木材料，确保产品的品质和耐用性。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="advantage-card">
              <div className="advantage-icon-wrapper">
                <ToolOutlined className="advantage-icon" aria-hidden />
              </div>
              <Title level={4} className="advantage-title">
                精湛工艺
              </Title>
              <Paragraph className="advantage-description">
                采用传统的榫卯结构和精湛的雕刻工艺，确保产品的艺术性和实用性。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="advantage-card">
              <div className="advantage-icon-wrapper">
                <SketchOutlined className="advantage-icon" aria-hidden />
              </div>
              <Title level={4} className="advantage-title">
                专业设计
              </Title>
              <Paragraph className="advantage-description">
                专业的设计团队，能够根据客户需求提供定制化服务。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="advantage-card">
              <div className="advantage-icon-wrapper">
                <EnvironmentOutlined className="advantage-icon" aria-hidden />
              </div>
              <Title level={4} className="advantage-title">
                环保理念
              </Title>
              <Paragraph className="advantage-description">
                所有产品均符合国家环保标准，让客户使用更加放心。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="advantage-card">
              <div className="advantage-icon-wrapper">
                <CustomerServiceOutlined
                  className="advantage-icon"
                  aria-hidden
                />
              </div>
              <Title level={4} className="advantage-title">
                完善服务
              </Title>
              <Paragraph className="advantage-description">
                提供从设计、生产到安装的一站式服务，确保客户满意度。
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="advantage-card">
              <div className="advantage-icon-wrapper">
                <SafetyCertificateOutlined
                  className="advantage-icon"
                  aria-hidden
                />
              </div>
              <Title level={4} className="advantage-title">
                品牌信誉
              </Title>
              <Paragraph className="advantage-description">
                多年的行业经验和良好的品牌信誉，值得客户信赖。
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      <div
        className="about-section-soft-break"
        role="separator"
        aria-hidden="true"
      />

      <div className="history-section">
        <Title level={2} className="section-title">
          发展历程
        </Title>
        <div className="history-timeline">
          <div className="history-item">
            <div className="history-year">2018</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                公司成立
              </Title>
              <Paragraph className="history-description">
                公司正式成立，专注于红木家具的设计和生产。
              </Paragraph>
            </div>
          </div>
          <div className="history-item">
            <div className="history-year">2019</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                扩大生产规模
              </Title>
              <Paragraph className="history-description">
                扩大生产规模，引进先进的生产设备和技术。
              </Paragraph>
            </div>
          </div>
          <div className="history-item">
            <div className="history-year">2020</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                产品升级
              </Title>
              <Paragraph className="history-description">
                推出全新系列产品，受到市场广泛好评。
              </Paragraph>
            </div>
          </div>
          <div className="history-item">
            <div className="history-year">2021</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                品牌建设
              </Title>
              <Paragraph className="history-description">
                加强品牌建设，提高品牌知名度和影响力。
              </Paragraph>
            </div>
          </div>
          <div className="history-item">
            <div className="history-year">2022</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                拓展市场
              </Title>
              <Paragraph className="history-description">
                拓展国内外市场，建立广泛的销售网络。
              </Paragraph>
            </div>
          </div>
          <div className="history-item">
            <div className="history-year">2023</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                技术创新
              </Title>
              <Paragraph className="history-description">
                加大技术创新力度，推出更多具有创新性的产品。
              </Paragraph>
            </div>
          </div>
          <div className="history-item">
            <div className="history-year">2024</div>
            <div className="history-content">
              <Title level={4} className="history-title">
                持续发展
              </Title>
              <Paragraph className="history-description">
                持续发展，不断提升产品品质和服务水平。
              </Paragraph>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
