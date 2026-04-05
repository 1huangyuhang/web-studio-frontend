import { Button, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ScrollyVideo } from '@/animations';
import './HomeScrollyVideo.less';

const { Title, Paragraph } = Typography;

const DEFAULT_HERO_VIDEO = 'https://scrollyvideo.js.org/goldengate.mp4';

type Props = {
  src?: string;
};

export default function HomeScrollyVideo({ src = DEFAULT_HERO_VIDEO }: Props) {
  const navigate = useNavigate();

  return (
    <section className="home-hero-scrolly" aria-label="首页主视觉">
      <ScrollyVideo
        className="home-hero-scrolly__video"
        src={src}
        id="redwood-video"
        height="clamp(420px, 88dvh, 920px)"
      >
        <div className="home-hero-scrolly__content">
          <span className="home-hero-scrolly__eyebrow">林之源 · 红木美学</span>
          <Title level={1} className="home-hero-scrolly__title">
            传承工艺，筑就恒久之美
          </Title>
          <Paragraph className="home-hero-scrolly__lead">
            甄选良材与匠心雕琢，为居所呈现温润、克制的东方气质。向下滚动，探索品牌与作品系列。
          </Paragraph>
          <Space size="middle" className="home-hero-scrolly__actions" wrap>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/shop')}
            >
              浏览产品
            </Button>
            <Button
              size="large"
              ghost
              className="home-hero-scrolly__btn-ghost"
              onClick={() => navigate('/contact')}
            >
              联系顾问
            </Button>
          </Space>
          <div className="home-hero-scrolly__scroll-hint">
            向下滚动 · 浏览更多
          </div>
        </div>
      </ScrollyVideo>
    </section>
  );
}
