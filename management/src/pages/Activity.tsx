import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import './index.less';

// 活动类型定义
interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const ActivityManagement: React.FC = () => {
  // 状态管理
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 获取活动数据
  const fetchActivities = async () => {
    try {
      const response = await axiosInstance.get('/activities', {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });
      // 由于axios拦截器已经返回了response.data，直接使用response
      // 检查response是否为数组，确保数据格式正确
      if (Array.isArray(response)) {
        setActivities(response);
        setTotal(response.length);
      } else {
        // 如果返回的是分页格式 { data: [...], pagination: {...} }，则使用response.data
        setActivities(response?.data || []);
        setTotal(response?.data?.length || 0);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      message.error(
        `获取活动列表失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // 初始加载数据和WebSocket事件监听
  useEffect(() => {
    fetchActivities();

    // 添加WebSocket事件监听器
    const handleActivityCreated = (activity: Activity) => {
      setActivities((prev) => [...prev, activity]);
      message.success(`新活动 "${activity.title}" 已添加`);
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/activities{}');
    };

    const handleActivityUpdated = (updatedActivity: Activity) => {
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      message.success(`活动 "${updatedActivity.title}" 已更新`);
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/activities{}');
    };

    const handleActivityDeleted = (activityId: number) => {
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== activityId)
      );
      message.success('活动已删除');
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/activities{}');
    };

    // 注册事件监听器
    wsService.on('activity:created', handleActivityCreated);
    wsService.on('activity:updated', handleActivityUpdated);
    wsService.on('activity:deleted', handleActivityDeleted);

    // 组件卸载时移除事件监听器
    return () => {
      wsService.off('activity:created', handleActivityCreated);
      wsService.off('activity:updated', handleActivityUpdated);
      wsService.off('activity:deleted', handleActivityDeleted);
    };
  }, []);

  // 页码变化时重新获取数据
  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  // 打开创建/编辑模态框
  const showModal = (activity?: Activity) => {
    if (activity) {
      setIsEditing(true);
      setCurrentActivity(activity);
      form.setFieldsValue(activity);
    } else {
      setIsEditing(false);
      setCurrentActivity(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 创建FormData对象，用于文件上传
      const formData = new FormData();

      // 添加非文件字段到FormData
      formData.append('title', values.title);
      formData.append('description', values.description);

      // 如果image是base64字符串，转换为Blob并添加到FormData
      if (
        values.image &&
        typeof values.image === 'string' &&
        values.image.startsWith('data:')
      ) {
        // 从base64字符串创建Blob对象
        const base64ToBlob = (base64: string) => {
          const parts = base64.split(';base64,');
          const contentType = parts[0].split(':')[1];
          const raw = window.atob(parts[1]);
          const rawLength = raw.length;
          const uInt8Array = new Uint8Array(rawLength);

          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }

          return new Blob([uInt8Array], { type: contentType });
        };

        const blob = base64ToBlob(values.image);
        formData.append('image', blob, 'activity-image.jpg');
      }

      if (isEditing && currentActivity) {
        // 乐观更新：立即更新本地UI
        const updatedActivity = {
          ...currentActivity,
          ...values,
        };

        // 更新本地状态
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === currentActivity.id ? updatedActivity : activity
          )
        );

        // 更新活动，使用FormData
        await axiosInstance.put(`/activities/${currentActivity.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('活动更新成功');
        // 清除活动列表缓存
        apiCache.delete('get:/activities{}');
      } else {
        // 乐观更新：立即更新本地UI
        // 生成临时ID，后续会被实际ID替换
        const tempActivity = {
          id: Date.now(), // 临时ID
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 更新本地状态
        setActivities((prev) => [...prev, tempActivity]);

        // 创建活动，使用FormData
        await axiosInstance.post('/activities', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('活动创建成功');
        // 清除活动列表缓存
        apiCache.delete('get:/activities{}');
      }

      // WebSocket会自动更新数据，不需要重新获取列表
      setIsModalVisible(false);
      setLoading(false);
    } catch (error: any) {
      console.error('操作失败:', error);
      // 显示更详细的错误信息
      const errorMessage =
        error.response?.data?.error || error.message || '操作失败';
      message.error(errorMessage);
      setLoading(false);
    }
  };

  // 删除活动
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确定要删除这个活动吗？',
      onOk: async () => {
        try {
          // 乐观更新：立即从本地状态中删除
          setActivities((prev) =>
            prev.filter((activity) => activity.id !== id)
          );

          // 删除活动
          await axiosInstance.delete(`/activities/${id}`);
          message.success('活动删除成功');
          // 清除活动列表缓存
          apiCache.delete('get:/activities{}');
          // WebSocket会自动更新数据，不需要重新获取列表
        } catch (error: any) {
          console.error('删除活动失败:', error);
          message.error(error.response?.data?.error || '删除活动失败');
          // 错误回滚：恢复删除的活动
          fetchActivities(); // 重新获取活动列表，确保数据一致性
        }
      },
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '活动图片',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (text: string) => {
        if (!text) return null;
        // 如果是base64字符串，直接显示；否则，使用URL
        const imageUrl = text.startsWith('data:')
          ? text
          : `data:image/jpeg;base64,${text}`;
        return (
          <img
            src={imageUrl}
            alt="活动图片"
            style={{
              width: 80,
              height: 60,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Activity) => (
        <div className="action-buttons">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            className="edit-button"
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            className="delete-button"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>活动管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增活动
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          bordered
          pagination={false}
          loading={loading}
        />
      </div>

      {/* 固定分页控件 */}
      <EnhancedPagination
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
      />

      {/* 活动表单模态框 */}
      <Modal
        title={isEditing ? '编辑活动' : '新增活动'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
          >
            <Input placeholder="请输入活动标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>

          <Form.Item
            name="image"
            label="活动图片"
            rules={[{ required: true, message: '请上传活动图片' }]}
          >
            <Upload
              listType="picture"
              action="#"
              beforeUpload={(file) => {
                // 检查文件类型
                const isJpgOrPng =
                  file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                  message.error('只能上传JPG/PNG格式的图片');
                  return Upload.LIST_IGNORE;
                }
                // 阻止默认的上传行为，使用自定义的图片处理逻辑
                return false;
              }}
              onChange={({ fileList }) => {
                if (fileList.length > 0) {
                  const file = fileList[0];
                  // 如果是本地文件，将其转换为base64并压缩
                  if (file.originFileObj) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const img = new Image();
                      img.onload = () => {
                        // 创建canvas进行图片压缩和裁剪
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;

                        // 设置目标尺寸
                        const targetWidth = 300;
                        const targetHeight = 200;

                        // 设置canvas尺寸
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;

                        // 绘制图片，自动裁剪和缩放
                        ctx.drawImage(
                          img,
                          0,
                          0,
                          img.width,
                          img.height, // 原图位置和尺寸
                          0,
                          0,
                          targetWidth,
                          targetHeight // 目标位置和尺寸
                        );

                        // 转换为base64，质量为0.8
                        const compressedDataUrl = canvas.toDataURL(
                          'image/jpeg',
                          0.8
                        );

                        // 设置到表单字段
                        form.setFieldValue('image', compressedDataUrl);
                      };
                      img.src = e.target?.result as string;
                    };
                    reader.readAsDataURL(file.originFileObj);
                  } else {
                    // 如果是已上传的文件，直接使用URL
                    form.setFieldValue('image', file.url);
                  }
                }
              }}
            >
              <Button icon={<PlusOutlined />}>上传图片</Button>
            </Upload>
            <p className="form-help-text">
              支持JPG、PNG格式，建议尺寸300x200像素，上传后会自动调整大小
            </p>
          </Form.Item>

          <div className="form-actions">
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ActivityManagement;
