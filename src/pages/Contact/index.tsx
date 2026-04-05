import { Typography, Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import ContactView from './ContactView';
import './index.less';

const { Title, Paragraph } = Typography;

export default function Contact() {
  return (
    <MarketingPageShell
      pageClass="contact-page"
      wide
      defaultHeroClass="page-header"
      title={
        <>
          <Tag
            icon={<TeamOutlined />}
            color="volcano"
            className="contact-page__hero-tag"
          >
            商务与合作
          </Tag>
          <Title level={1}>联系我们</Title>
        </>
      }
      lead={
        <Paragraph type="secondary" className="contact-page__hero-lead">
          售前咨询、合作洽谈或一般问询均可通过下方表单留言，我们会在
          <strong> 1–2 个工作日内 </strong>
          回复您。
        </Paragraph>
      }
    >
      <ContactView />
    </MarketingPageShell>
  );
}
