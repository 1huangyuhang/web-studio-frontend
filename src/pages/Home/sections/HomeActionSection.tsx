import { Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';

const { Title, Paragraph } = Typography;

type Props = { ctaTitle: string; ctaDescription: string };

export default function HomeActionSection({ ctaTitle, ctaDescription }: Props) {
  const navigate = useNavigate();

  return (
    <div className="action-section-container home-unified-flow-section">
      <div className="action-content">
        <span className="section-kicker">下一步</span>
        <Title level={3} className="action-title">
          {ctaTitle}
        </Title>
        <Paragraph className="action-description">{ctaDescription}</Paragraph>
        <Space size="middle" wrap className="action-actions" align="center">
          <SiteButton
            variant="primary"
            className="action-button"
            onClick={() => navigate('/contact')}
          >
            立即咨询
          </SiteButton>
          <Button
            size="large"
            className="action-button-secondary"
            onClick={() => navigate('/shop')}
          >
            浏览产品
          </Button>
        </Space>
      </div>
    </div>
  );
}
