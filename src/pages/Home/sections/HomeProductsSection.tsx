import { Row, Col, Typography, Button } from 'antd';
import { AnimatedImage, ScrollAnimatedSection } from '@/animations';

const { Title } = Typography;

export type HomeProductCategory = { id: number; name: string; image: string };

type Props = { productCategories: HomeProductCategory[] };

export default function HomeProductsSection({ productCategories }: Props) {
  return (
    <ScrollAnimatedSection
      className="products-section home-unified-flow-section"
      animationType="slideUp"
      duration={1000}
      threshold={0.2}
    >
      <div className="section-header">
        <span className="section-kicker">产品与服务</span>
        <Title level={2} className="section-title">
          产品系列
        </Title>
        <Button type="link" className="section-more">
          查看更多
        </Button>
      </div>

      <Row gutter={[0, 0]} className="products-grid">
        {productCategories.map((category) => (
          <Col xs={24} sm={12} md={12} lg={6} key={category.id}>
            <div className="product-item animate-card">
              <div className="product-image-wrapper">
                <AnimatedImage src={category.image} alt={category.name} />
              </div>
              <div className="product-info">
                <h3 className="product-title">{category.name}</h3>
                <Button type="link" className="product-more">
                  了解详情
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </ScrollAnimatedSection>
  );
}
