import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, message, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axiosInstance from '@/services/axiosInstance';
import wsService from '@/services/websocket';
import EnhancedPagination from '@/components/EnhancedPagination';
import AdminTableSection from '@/components/AdminTableSection';
import {
  AdminTableRowActions,
  AdminTableActionEdit,
  AdminTableActionDelete,
} from '@/components/AdminTableRowActions';
import AdminListPageShell from '@/components/AdminListPageShell';
import AdminListSearchBar from '@/components/AdminListSearchBar';
import { parseAdminListUrlParams } from '@/utils/adminListUrlParams';
import { adminListTableLocale } from '@/utils/adminTableLocale';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryErrorToast } from '@/hooks/useListQueryErrorToast';
import { queryKeys } from '@/queryKeys';
import { fetchActivitiesPage, type ActivityRow } from '@/api/adminLists';

const ActivityManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    page: currentPage,
    pageSize,
    search: urlSearch,
  } = useMemo(() => parseAdminListUrlParams(searchParams), [searchParams]);

  const [searchInput, setSearchInput] = useState(urlSearch);
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const debouncedInput = useDebouncedValue(searchInput, 400);
  useEffect(() => {
    const t = debouncedInput.trim();
    const u = urlSearch.trim();
    if (t === u) return;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (t) p.set('search', t);
      else p.delete('search');
      p.set('page', '1');
      return p;
    });
  }, [debouncedInput, urlSearch, setSearchParams]);

  const setListParams = useCallback(
    (next: { page?: number; pageSize?: number }) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (next.page != null) p.set('page', String(next.page));
        if (next.pageSize != null) p.set('pageSize', String(next.pageSize));
        return p;
      });
    },
    [setSearchParams]
  );

  const listParams = {
    page: currentPage,
    pageSize,
    search: urlSearch.trim(),
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
        <AdminTableRowActions>
          <AdminTableActionEdit onClick={() => showModal(record)} />
          <AdminTableActionDelete onClick={() => handleDelete(record.id)} />
        </AdminTableRowActions>
      ),
    },
  ];

  const searchFilter = (
    <div className="admin-page__filter">
      <AdminListSearchBar
        placeholder="搜索标题或描述（与接口 search 一致）"
        value={searchInput}
        onChange={setSearchInput}
        totalCount={total}
      />
    </div>
  );

  return (
    <AdminListPageShell
      title="活动管理"
      description="维护前台活动列表与封面图；关键词写入地址栏，刷新后保留。"
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
      <AdminTableSection
        pagination={
          <EnhancedPagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page, size) => {
              const nextSize = size ?? pageSize;
              const nextPage = nextSize !== pageSize ? 1 : page;
              setListParams({ page: nextPage, pageSize: nextSize });
            }}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          bordered
          pagination={false}
          loading={isPending}
          scroll={{ x: 'max-content' }}
          locale={adminListTableLocale(Boolean(urlSearch.trim()))}
        />
      </AdminTableSection>

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
