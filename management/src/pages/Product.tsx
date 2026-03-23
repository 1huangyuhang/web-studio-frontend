import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Upload,
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import './index.less';

const { Option } = Select;

// 产品类型定义
interface Product {
  id: number;
  name: string;
  price: string | number;
  category: string;
  image: string;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProductManagement: React.FC = () => {
  // 状态管理
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 获取产品数据
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products', {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });
      // 由于axios拦截器已经返回了response.data，直接使用response
      // 检查response是否为数组，确保数据格式正确
      let processedData: Product[] = [];

      if (Array.isArray(response)) {
        // 处理数据，确保每个字段只包含对应数据
        processedData = response.map((item) => {
          // 确保数据格式正确，避免字段包含多个数据项
          const product: Product = {
            id:
              typeof item.id === 'number' ? item.id : parseInt(String(item.id)),
            name: typeof item.name === 'string' ? item.name : String(item.name),
            price: item.price || 0,
            category:
              typeof item.category === 'string'
                ? item.category
                : String(item.category),
            image: typeof item.image === 'string' ? item.image : '',
            isNew: Boolean(item.isNew),
            createdAt:
              typeof item.createdAt === 'string'
                ? item.createdAt
                : new Date().toISOString(),
            updatedAt:
              typeof item.updatedAt === 'string'
                ? item.updatedAt
                : new Date().toISOString(),
          };
          return product;
        });
      } else if (response?.data && Array.isArray(response.data)) {
        // 如果返回的是分页格式 { data: [...], pagination: {...} }，则使用response.data
        processedData = response.data.map((item) => {
          // 确保数据格式正确，避免字段包含多个数据项
          const product: Product = {
            id:
              typeof item.id === 'number' ? item.id : parseInt(String(item.id)),
            name: typeof item.name === 'string' ? item.name : String(item.name),
            price: item.price || 0,
            category:
              typeof item.category === 'string'
                ? item.category
                : String(item.category),
            image: typeof item.image === 'string' ? item.image : '',
            isNew: Boolean(item.isNew),
            createdAt:
              typeof item.createdAt === 'string'
                ? item.createdAt
                : new Date().toISOString(),
            updatedAt:
              typeof item.updatedAt === 'string'
                ? item.updatedAt
                : new Date().toISOString(),
          };
          return product;
        });
      }

      setProducts(processedData);
      setTotal(processedData.length);

      // 清除所有相关缓存，确保下次获取最新数据
      apiCache.clear();
    } catch (error) {
      console.error('获取产品列表失败:', error);
      message.error(
        `获取产品列表失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // 初始加载数据和WebSocket事件监听
  useEffect(() => {
    fetchProducts();

    // 添加WebSocket事件监听器
    const handleProductCreated = (product: Product) => {
      setProducts((prev) => [...prev, product]);
      message.success(`新产品 "${product.name}" 已添加`);
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/products{}');
    };

    const handleProductUpdated = (updatedProduct: Product) => {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      message.success(`产品 "${updatedProduct.name}" 已更新`);
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/products{}');
    };

    const handleProductDeleted = (productId: number) => {
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      message.success('产品已删除');
      // 清除缓存，确保下次获取最新数据
      apiCache.delete('get:/products{}');
    };

    // 注册事件监听器
    wsService.on('product:created', handleProductCreated);
    wsService.on('product:updated', handleProductUpdated);
    wsService.on('product:deleted', handleProductDeleted);

    // 组件卸载时移除事件监听器
    return () => {
      wsService.off('product:created', handleProductCreated);
      wsService.off('product:updated', handleProductUpdated);
      wsService.off('product:deleted', handleProductDeleted);
    };
  }, []);

  // 页码变化时重新获取数据
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // 打开创建/编辑模态框
  const showModal = (product?: Product) => {
    if (product) {
      setIsEditing(true);
      setCurrentProduct(product);
      form.setFieldsValue(product);
    } else {
      setIsEditing(false);
      setCurrentProduct(null);
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
      formData.append('name', values.name);
      formData.append('price', values.price.toString());
      formData.append('category', values.category);
      formData.append('isNew', values.isNew ? 'true' : 'false');

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
        formData.append('image', blob, 'product-image.jpg');
      }

      // 打印FormData内容，用于调试
      console.log('FormData内容:', {
        name: values.name,
        price: values.price,
        category: values.category,
        isNew: values.isNew,
        hasImage: !!values.image,
      });

      let response;
      if (isEditing && currentProduct) {
        // 乐观更新：立即更新本地UI
        const updatedProduct = {
          ...currentProduct,
          ...values,
        };

        // 更新本地状态
        setProducts((prev) =>
          prev.map((product) =>
            product.id === currentProduct.id ? updatedProduct : product
          )
        );

        // 更新产品，使用FormData
        response = await axiosInstance.put(
          `/products/${currentProduct.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        message.success('产品更新成功');
        // 清除产品列表缓存
        apiCache.delete('get:/products{}');
      } else {
        // 乐观更新：立即更新本地UI
        // 生成临时ID，后续会被实际ID替换
        const tempProduct = {
          id: Date.now(), // 临时ID
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isNew: values.isNew || false,
        };

        // 更新本地状态
        setProducts((prev) => [...prev, tempProduct]);

        // 创建产品，使用FormData
        response = await axiosInstance.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('产品创建成功');
        // 清除产品列表缓存
        apiCache.delete('get:/products{}');
      }

      console.log('API响应:', response);

      // WebSocket会自动更新数据，不需要重新获取列表
      setIsModalVisible(false);
      setLoading(false);
    } catch (error: any) {
      console.error('操作失败:', error);
      console.error('错误详情:', error.response?.data);
      // 显示更详细的错误信息
      const errorMessage =
        error.response?.data?.error || error.message || '操作失败';
      message.error(errorMessage);
      setLoading(false);
    }
  };

  // 删除产品
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确定要删除这个产品吗？',
      onOk: async () => {
        try {
          // 乐观更新：立即从本地状态中删除
          setProducts((prev) => prev.filter((product) => product.id !== id));

          // 删除产品
          await axiosInstance.delete(`/products/${id}`);
          message.success('产品删除成功');
          // 清除产品列表缓存
          apiCache.delete('get:/products{}');
          // WebSocket会自动更新数据，不需要重新获取列表
        } catch (error: any) {
          console.error('删除产品失败:', error);
          message.error(error.response?.data?.error || '删除产品失败');
          // 错误回滚：恢复删除的产品
          fetchProducts(); // 重新获取产品列表，确保数据一致性
        }
      },
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: false,
      // 确保只显示名称，不显示其他数据
      render: (text: string) => {
        return typeof text === 'string' ? text : String(text);
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'center' as const,
      render: (text: string | number) => {
        if (text === undefined || text === null) return '-';
        const price = typeof text === 'string' ? parseFloat(text) : text;
        return `¥${price.toFixed(2)}`;
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      align: 'center' as const,
      render: (text: string) => {
        return text || '-';
      },
    },
    {
      title: '产品图片',
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
            alt="产品图片"
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
      align: 'center' as const,
      render: (text: boolean) => (text ? '是' : '否'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      align: 'center' as const,
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
      dataIndex: 'action',
      key: 'action',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: Product) => (
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
        <h1>产品管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          新增产品
        </Button>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={products}
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

      {/* 产品表单模态框 */}
      <Modal
        title={isEditing ? '编辑产品' : '新增产品'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" initialValues={{ isNew: false }}>
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
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="家具">家具</Option>
              <Option value="工艺品">工艺品</Option>
              <Option value="原材料">原材料</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isNew" label="是否新品">
            <Select placeholder="请选择">
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="产品图片"
            rules={[{ required: true, message: '请上传产品图片' }]}
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

export default ProductManagement;
