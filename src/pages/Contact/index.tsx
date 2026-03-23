import { Card, Row, Col, Form, Input, Button, Typography, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import './index.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Contact = () => {
  const [form] = Form.useForm();

  // 处理表单提交
  const handleSubmit = (values: any) => {
    console.log('表单提交:', values);
    // 这里可以添加实际的提交逻辑
    form.resetFields();
  };

  return (
    <div className="contact-page">
      {/* 页面标题 */}
      <div className="page-title">
        <Title level={1}>联系我们</Title>
        <Text>
          如有任何关于我们公司或服务的疑问，欢迎联络我们。我们会尽快回复您。
        </Text>
      </div>

      <Row gutter={[32, 32]}>
        {/* 联系表单 */}
        <Col xs={24} md={12}>
          <Card className="contact-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="名称"
                    rules={[{ required: true, message: '请输入您的名称' }]}
                  >
                    <Input placeholder="请输入您的名称" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="电话号码"
                    rules={[{ required: true, message: '请输入您的电话号码' }]}
                  >
                    <Input placeholder="请输入您的电话号码" />
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
                    <Input placeholder="请输入您的电子邮件" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="company" label="公司">
                    <Input placeholder="请输入您的公司名称" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="subject" label="主旨">
                <Input placeholder="请输入您的主旨" />
              </Form.Item>

              <Form.Item
                name="message"
                label="问题描述"
                rules={[{ required: true, message: '请输入您的问题描述' }]}
              >
                <TextArea placeholder="请详细描述您的问题" rows={6} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="submit-btn">
                  提交
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 公司信息 */}
        <Col xs={24} md={12}>
          <Card className="company-info-card">
            <Title level={2}>我的公司</Title>

            <Divider className="info-divider" />

            <div className="info-item">
              <EnvironmentOutlined className="info-icon" />
              <Text style={{ whiteSpace: 'nowrap' }}>
                张家港市金港镇江海路张家港名贵木材交易中心C库11、13号
              </Text>
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
};

export default Contact;
