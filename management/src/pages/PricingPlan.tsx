import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Upload,
  Switch,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import AdminTableSection from '../components/AdminTableSection';
import {
  AdminTableRowActions,
  AdminTableActionEdit,
  AdminTableActionDelete,
} from '../components/AdminTableRowActions';
import AdminListPageShell from '../components/AdminListPageShell';
import ManagementWriteGate from '../components/ManagementWriteGate';
import AdminListSearchBar from '../components/AdminListSearchBar';
import { parseAdminListUrlParams } from '../utils/adminListUrlParams';
import { adminListTableLocale } from '../utils/adminTableLocale';
import { parsePaginatedList } from '../types/api';
import { processImageUrl } from '../utils/imageUtils';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface PlanRow {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular: boolean;
  tag: string | null;
  image: string | null;
  sortOrder: number;
}

const PricingPlanManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    page,
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

  const [rows, setRows] = useState<PlanRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [form] = Form.useForm();
  const [listLoading, setListLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const mapRow = (item: Record<string, unknown>): PlanRow => ({
    id: Number(item.id),
    name: String(item.name ?? ''),
    price: Number(item.price ?? 0),
    description: String(item.description ?? ''),
    features: Array.isArray(item.features)
      ? (item.features as unknown[]).filter(
          (t): t is string => typeof t === 'string'
        )
      : [],
    isPopular: Boolean(item.isPopular),
    tag: item.tag != null ? String(item.tag) : null,
    image: item.image != null ? String(item.image) : null,
    sortOrder: Number(item.sortOrder ?? 0),
  });

  const load = useCallback(async () => {
    setListLoading(true);
    try {
      const st = urlSearch.trim();
      const res = await axiosInstance.get('/pricing-plans', {
        params: {
          page,
          pageSize,
          ...(st ? { search: st } : {}),
        },
      });
      const { list, total: t } =
        parsePaginatedList<Record<string, unknown>>(res);
      setRows(list.map(mapRow));
      setTotal(t);
    } catch (e) {
      message.error('加载价格套餐失败');
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, urlSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChange = () => {
      apiCache.clear();
      void load();
    };
    wsService.on('pricingPlan:created', onChange);
    wsService.on('pricingPlan:updated', onChange);
    wsService.on('pricingPlan:deleted', onChange);
    return () => {
      wsService.off('pricingPlan:created', onChange);
      wsService.off('pricingPlan:updated', onChange);
      wsService.off('pricingPlan:deleted', onChange);
    };
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({
      isPopular: false,
      sortOrder: 0,
      featuresJson: JSON.stringify(['权益一', '权益二']),
    });
    setModalOpen(true);
  };

  const openEdit = (r: PlanRow) => {
    setEditing(r);
    setFileList([]);
    form.setFieldsValue({
      name: r.name,
      price: r.price,
      description: r.description,
      isPopular: r.isPopular,
      tag: r.tag ?? '',
      sortOrder: r.sortOrder,
      featuresJson: JSON.stringify(r.features.length ? r.features : ['权益']),
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const v = await form.validateFields();
      setSubmitLoading(true);
      const fd = new FormData();
      fd.append('name', v.name);
      fd.append('price', String(v.price));
      fd.append('description', v.description);
      fd.append('isPopular', v.isPopular ? 'true' : 'false');
      fd.append('sortOrder', String(v.sortOrder ?? 0));
      const tag = String(v.tag ?? '').trim();
      fd.append('tag', tag);
      const fj = String(v.featuresJson ?? '').trim();
      try {
        JSON.parse(fj);
      } catch {
        message.error('权益列表须为合法 JSON 数组');
        setSubmitLoading(false);
        return;
      }
      fd.append('features', fj);
      const f = fileList[0]?.originFileObj;
      if (f) fd.append('image', f);

      if (editing) {
        await axiosInstance.put(`/pricing-plans/${editing.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已更新');
      } else {
        await axiosInstance.post('/pricing-plans', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已创建');
      }
      apiCache.clear();
      setModalOpen(false);
      void load();
    } catch (e) {
      console.error(e);
      message.error('保存失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除该套餐？',
      onOk: async () => {
        await axiosInstance.delete(`/pricing-plans/${id}`);
        message.success('已删除');
        apiCache.clear();
        void load();
      },
    });
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (p: number) => `¥${Number(p).toFixed(0)}/月`,
    },
    {
      title: '推荐',
      dataIndex: 'isPopular',
      key: 'isPopular',
      width: 72,
      render: (x: boolean) => (x ? '是' : '否'),
    },
    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag',
      width: 90,
      render: (t: string | null) => t || '—',
    },
    {
      title: '图',
      key: 'img',
      width: 64,
      render: (_: unknown, r: PlanRow) =>
        r.image ? (
          <img
            src={processImageUrl(r.image)}
            alt=""
            style={{
              width: 44,
              height: 28,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: '操作',
      key: 'act',
      width: 160,
      render: (_: unknown, r: PlanRow) => (
        <ManagementWriteGate>
          <AdminTableRowActions>
            <AdminTableActionEdit onClick={() => openEdit(r)} />
            <AdminTableActionDelete onClick={() => handleDelete(r.id)} />
          </AdminTableRowActions>
        </ManagementWriteGate>
      ),
    },
  ];

  const hasListFilters = Boolean(urlSearch.trim());

  return (
    <AdminListPageShell
      title="价格套餐"
      description="维护前台价格页套餐与推荐位；关键词检索写入地址栏。"
      extra={
        <ManagementWriteGate>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建套餐
          </Button>
        </ManagementWriteGate>
      }
      filter={
        <div className="admin-page__filter">
          <AdminListSearchBar
            placeholder="搜索名称、描述"
            value={searchInput}
            onChange={setSearchInput}
            totalCount={total}
          />
        </div>
      }
    >
      <AdminTableSection
        pagination={
          <EnhancedPagination
            currentPage={page}
            pageSize={pageSize}
            total={total}
            onChange={(p, ps) => {
              const nextSize = ps ?? pageSize;
              const nextPage = nextSize !== pageSize ? 1 : p;
              setListParams({ page: nextPage, pageSize: nextSize });
            }}
          />
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          loading={listLoading}
          scroll={{ x: 'max-content' }}
          locale={adminListTableLocale(hasListFilters)}
        />
      </AdminTableSection>

      <Modal
        title={editing ? '编辑套餐' : '新建套餐'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void submit()}
        confirmLoading={submitLoading}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" scrollToFirstError>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="月价" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="简介"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="featuresJson"
            label="权益（JSON 数组）"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="isPopular" label="推荐位" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="tag" label="角标文案（可选）">
            <Input placeholder="如：推荐" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="配图（可选）">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              maxCount={1}
              accept="image/*"
            >
              <Button>选择图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </AdminListPageShell>
  );
};

export default PricingPlanManagement;
