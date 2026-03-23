import { Card, Form, Input, Button, Typography, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import './index.less';

const { Title } = Typography;
const { TextArea } = Input;

const Help = () => {
  const [form] = Form.useForm();

  // 处理文件上传前的验证
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // 限制文件大小为5MB
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('文件大小不能超过5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // 处理文件变化
  const handleFileChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  };

  // 处理表单提交
  const handleSubmit = (values: any) => {
    console.log('工单提交:', values);
    // 这里可以添加实际的提交逻辑
    form.resetFields();
  };

  return (
    <div className="help-page">
      {/* 页面标题 */}
      <div className="page-title">
        <Title level={1}>提交工单</Title>
      </div>

      <Card className="ticket-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="fullName"
            label="姓名"
            rules={[{ required: true, message: '请输入您的姓名' }]}
          >
            <Input placeholder="请输入您的姓名" />
          </Form.Item>

          <Form.Item name="phoneNumber" label="电话号码">
            <Input placeholder="+86 13800138000" />
          </Form.Item>

          <Form.Item
            name="emailAddress"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入您的邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入您的邮箱地址" />
          </Form.Item>

          <Form.Item name="companyName" label="公司名称">
            <Input placeholder="请输入您的公司名称" />
          </Form.Item>

          <Form.Item
            name="messageSubject"
            label="主题"
            rules={[{ required: true, message: '请输入主题' }]}
          >
            <Input placeholder="请输入您的问题主题" />
          </Form.Item>

          <Form.Item
            name="askYourQuestion"
            label="您的问题"
            rules={[{ required: true, message: '请输入您的问题' }]}
          >
            <TextArea placeholder="请详细描述您的问题" rows={6} />
          </Form.Item>

          <Form.Item name="attachment" label="附件 (optional)">
            <Upload
              name="file"
              action="/api/upload"
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              showUploadList={false}
              maxCount={1}
              style={{
                display: 'block',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 11px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s',
                }}
              >
                <UploadOutlined style={{ marginRight: '8px' }} />
                <span>选择文件</span>
                <span style={{ marginLeft: '8px', color: '#8c8c8c' }}>
                  未选择任何文件
                </span>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-btn">
              提交工单
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Help;
