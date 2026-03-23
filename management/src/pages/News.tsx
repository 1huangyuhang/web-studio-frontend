import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import './index.less';

// 新闻类型定义
interface News {
  id: number;
  title: string;
  content: string;
  summary: string;
  date: string;
  time: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const NewsManagement: React.FC = () => {
  // 状态管理
  const [news, setNews] = useState<News[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<News | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 获取新闻数据
  const fetchNews = async () => {
    try {
      const response = await axiosInstance.get('/news', {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });
      // 由于axios拦截器已经返回了response.data，直接使用response
      // 检查response是否为数组，确保数据格式正确
      let processedData: News[] = [];

      if (Array.isArray(response)) {
        // 处理数据，确保每个字段只包含对应数据
        processedData = response.map((item) => {
          // 确保数据格式正确，避免字段包含多个数据项
          const news: News = {
            id:
              typeof item.id === 'number' ? item.id : parseInt(String(item.id)),
            title:
              typeof item.title === 'string' ? item.title : String(item.title),
            content:
              typeof item.content === 'string'
                ? item.content
                : String(item.content),
            summary:
              typeof item.summary === 'string'
                ? item.summary
                : String(item.summary),
            date: typeof item.date === 'string' ? item.date : '',
            time: typeof item.time === 'string' ? item.time : '',
            image: typeof item.image === 'string' ? item.image : '',
            createdAt:
              typeof item.createdAt === 'string'
                ? item.createdAt
                : new Date().toISOString(),
            updatedAt:
              typeof item.updatedAt === 'string'
                ? item.updatedAt
                : new Date().toISOString(),
          };
          return news;
        });
      } else if (response?.data && Array.isArray(response.data)) {
        // 如果返回的是分页格式 { data: [...], pagination: {...} }，则使用response.data
        processedData = response.data.map((item) => {
          // 确保数据格式正确，避免字段包含多个数据项
          const news: News = {
            id:
              typeof item.id === 'number' ? item.id : parseInt(String(item.id)),
            title:
              typeof item.title === 'string' ? item.title : String(item.title),
            content:
              typeof item.content === 'string'
                ? item.content
                : String(item.content),
            summary:
              typeof item.summary === 'string'
                ? item.summary
                : String(item.summary),
            date: typeof item.date === 'string' ? item.date : '',
            time: typeof item.time === 'string' ? item.time : '',
            image: typeof item.image === 'string' ? item.image : '',
            createdAt:
              typeof item.createdAt === 'string'
                ? item.createdAt
                : new Date().toISOString(),
            updatedAt:
              typeof item.updatedAt === 'string'
                ? item.updatedAt
                : new Date().toISOString(),
          };
          return news;
        });
      }

      setNews(processedData);
      setTotal(processedData.length);

      // 清除所有相关缓存，确保下次获取最新数据
      apiCache.clear();
    } catch (error) {
      console.error('获取新闻列表失败:', error);
      message.error(
        `获取新闻列表失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // 初始加载数据和WebSocket事件监听
  useEffect(() => {
    fetchNews();

    // 添加WebSocket事件监听器
    const handleNewsCreated = (newsItem: News) => {
      setNews((prev) => [...prev, newsItem]);
      message.success(`新闻 "${newsItem.title}" 已添加`);
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/news{}');
    };

    const handleNewsUpdated = (updatedNews: News) => {
      setNews((prev) =>
        prev.map((news) => (news.id === updatedNews.id ? updatedNews : news))
      );
      message.success(`新闻 "${updatedNews.title}" 已更新`);
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/news{}');
    };

    const handleNewsDeleted = (newsId: number) => {
      setNews((prev) => prev.filter((news) => news.id !== newsId));
      message.success('新闻已删除');
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/news{}');
    };

    // 注册事件监听器
    wsService.on('news:created', handleNewsCreated);
    wsService.on('news:updated', handleNewsUpdated);
    wsService.on('news:deleted', handleNewsDeleted);

    // 组件卸载时移除事件监听器
    return () => {
      wsService.off('news:created', handleNewsCreated);
      wsService.off('news:updated', handleNewsUpdated);
      wsService.off('news:deleted', handleNewsDeleted);
    };
  }, []);

  // 页码变化时重新获取数据
  useEffect(() => {
    fetchNews();
  }, [currentPage]);

  // 打开创建/编辑模态框
  const showModal = (newsItem?: News) => {
    if (newsItem) {
      setIsEditing(true);
      setCurrentNews(newsItem);
      form.setFieldsValue(newsItem);
    } else {
      setIsEditing(false);
      setCurrentNews(null);
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
      formData.append('content', values.content);
      formData.append('summary', values.summary);
      formData.append('date', values.date);
      formData.append('time', values.time);

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
        formData.append('image', blob, 'news-image.jpg');
      }

      if (isEditing && currentNews) {
        // 乐观更新：立即更新本地UI
        const updatedNews = {
          ...currentNews,
          ...values,
        };

        // 更新本地状态
        setNews((prev) =>
          prev.map((newsItem) =>
            newsItem.id === currentNews.id ? updatedNews : newsItem
          )
        );

        // 更新新闻，使用FormData
        await axiosInstance.put(`/news/${currentNews.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('新闻更新成功');
        // 清除新闻列表缓存
        apiCache.delete('get:/news{}');
      } else {
        // 乐观更新：立即更新本地UI
        // 生成临时ID，后续会被实际ID替换
        const tempNews = {
          id: Date.now(), // 临时ID
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 更新本地状态
        setNews((prev) => [...prev, tempNews]);

        // 创建新闻，使用FormData
        await axiosInstance.post('/news', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('新闻创建成功');
        // 清除新闻列表缓存
        apiCache.delete('get:/news{}');
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

  // 删除新闻
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确定要删除这篇新闻吗？',
      onOk: async () => {
        try {
          // 乐观更新：立即从本地状态中删除
          setNews((prev) => prev.filter((newsItem) => newsItem.id !== id));

          // 删除新闻
          await axiosInstance.delete(`/news/${id}`);
          message.success('新闻删除成功');
          // 清除新闻列表缓存
          apiCache.delete('get:/news{}');
          // WebSocket会自动更新数据，不需要重新获取列表
        } catch (error: any) {
          console.error('删除新闻失败:', error);
          message.error(error.response?.data?.error || '删除新闻失败');
          // 错误回滚：恢复删除的新闻
          fetchNews(); // 重新获取新闻列表，确保数据一致性
        }
      },
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '新闻标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      ellipsis: true,
      render: (text: string) => {
        return text || '-';
      },
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 280,
      ellipsis: true,
      render: (text: string) => {
        return text || '-';
      },
    },
    {
      title: '新闻图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      align: 'center' as const,
      render: (text: string) => {
        if (!text) return null;
        // 如果是base64字符串，直接显示；否则，使用URL
        const imageUrl = text.startsWith('data:')
          ? text
          : `data:image/jpeg;base64,${text}`;
        return (
          <img
            src={imageUrl}
            alt="新闻图片"
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
      align: 'center' as const,
      ellipsis: true,
      render: (text: string) => {
        if (!text) return '-';
        // 格式化日期，确保显示正确
        try {
          const date = new Date(text);
          return date.toLocaleString();
        } catch (e) {
          return text;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: News) => (
        <div
          className="action-buttons"
          style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}
        >
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            className="edit-button"
            onClick={() => showModal(record)}
            style={{ flex: 1, minWidth: '60px' }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            className="delete-button"
            onClick={() => handleDelete(record.id)}
            style={{ flex: 1, minWidth: '60px' }}
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
        <h1>新闻管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增新闻
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={news}
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

      {/* 新闻表单模态框 */}
      <Modal
        title={isEditing ? '编辑新闻' : '新增新闻'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="新闻标题"
            rules={[{ required: true, message: '请输入新闻标题' }]}
          >
            <Input placeholder="请输入新闻标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="新闻内容"
            rules={[{ required: true, message: '请输入新闻内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入新闻内容" />
          </Form.Item>

          <Form.Item
            name="summary"
            label="新闻摘要"
            rules={[{ required: true, message: '请输入新闻摘要' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入新闻摘要" />
          </Form.Item>

          <Form.Item
            name="date"
            label="新闻日期"
            rules={[{ required: true, message: '请输入新闻日期' }]}
          >
            <Input placeholder="请输入新闻日期（格式：YYYY-MM-DD）" />
          </Form.Item>

          <Form.Item
            name="time"
            label="新闻时间"
            rules={[{ required: true, message: '请输入新闻时间' }]}
          >
            <Input placeholder="请输入新闻时间（格式：HH:MM）" />
          </Form.Item>

          <Form.Item
            name="image"
            label="新闻图片"
            rules={[{ required: true, message: '请上传新闻图片' }]}
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

export default NewsManagement;
