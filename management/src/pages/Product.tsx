import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Upload,
  Select,
  Popover,
  Checkbox,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import axiosInstance from '@/services/axiosInstance';
import wsService from '@/services/websocket';
import EnhancedPagination from '@/components/EnhancedPagination';
import AdminListPageShell from '@/components/AdminListPageShell';
import ManagementWriteGate from '@/components/ManagementWriteGate';
import {
  loadColumnVisibility,
  saveColumnVisibility,
} from '@/utils/persistedTableColumns';
import { canWriteInManagementUi } from '@/utils/managementWriteAccess';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryErrorToast } from '@/hooks/useListQueryErrorToast';
import { queryKeys } from '@/queryKeys';
import { fetchProductsPage, type ProductRow } from '@/api/adminLists';
import './index.less';

const { Option } = Select;

interface CategoryOption {
  id: number;
  slug: string;
  name: string;
}

const COL_STORAGE_KEY = 'mgmt-product-table-columns-v1';
const OPTIONAL_COL_KEYS = [
  'name',
  'price',
  'category',
  'image',
  'isNew',
  'createdAt',
] as const;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const COL_LABELS: Record<(typeof OPTIONAL_COL_KEYS)[number], string> = {
  name: '产品名称',
  price: '价格',
  category: '分类',
  image: '产品图片',
  isNew: '是否新品',
  createdAt: '创建时间',
};

function parseListParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const rawPs = Number(searchParams.get('pageSize'));
  const pageSize = PAGE_SIZE_OPTIONS.includes(
    rawPs as (typeof PAGE_SIZE_OPTIONS)[number]
  )
    ? rawPs
    : 10;
  const search = searchParams.get('search')?.trim() ?? '';
  return { page, pageSize, search };
}

const ProductManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const listParams = useMemo(
    () => parseListParams(searchParams),
    [searchParams]
  );

  const { page: currentPage, pageSize, search: urlSearch } = listParams;

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

  const queryListParams = {
    page: currentPage,
    pageSize,
    search: urlSearch,
  };

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.products.list(queryListParams),
    queryFn: () => fetchProductsPage(queryListParams),
  });

  useListQueryErrorToast(
    isError,
    error,
    'mgmt-products-list',
    '获取产品列表失败'
  );

  const products = data?.list ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    };
    wsService.on('product:created', invalidate);
    wsService.on('product:updated', invalidate);
    wsService.on('product:deleted', invalidate);
    return () => {
      wsService.off('product:created', invalidate);
      wsService.off('product:updated', invalidate);
      wsService.off('product:deleted', invalidate);
    };
  }, [queryClient]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductRow | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [colVisible, setColVisible] = useState(() =>
    loadColumnVisibility(COL_STORAGE_KEY, [...OPTIONAL_COL_KEYS], true)
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await axiosInstance.get<{ data: CategoryOption[] }>(
          '/categories'
        );
        setCategories(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        message.error('加载商品分类失败');
      }
    })();
  }, []);

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

  const showModal = useCallback(
    (product?: ProductRow) => {
      if (product) {
        setIsEditing(true);
        setCurrentProduct(product);
        form.setFieldsValue({
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          isNew: product.isNew,
          imageUrl: product.imageUrl || '',
          image: product.imageUrl?.trim()
            ? undefined
            : product.image || undefined,
        });
      } else {
        setIsEditing(false);
        setCurrentProduct(null);
        form.resetFields();
        form.setFieldsValue({ isNew: false, imageUrl: '' });
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
      const imageUrlTrim = String(values.imageUrl ?? '').trim();
      const hasDataImage =
        values.image &&
        typeof values.image === 'string' &&
        values.image.startsWith('data:');

      if (!isEditing && !hasDataImage && !imageUrlTrim) {
        message.error('请上传产品图片或填写图片 URL');
        setSubmitLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', values.price.toString());
      formData.append('categoryId', String(values.categoryId));
      formData.append('isNew', values.isNew ? 'true' : 'false');
      if (imageUrlTrim) {
        formData.append('imageUrl', imageUrlTrim);
      }

      if (hasDataImage) {
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
        formData.append(
          'image',
          base64ToBlob(values.image),
          'product-image.jpg'
        );
      }

      if (isEditing && currentProduct) {
        await axiosInstance.put(`/products/${currentProduct.id}`, formData);
        message.success('产品更新成功');
      } else {
        await axiosInstance.post('/products', formData);
        message.success('产品创建成功');
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      setIsModalVisible(false);
    } catch (err: unknown) {
      console.error('操作失败:', err);
      message.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = useCallback(
    (id: number) => {
      Modal.confirm({
        title: '确认删除',
        content: '你确定要删除这个产品吗？',
        onOk: async () => {
          try {
            await axiosInstance.delete(`/products/${id}`);
            message.success('产品删除成功');
            await queryClient.invalidateQueries({
              queryKey: queryKeys.products.lists(),
            });
          } catch (err: unknown) {
            console.error('删除产品失败:', err);
            message.error(err instanceof Error ? err.message : '删除产品失败');
            void refetch();
          }
        },
      });
    },
    [queryClient, refetch]
  );

  const writeEnabled = canWriteInManagementUi();

  const onColToggle = (
    key: (typeof OPTIONAL_COL_KEYS)[number],
    checked: boolean
  ) => {
    setColVisible((prev) => {
      const next = { ...prev, [key]: checked };
      saveColumnVisibility(COL_STORAGE_KEY, next);
      return next;
    });
  };

  const columnSettings = (
    <Popover
      title="列设置"
      trigger="click"
      placement="bottomRight"
      content={
        <Space direction="vertical" size="small" style={{ minWidth: 160 }}>
          {OPTIONAL_COL_KEYS.map((k) => (
            <Checkbox
              key={k}
              checked={colVisible[k]}
              onChange={(e) => onColToggle(k, e.target.checked)}
            >
              {COL_LABELS[k]}
            </Checkbox>
          ))}
        </Space>
      }
    >
      <Button icon={<SettingOutlined />}>列设置</Button>
    </Popover>
  );

  const allColumns: ColumnsType<ProductRow> = useMemo(
    () => [
      {
        title: '产品名称',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        render: (text: string) =>
          typeof text === 'string' ? text : String(text),
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        align: 'center',
        render: (text: string | number) => {
          if (text === undefined || text === null) return '-';
          const price = typeof text === 'string' ? parseFloat(text) : text;
          return `¥${Number(price).toFixed(2)}`;
        },
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: 120,
        align: 'center',
        render: (text: string) => text || '-',
      },
      {
        title: '产品图片',
        dataIndex: 'image',
        key: 'image',
        width: 100,
        align: 'center',
        render: (_: string, record: ProductRow) => {
          const ext = record.imageUrl?.trim();
          if (ext && /^https?:\/\//i.test(ext)) {
            return (
              <img
                src={ext}
                alt=""
                style={{
                  width: 80,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
            );
          }
          const text = record.image;
          if (!text) return null;
          const src = text.startsWith('data:')
            ? text
            : `data:image/jpeg;base64,${text}`;
          return (
            <img
              src={src}
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
        title: '是否新品',
        dataIndex: 'isNew',
        key: 'isNew',
        width: 100,
        align: 'center',
        render: (text: boolean) => (text ? '是' : '否'),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        align: 'center',
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
        dataIndex: 'action',
        key: 'action',
        width: 160,
        align: 'center',
        fixed: 'right',
        render: (_: unknown, record: ProductRow) =>
          writeEnabled ? (
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
          ) : (
            '—'
          ),
      },
    ],
    [writeEnabled, showModal, handleDelete]
  );

  const visibleColumns = useMemo(
    () =>
      allColumns.filter(
        (c) => c.key === 'action' || (c.key && colVisible[String(c.key)])
      ),
    [allColumns, colVisible]
  );

  const searchFilter = (
    <Space wrap className="admin-page__filter-row">
      <Input.Search
        allowClear
        placeholder="按产品名称或分类名称搜索"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={(v) => setSearchInput(v)}
        style={{ maxWidth: 360 }}
      />
    </Space>
  );

  return (
    <AdminListPageShell
      title="产品管理"
      description="检索条件会写入地址栏 ?search=，便于分享与刷新后保留。"
      extra={
        <Space wrap>
          {columnSettings}
          <ManagementWriteGate>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              新增产品
            </Button>
          </ManagementWriteGate>
        </Space>
      }
      filter={searchFilter}
    >
      <div className="table-container">
        <Table
          columns={visibleColumns}
          dataSource={products}
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
          const nextPage = nextSize !== pageSize ? 1 : page;
          setListParams({ page: nextPage, pageSize: nextSize });
        }}
      />

      <Modal
        title={isEditing ? '编辑产品' : '新增产品'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isNew: false, imageUrl: '' }}
        >
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <Input type="number" placeholder="请输入价格" />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
            extra="选项来自数据库已有类目；新增类目需通过种子或数据库维护。"
          >
            <Select
              placeholder="请选择分类"
              showSearch
              optionFilterProp="label"
            >
              {categories.map((c) => (
                <Option key={c.id} value={c.id} label={c.name}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isNew" label="是否新品">
            <Select placeholder="请选择">
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="图片 URL（可选，优先于上传文件）"
            rules={[
              {
                validator: async (_, v) => {
                  const s = String(v ?? '').trim();
                  if (!s) return;
                  try {
                    new URL(s);
                  } catch {
                    throw new Error('请输入有效 URL');
                  }
                },
              },
            ]}
          >
            <Input placeholder="https://…" allowClear />
          </Form.Item>
          <Form.Item name="image" label="产品图片（与 URL 二选一即可）">
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
              支持 JPG、PNG；建议 300×200；新建时须上传文件或填写上方图片 URL。
            </p>
          </Form.Item>
          <div className="form-actions">
            <Button onClick={handleCancel}>取消</Button>
            <ManagementWriteGate>
              <Button
                type="primary"
                onClick={() => void handleSubmit()}
                loading={submitLoading}
              >
                {isEditing ? '更新' : '创建'}
              </Button>
            </ManagementWriteGate>
          </div>
        </Form>
      </Modal>
    </AdminListPageShell>
  );
};

export default ProductManagement;
