import { Typography } from 'antd';
import { AnimatedImage, ScrollAnimatedSection } from '@/animations';

const { Title, Paragraph } = Typography;

type Props = {
  heritageTitle: string;
  heritageDescription: string;
  heritageSrcs: [string, string, string];
};

export default function HomeHeritageSection({
  heritageTitle,
  heritageDescription,
  heritageSrcs,
}: Props) {
  return (
    <ScrollAnimatedSection
      className="heritage-section home-unified-flow-section"
      animationType="fadeIn"
      duration={1000}
      threshold={0.2}
    >
      <div className="heritage-content">
        <div className="heritage-text">
          <span className="section-kicker section-kicker--left">匠心传承</span>
          <Title level={2} className="heritage-title">
            {heritageTitle}
          </Title>
          <Paragraph className="heritage-description">
            {heritageDescription}
          </Paragraph>
        </div>
        <div className="heritage-images">
          {heritageSrcs.map((src, index) => (
            <div className="heritage-item" key={index}>
              <AnimatedImage src={src} alt="红木细节" />
            </div>
          ))}
        </div>
      </div>
    </ScrollAnimatedSection>
  );
}
