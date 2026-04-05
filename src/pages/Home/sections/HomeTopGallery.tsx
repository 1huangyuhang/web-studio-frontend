import { Row, Col, Typography } from 'antd';
import { AnimatedImage, ScrollAnimatedSection } from '@/animations';
import HoverText from '@/components/ui/HoverText';

const { Title, Paragraph } = Typography;

type Props = {
  topGallerySrcs: [string, string, string];
  galleryTitle: string;
  galleryDescription: string;
};

export default function HomeTopGallery({
  topGallerySrcs,
  galleryTitle,
  galleryDescription,
}: Props) {
  return (
    <ScrollAnimatedSection
      className="top-gallery-section"
      animationType="fadeIn"
      duration={1000}
      threshold={0.2}
    >
      <div className="gallery-text ly-container">
        <span className="section-kicker">品牌叙事</span>
        <Title level={2} className="gallery-title">
          <HoverText text={galleryTitle} />
        </Title>
        <Paragraph className="gallery-description">
          {galleryDescription}
        </Paragraph>
      </div>

      <Row gutter={[0, 0]} className="gallery-grid ly-container">
        <Col xs={24} md={12}>
          <div className="gallery-item large">
            <AnimatedImage src={topGallerySrcs[0]} alt="红木原材料" />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="gallery-item">
            <AnimatedImage src={topGallerySrcs[1]} alt="红木细节" />
          </div>
          <div className="gallery-item">
            <AnimatedImage src={topGallerySrcs[2]} alt="红木工厂" />
          </div>
        </Col>
      </Row>
    </ScrollAnimatedSection>
  );
}
