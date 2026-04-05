import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Upload,
  Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '@/services/axiosInstance';
import wsService from '@/services/websocket';
import EnhancedPagination from '@/components/EnhancedPagination';
import AdminListPageShell from '@/components/AdminListPageShell';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { queryKeys } from '@/queryKeys';
import { fetchNewsPage, type NewsRow } from '@/api/adminLists';
import './index.less';

const NewsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const prevDebounced = useRef(debouncedSearch);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (prevDebounced.current !== debouncedSearch) {
      prevDebounced.current = debouncedSearch;
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  const listParams = {
    page: currentPage,
    pageSize,
    search: debouncedSearch.trim(),
  };

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.news.list(listParams),
    queryFn: () => fetchNewsPage(listParams),
  });

  useEffect(() => {
    if (isError && error) {
      message.error({
        key: 'mgmt-news-list',
        content: `获取新闻列表失败: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }, [isError, error]);

  const news = data?.list ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    };
    wsService.on('news:created', invalidate);
    wsService.on('news:updated', invalidate);
    wsService.on('news:deleted', invalidate);
    return () => {
      wsService.off('news:created', invalidate);
      wsService.off('news:updated', invalidate);
      wsService.off('news:deleted', invalidate);
    };
  }, [queryClient]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<NewsRow | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const showModal = useCallback(
    (item?: NewsRow) => {
      if (item) {
        setIsEditing(true);
        setCurrentNews(item);
        form.setFieldsValue(item);
      } else {
        setIsEditing(false);
        setCurrentNews(null);
        form.resetFields();
      }
      setIsModalVisible(true);
    },
    [form]
  );

  const handleCancel = () => setIsModalVisible(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('summary', values.summary);
      formData.append('date', values.date);
      formData.append('time', values.time);

      if (
        values.image &&
        typeof values.image === 'string' &&
        values.image.startsWith('data:')
      ) {
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
        formData.append('image', base64ToBlob(values.image), 'news-image.jpg');
      }

      if (isEditing && currentNews) {
        await axiosInstance.put(`/news/${currentNews.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('新闻更新成功');
      } else {
        await axiosInstance.post('/news', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('新闻创建成功');
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
      setIsModalVisible(false);
    } catch (err: unknown) {
      console.error('操作失败:', err);
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response
          ?.data?.error === 'string'
          ? (err as { response: { data: { error: string } } }).response.data
              .error
          : err instanceof Error
            ? err.message
            : '操作失败';
      message.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确定要删除这篇新闻吗？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/news/${id}`);
          message.success('新闻删除成功');
          await queryClient.invalidateQueries({
            queryKey: queryKeys.news.lists(),
          });
        } catch (err: unknown) {
          console.error('删除新闻失败:', err);
          const msg =
            typeof err === 'object' &&
            err !== null &&
            'response' in err &&
            typeof (err as { response?: { data?: { error?: string } } })
              .response?.data?.error === 'string'
              ? (err as { response: { data: { error: string } } }).response.data
                  .error
              : '删除新闻失败';
          message.error(msg);
          void refetch();
        }
      },
    });
  };

  const columns = [
    {
      title: '新闻标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 280,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '新闻图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      align: 'center' as const,
      render: (text: string) => {
        if (!text) return null;
        const imageUrl = text.startsWith('data:')
          ? text
          : `data:image/jpeg;base64,${text}`;
        return (
          <img
            src={imageUrl}
            alt=""
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
        try {
          return new Date(text).toLocaleString();
        } catch {
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
      render: (_: unknown, record: NewsRow) => (
        <div
          className="action-buttons"
          style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
        >
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            className="edit-button"
            onClick={() => showModal(record)}
            style={{ flex: 1, minWidth: 60 }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            className="delete-button"
            onClick={() => handleDelete(record.id)}
            style={{ flex: 1, minWidth: 60 }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const searchFilter = (
    <Space wrap className="admin-page__filter-row">
      <Input.Search
        allowClear
        placeholder="搜索标题、正文或摘要"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={(v) => setSearchInput(v)}
        style={{ maxWidth: 360 }}
      />
    </Space>
  );

  return (
    <AdminListPageShell
      title="新闻管理"
      description="与前台新闻数据源一致；支持标题、内容、摘要关键词检索。"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增新闻
        </Button>
      }
      filter={searchFilter}
    >
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={news}
          rowKey="id"
          bordered
          pagination={false}
          loading={isPending}
        />
      </div>

      <EnhancedPagination
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={(page, size) => {
          const nextSize = size ?? pageSize;
          setCurrentPage(nextSize !== pageSize ? 1 : page);
          setPageSize(nextSize);
        }}
      />

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
            <Input placeholder="格式：YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="time"
            label="新闻时间"
            rules={[{ required: true, message: '请输入新闻时间' }]}
          >
            <Input placeholder="格式：HH:MM" />
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
                const ok =
                  file.type === 'image/jpeg' || file.type === 'image/png';
                if (!ok) {
                  message.error('只能上传JPG/PNG格式的图片');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={({ fileList }) => {
                if (fileList.length > 0) {
                  const file = fileList[0];
                  if (file.originFileObj) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        const targetWidth = 300;
                        const targetHeight = 200;
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;
                        ctx.drawImage(
                          img,
                          0,
                          0,
                          img.width,
                          img.height,
                          0,
                          0,
                          targetWidth,
                          targetHeight
                        );
                        form.setFieldValue(
                          'image',
                          canvas.toDataURL('image/jpeg', 0.8)
                        );
                      };
                      img.src = e.target?.result as string;
                    };
                    reader.readAsDataURL(file.originFileObj);
                  } else {
                    form.setFieldValue('image', file.url);
                  }
                }
              }}
            >
              <Button icon={<PlusOutlined />}>上传图片</Button>
            </Upload>
            <p className="form-help-text">
              支持JPG、PNG格式，建议尺寸300x200像素
            </p>
          </Form.Item>
          <div className="form-actions">
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              onClick={() => void handleSubmit()}
              loading={submitLoading}
            >
              {isEditing ? '更新' : '创建'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminListPageShell>
  );
};

export default NewsManagement;
