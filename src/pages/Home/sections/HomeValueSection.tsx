import { Typography } from 'antd';
import { AnimatedImage, ScrollAnimatedSection } from '@/animations';
import './HomeValueSection.less';

const { Title, Paragraph } = Typography;

type Props = {
  valueTitle: string;
  valueDescription: string;
  valueImageSrc: string;
  /** 左上角毛玻璃标签文案，可对接 CMS；默认红木主题短标签 */
  valueEyebrow?: string;
};

export default function HomeValueSection({
  valueTitle,
  valueDescription,
  valueImageSrc,
  valueEyebrow = '红木 · 匠心',
}: Props) {
  return (
    <ScrollAnimatedSection
      className="value-proposition-section home-unified-flow-section"
      animationType="fadeIn"
      duration={1000}
      threshold={0.2}
    >
      <div className="value-proposition-section__ambient" aria-hidden />
      <div className="value-content">
        <div className="value-unified-panel">
          <div className="value-text">
            {valueEyebrow ? (
              <div className="value-eyebrow">{valueEyebrow}</div>
            ) : null}
            <Title level={2} className="value-title">
              {valueTitle}
            </Title>
            <Paragraph className="value-description">
              {valueDescription}
            </Paragraph>
          </div>
          <div className="value-unified-split" aria-hidden />
          <div className="value-media">
            <div className="value-image">
              <AnimatedImage src={valueImageSrc} alt="红木风景" />
            </div>
          </div>
        </div>
      </div>
    </ScrollAnimatedSection>
  );
}
