import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Upload,
  Image,
  Tag,
  Tabs,
  Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axiosInstance from '../services/axiosInstance';
import { formatManagementListLoadError } from '../utils/managementLoadErrorHint';
import { processImageUrl } from '../utils/imageUtils';
import AdminTableSection from '../components/AdminTableSection';
import {
  AdminTableRowActions,
  AdminTableActionEdit,
  AdminTableActionDelete,
} from '../components/AdminTableRowActions';
import AdminListPageShell from '../components/AdminListPageShell';
import ManagementWriteGate from '../components/ManagementWriteGate';
import AdminListSearchBar from '../components/AdminListSearchBar';
import { adminListTableLocale } from '../utils/adminTableLocale';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { queryKeys } from '../queryKeys';

const { TextArea } = Input;

interface SiteAssetRow {
  id: number;
  page: string;
  groupKey: string;
  sortOrder: number;
  title: string | null;
  alt: string | null;
  content: string | null;
  meta: string | null;
  image: string | null;
  imageUrl?: string | null;
  videoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

async function fetchSiteAssetsList(pageTab: string): Promise<SiteAssetRow[]> {
  const res = await axiosInstance.get('/site-assets', {
    params: {
      ...(pageTab !== 'all' ? { page: pageTab } : {}),
      omitImage: '1',
    },
  });
  const data = Array.isArray((res as { data?: unknown }).data)
    ? (res as { data: SiteAssetRow[] }).data
    : [];
  return data;
}

const SiteAssetManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [pageTab, setPageTab] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SiteAssetRow | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [allPageKeys, setAllPageKeys] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const debouncedKeyword = useDebouncedValue(keywordInput, 300);
  const loadErrorPrint = useRef<string | null>(null);

  const {
    data,
    isPending: loading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.siteAssets.list(pageTab),
    queryFn: () => fetchSiteAssetsList(pageTab),
  });

  const rows = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (!isError) {
      loadErrorPrint.current = null;
      return;
    }
    const content = formatManagementListLoadError(error, '站点素材');
    if (loadErrorPrint.current === content) return;
    loadErrorPrint.current = content;
    message.error({
      key: 'mgmt-site-assets-load',
      content,
      duration: 8,
    });
    console.error(error);
  }, [isError, error]);

  useEffect(() => {
    if (pageTab !== 'all' || !data) return;
    const keys = [...new Set(data.map((r) => r.page))].sort();
    setAllPageKeys(keys);
    const counts: Record<string, number> = { __all: data.length };
    keys.forEach((k) => {
      counts[k] = data.filter((r) => r.page === k).length;
    });
    setTabCounts(counts);
  }, [pageTab, data]);

  const invalidateSiteAssets = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.siteAssets.list(pageTab),
      exact: true,
    });
    if (pageTab !== 'all') {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.siteAssets.list('all'),
        exact: true,
      });
    }
  }, [queryClient, pageTab]);

  const displayRows = useMemo(() => {
    const q = debouncedKeyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [r.groupKey, r.title ?? '', r.alt ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, debouncedKeyword]);

  const tabItems = useMemo(() => {
    const pageKeys =
      allPageKeys.length > 0
        ? allPageKeys
        : [...new Set(rows.map((r) => r.page))].sort();
    return [
      {
        key: 'all',
        label: tabCounts.__all != null ? `全部（${tabCounts.__all}）` : '全部',
      },
      ...pageKeys.map((p) => ({
        key: p,
        label: tabCounts[p] != null ? `${p}（${tabCounts[p]}）` : p,
      })),
    ];
  }, [allPageKeys, rows, tabCounts]);

  useEffect(() => {
    if (pageTab === 'all') return;
    const keysFromRows = [...new Set(rows.map((r) => r.page))];
    const known = new Set([...allPageKeys, ...keysFromRows]);
    if (!known.has(pageTab)) setPageTab('all');
  }, [pageTab, rows, allPageKeys]);

  const openCreate = () => {
    setEditing(null);
    setDetailLoading(false);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({ sortOrder: 0, imageUrl: '' });
    setModalOpen(true);
  };

  const openEdit = async (record: SiteAssetRow) => {
    setEditing(record);
    setModalOpen(true);
    form.resetFields();
    setFileList([]);
    setDetailLoading(true);
    try {
      const res = (await axiosInstance.get(`/site-assets/${record.id}`)) as {
        data: SiteAssetRow;
      };
      const full = res.data;
      form.setFieldsValue({
        page: full.page,
        groupKey: full.groupKey,
        sortOrder: full.sortOrder,
        title: full.title ?? '',
        alt: full.alt ?? '',
        content: full.content ?? '',
        meta: full.meta ?? '',
        videoUrl: full.videoUrl ?? '',
      });
      if (full.image) {
        setFileList([
          {
            uid: '-1',
            name: 'current',
            status: 'done',
            url: processImageUrl(full.image),
          },
        ]);
      } else {
        setFileList([]);
      }
    } catch (e) {
      message.error({
        content: formatManagementListLoadError(e, '站点素材详情'),
        duration: 6,
      });
      form.setFieldsValue({
        page: record.page,
        groupKey: record.groupKey,
        sortOrder: record.sortOrder,
        title: record.title ?? '',
        alt: record.alt ?? '',
        content: record.content ?? '',
        meta: record.meta ?? '',
        videoUrl: record.videoUrl ?? '',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除该条站点素材？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/site-assets/${id}`);
          message.success('已删除');
          invalidateSiteAssets();
        } catch (e) {
          message.error('删除失败');
          console.error(e);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const rawFile = fileList[0]?.originFileObj;
      const imageUrl = String(values.imageUrl ?? '').trim();
      const hasContent = String(values.content ?? '').trim().length > 0;
      const hasVideo = String(values.videoUrl ?? '').trim().length > 0;

      if (
        !editing &&
        !(rawFile instanceof File) &&
        !imageUrl &&
        !hasVideo &&
        !hasContent
      ) {
        message.warning(
          '请至少：填写可访问的图片 URL、或上传图片、或填写视频地址、或填写正文'
        );
        setSubmitting(false);
        return;
      }

      if (!editing && imageUrl && !(rawFile instanceof File)) {
        await axiosInstance.post('/site-assets/import-url', {
          page: values.page,
          groupKey: values.groupKey,
          sortOrder: values.sortOrder ?? 0,
          title: values.title || undefined,
          alt: values.alt || undefined,
          content: values.content || undefined,
          meta: values.meta || undefined,
          videoUrl: values.videoUrl || undefined,
          imageUrl,
        });
        message.success('已从 URL 创建素材');
        setModalOpen(false);
        invalidateSiteAssets();
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('page', values.page);
      formData.append('groupKey', values.groupKey);
      formData.append('sortOrder', String(values.sortOrder ?? 0));
      if (values.title != null && values.title !== '') {
        formData.append('title', values.title);
      }
      if (values.alt != null && values.alt !== '') {
        formData.append('alt', values.alt);
      }
      if (values.videoUrl != null && values.videoUrl !== '') {
        formData.append('videoUrl', values.videoUrl);
      }
      if (values.content != null && String(values.content).trim() !== '') {
        formData.append('content', String(values.content));
      }
      if (values.meta != null && String(values.meta).trim() !== '') {
        formData.append('meta', String(values.meta));
      }
      if (rawFile instanceof File) {
        formData.append('image', rawFile);
      }

      if (!editing && !(rawFile instanceof File) && !hasVideo && !hasContent) {
        message.warning(
          '请至少上传图片、填写视频地址或填写正文（成功案例/关于页文案可仅用正文）'
        );
        setSubmitting(false);
        return;
      }

      if (editing) {
        await axiosInstance.put(`/site-assets/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已更新');
      } else {
        await axiosInstance.post('/site-assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已创建');
      }
      setModalOpen(false);
      invalidateSiteAssets();
    } catch (e) {
      if ((e as { errorFields?: unknown })?.errorFields) return;
      message.error('保存失败');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 64,
    },
    {
      title: '页面',
      dataIndex: 'page',
      width: 100,
      render: (t: string) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: '分组',
      dataIndex: 'groupKey',
      width: 140,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 72,
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (t: string | null) => t || '—',
    },
    {
      title: '预览',
      key: 'preview',
      width: 96,
      render: (_: unknown, r: SiteAssetRow) => {
        const src = r.imageUrl || r.image;
        return src ? (
          <Image
            width={56}
            height={56}
            src={processImageUrl(src)}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#888', fontSize: 12 }}>仅本地图</span>
        );
      },
    },
    {
      title: '视频',
      dataIndex: 'videoUrl',
      ellipsis: true,
      render: (u: string | null) => u || '—',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: SiteAssetRow) => (
        <ManagementWriteGate>
          <AdminTableRowActions>
            <AdminTableActionEdit onClick={() => void openEdit(record)} />
            <AdminTableActionDelete onClick={() => handleDelete(record.id)} />
          </AdminTableRowActions>
        </ManagementWriteGate>
      ),
    },
  ];

  const hasActiveFilters = Boolean(debouncedKeyword.trim());

  return (
    <AdminListPageShell
      title="站点素材"
      description="列表使用精简接口（不返回 BYTEA Base64），表格预览以外链图为主；仅存储在库内的图片显示「仅本地图」，编辑时将加载完整详情。按页面 Tab 筛选；可在当前结果内关键词搜索。"
      extra={
        <ManagementWriteGate>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增素材
          </Button>
        </ManagementWriteGate>
      }
      filter={
        <div className="admin-page__filter">
          <Tabs
            activeKey={pageTab}
            onChange={setPageTab}
            items={tabItems}
            size="small"
            type="card"
            style={{ marginBottom: 12 }}
          />
          <AdminListSearchBar
            placeholder="在当前列表中筛选分组、标题、alt"
            value={keywordInput}
            onChange={setKeywordInput}
            totalCount={displayRows.length}
          />
        </div>
      }
    >
      <AdminTableSection>
        <Table<SiteAssetRow>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={displayRows}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 960 }}
          locale={adminListTableLocale(hasActiveFilters)}
        />
      </AdminTableSection>

      <Modal
        title={editing ? '编辑站点素材' : '新增站点素材'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={submitting}
        okButtonProps={{ disabled: detailLoading }}
        width={560}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin tip="加载素材详情…" />
          </div>
        ) : (
          <Form form={form} layout="vertical" scrollToFirstError>
            <Form.Item
              name="page"
              label="页面标识 page"
              rules={[
                { required: true, message: '例如 home / about / layout' },
              ]}
            >
              <Input placeholder="home | about | layout" />
            </Form.Item>
            <Form.Item
              name="groupKey"
              label="分组 groupKey"
              rules={[{ required: true, message: '例如 top_gallery、header' }]}
            >
              <Input placeholder="top_gallery | product_categories | header …" />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序 sortOrder">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="title" label="标题（可选，如产品系列名称）">
              <Input />
            </Form.Item>
            <Form.Item name="alt" label="图片 alt 文案">
              <Input />
            </Form.Item>
            <Form.Item
              name="content"
              label="正文 content（关于页段落、案例描述等）"
            >
              <TextArea
                rows={5}
                placeholder="支持多段纯文本，前台按分组与排序展示"
              />
            </Form.Item>
            <Form.Item
              name="meta"
              label="扩展 JSON（可选，用于成功案例 case_item）"
              extra='示例：{"client":"客户名","category":"分类","date":"2024-01-01","tags":["标签1"]}'
            >
              <TextArea
                rows={3}
                placeholder='{"client":"","category":"","date":"","tags":[]}'
              />
            </Form.Item>
            <Form.Item name="videoUrl" label="视频地址（可选，如首页滚动区）">
              <Input placeholder="https://…" />
            </Form.Item>
            {!editing ? (
              <Form.Item
                name="imageUrl"
                label="图片 URL（可选，与下方上传二选一）"
                extra="示例：https://picsum.photos/id/1018/1200/800 — 由服务端下载并存储"
              >
                <Input placeholder="https://…" allowClear />
              </Form.Item>
            ) : (
              <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                编辑时如需换图请使用下方上传；或使用删除后通过「新增」从 URL
                导入。
              </p>
            )}
            <Form.Item label="图片文件（可选）">
              <Upload
                listType="picture"
                fileList={fileList}
                beforeUpload={() => false}
                maxCount={1}
                onChange={({ fileList: fl }) => setFileList(fl)}
              >
                <Button type="default">选择图片</Button>
              </Upload>
              {editing ? (
                <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                  不选择文件则保留原图
                </div>
              ) : null}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </AdminListPageShell>
  );
};

export default SiteAssetManagement;
