import { Typography, Tag } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import HelpView from './HelpView';
import './index.less';

const { Title, Paragraph } = Typography;

export default function Help() {
  return (
    <MarketingPageShell
      pageClass="help-page"
      wide
      defaultHeroClass="page-header"
      title={
        <>
          <Tag
            icon={<CustomerServiceOutlined />}
            color="volcano"
            className="help-page__hero-tag"
          >
            帮助与支持
          </Tag>
          <Title level={1}>提交工单</Title>
        </>
      }
      lead={
        <Paragraph type="secondary" className="help-page__hero-lead">
          请尽量写清复现步骤与期望结果，便于我们快速定位。工作日
          <strong> 1–2 个工作日内 </strong>
          会有同事通过邮件或电话与您联系。
        </Paragraph>
      }
    >
      <HelpView />
    </MarketingPageShell>
  );
}
