import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import axiosInstance from '@/services/api/axiosInstance';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ContactView() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    phone: string;
    email: string;
    company?: string;
    subject?: string;
    message: string;
  }) => {
    setSubmitting(true);
    try {
      await axiosInstance.post('/contact-messages', {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        company: values.company?.trim() || null,
        subject: values.subject?.trim() || null,
        message: values.message.trim(),
      });
      message.success('留言已提交，我们会尽快与您联系。');
      form.resetFields();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '提交失败，请稍后重试';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page__body">
      <Row gutter={[24, 24]} className="contact-page__grid">
        <Col xs={24} md={12}>
          <Card className="contact-form-card" bordered={false}>
            <Title level={4} className="contact-form-card__title">
              在线留言
            </Title>
            <Text type="secondary" className="contact-form-card__subtitle">
              请填写真实联系方式，便于我们与您确认细节。
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={(v) => void handleSubmit(v)}
              requiredMark="optional"
              className="contact-form"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="名称"
                    rules={[{ required: true, message: '请输入您的名称' }]}
                  >
                    <Input placeholder="请输入您的名称" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="电话号码"
                    rules={[{ required: true, message: '请输入您的电话号码' }]}
                  >
                    <Input placeholder="请输入您的电话号码" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="电子邮件"
                    rules={[
                      { required: true, message: '请输入您的电子邮件' },
                      { type: 'email', message: '请输入有效的电子邮件地址' },
                    ]}
                  >
                    <Input placeholder="name@example.com" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="company" label="公司">
                    <Input placeholder="选填" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="subject" label="主旨">
                <Input placeholder="简要说明来意" size="large" />
              </Form.Item>

              <Form.Item
                name="message"
                label="问题描述"
                rules={[{ required: true, message: '请输入您的问题描述' }]}
              >
                <TextArea placeholder="请详细描述您的问题" rows={6} />
              </Form.Item>

              <Form.Item>
                <SiteButton
                  variant="primary"
                  type="submit"
                  className="submit-btn"
                  loading={submitting}
                >
                  提交
                </SiteButton>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="company-info-card" bordered={false}>
            <Title level={4} className="company-info-card__title">
              联系方式
            </Title>
            <Text type="secondary" className="company-info-card__subtitle">
              林之源 · 红木产业服务
            </Text>

            <Divider className="info-divider" />

            <div className="info-item">
              <EnvironmentOutlined className="info-icon" />
              <Text>张家港市金港镇江海路张家港名贵木材交易中心C库11、13号</Text>
            </div>

            <div className="info-item">
              <PhoneOutlined className="info-icon" />
              <Text>+86 13910417182</Text>
            </div>

            <div className="info-item">
              <MailOutlined className="info-icon" />
              <Text>1265345823@qq.com</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
