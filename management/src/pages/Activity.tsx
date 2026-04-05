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
import { useListQueryErrorToast } from '@/hooks/useListQueryErrorToast';
import { queryKeys } from '@/queryKeys';
import { fetchActivitiesPage, type ActivityRow } from '@/api/adminLists';
import './index.less';

const ActivityManagement: React.FC = () => {
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
    queryKey: queryKeys.activities.list(listParams),
    queryFn: () => fetchActivitiesPage(listParams),
  });

  useListQueryErrorToast(
    isError,
    error,
    'mgmt-activities-list',
    '获取活动列表失败'
  );

  const activities = data?.list ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.activities.lists(),
      });
    };
    wsService.on('activity:created', invalidate);
    wsService.on('activity:updated', invalidate);
    wsService.on('activity:deleted', invalidate);
    return () => {
      wsService.off('activity:created', invalidate);
      wsService.off('activity:updated', invalidate);
      wsService.off('activity:deleted', invalidate);
    };
  }, [queryClient]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityRow | null>(
    null
  );
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const showModal = useCallback(
    (activity?: ActivityRow) => {
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
    },
    [form]
  );

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);

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
        const blob = base64ToBlob(values.image);
        formData.append('image', blob, 'activity-image.jpg');
      }

      if (isEditing && currentActivity) {
        await axiosInstance.put(`/activities/${currentActivity.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('活动更新成功');
      } else {
        await axiosInstance.post('/activities', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('活动创建成功');
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.activities.lists(),
      });
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
      content: '你确定要删除这个活动吗？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/activities/${id}`);
          message.success('活动删除成功');
          await queryClient.invalidateQueries({
            queryKey: queryKeys.activities.lists(),
          });
        } catch (err: unknown) {
          console.error('删除活动失败:', err);
          const msg =
            typeof err === 'object' &&
            err !== null &&
            'response' in err &&
            typeof (err as { response?: { data?: { error?: string } } })
              .response?.data?.error === 'string'
              ? (err as { response: { data: { error: string } } }).response.data
                  .error
              : '删除活动失败';
          message.error(msg);
          void refetch();
        }
      },
    });
  };

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
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: ActivityRow) => (
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

  const searchFilter = (
    <Space wrap className="admin-page__filter-row">
      <Input.Search
        allowClear
        placeholder="搜索标题或描述（与接口 search 一致）"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={(v) => setSearchInput(v)}
        style={{ maxWidth: 360 }}
      />
    </Space>
  );

  return (
    <AdminListPageShell
      title="活动管理"
      description="维护前台活动列表与封面图；支持标题、描述关键词检索。"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增活动
        </Button>
      }
      filter={searchFilter}
    >
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={activities}
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

export default ActivityManagement;
