import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import {
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axiosInstance from '@/services/api/axiosInstance';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function HelpView() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('文件大小不能超过5MB!');
      return Upload.LIST_IGNORE;
    }
    setAttachmentFile(file);
    setAttachmentName(file.name);
    return false;
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName('');
  };

  const handleSubmit = async (values: {
    fullName: string;
    phoneNumber?: string;
    emailAddress: string;
    companyName?: string;
    messageSubject: string;
    askYourQuestion: string;
  }) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', values.fullName.trim());
      if (values.phoneNumber?.trim()) {
        fd.append('phoneNumber', values.phoneNumber.trim());
      }
      fd.append('emailAddress', values.emailAddress.trim());
      if (values.companyName?.trim()) {
        fd.append('companyName', values.companyName.trim());
      }
      fd.append('messageSubject', values.messageSubject.trim());
      fd.append('askYourQuestion', values.askYourQuestion.trim());
      if (attachmentFile) {
        fd.append('attachment', attachmentFile);
      }

      const data = (await axiosInstance.post('/support-tickets', fd)) as {
        message?: string;
      };
      message.success(
        data?.message || '工单已提交，我们将在工作日内与您联系。'
      );
      form.resetFields();
      handleRemoveAttachment();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '提交失败，请稍后重试';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row gutter={[24, 24]} className="help-page__grid">
      <Col xs={24} lg={15}>
        <Card className="ticket-form-card" bordered={false}>
          <Title level={4} className="ticket-form-card__title">
            工单信息
          </Title>
          <Paragraph type="secondary" className="ticket-form-card__subtitle">
            标 * 为建议填写项，便于我们回访。
          </Paragraph>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => void handleSubmit(v)}
            requiredMark="optional"
            className="ticket-form"
          >
            <Form.Item
              name="fullName"
              label="姓名"
              rules={[{ required: true, message: '请输入您的姓名' }]}
            >
              <Input placeholder="请输入您的姓名" size="large" />
            </Form.Item>

            <Form.Item name="phoneNumber" label="电话号码">
              <Input placeholder="+86 13800138000" size="large" />
            </Form.Item>

            <Form.Item
              name="emailAddress"
              label="邮箱地址"
              rules={[
                { required: true, message: '请输入您的邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="name@example.com" size="large" />
            </Form.Item>

            <Form.Item name="companyName" label="公司名称">
              <Input placeholder="选填" size="large" />
            </Form.Item>

            <Form.Item
              name="messageSubject"
              label="主题"
              rules={[{ required: true, message: '请输入主题' }]}
            >
              <Input placeholder="简要概括问题" size="large" />
            </Form.Item>

            <Form.Item
              name="askYourQuestion"
              label="您的问题"
              rules={[{ required: true, message: '请输入您的问题' }]}
            >
              <TextArea
                placeholder="环境、操作步骤、报错信息等越具体越好"
                rows={6}
              />
            </Form.Item>

            <Form.Item label="附件（可选）">
              <div className="ticket-upload-row">
                <Upload
                  beforeUpload={beforeUpload}
                  onRemove={handleRemoveAttachment}
                  maxCount={1}
                  fileList={
                    attachmentFile
                      ? [
                          {
                            uid: '-1',
                            name: attachmentName,
                            status: 'done',
                          },
                        ]
                      : []
                  }
                >
                  <Button icon={<UploadOutlined />} size="large">
                    选择文件
                  </Button>
                </Upload>
                {!attachmentFile ? (
                  <Text type="secondary" className="ticket-upload-hint">
                    支持常见格式，单文件不超过 5MB
                  </Text>
                ) : null}
              </div>
            </Form.Item>

            <Form.Item>
              <SiteButton
                variant="primary"
                type="submit"
                className="submit-btn"
                loading={submitting}
              >
                提交工单
              </SiteButton>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card className="help-aside-card" bordered={false}>
          <Title level={4} className="help-aside-card__title">
            提交前看一看
          </Title>
          <ul className="help-aside-list">
            <li>
              <CheckCircleOutlined
                className="help-aside-list__icon"
                aria-hidden
              />
              <span>留下有效邮箱，便于接收处理进度与补充问题。</span>
            </li>
            <li>
              <ClockCircleOutlined
                className="help-aside-list__icon"
                aria-hidden
              />
              <span>复杂问题可附截图或日志，能显著缩短沟通轮次。</span>
            </li>
            <li>
              <SafetyCertificateOutlined
                className="help-aside-list__icon"
                aria-hidden
              />
              <span>您提交的内容仅用于技术支持，我们按隐私要求处理。</span>
            </li>
          </ul>
        </Card>
      </Col>
    </Row>
  );
}
