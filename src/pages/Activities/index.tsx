import { Typography } from 'antd';
import { ScrollAnimatedSection } from '@/animations';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import ActivitiesView from './ActivitiesView';
import './index.less';

const { Title, Paragraph } = Typography;

export default function Activities() {
  return (
    <MarketingPageShell
      pageClass="activities-page"
      defaultHeroClass="page-header"
      title={<Title level={1}>活动展示</Title>}
      lead={<Paragraph>了解我们最新的活动和展览</Paragraph>}
    >
      <ScrollAnimatedSection reveal className="marketing-section-block">
        <ActivitiesView />
      </ScrollAnimatedSection>
    </MarketingPageShell>
  );
}
