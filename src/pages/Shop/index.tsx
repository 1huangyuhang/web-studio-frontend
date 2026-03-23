import {
  Card,
  Row,
  Col,
  Slider,
  Input,
  Select,
  Tag,
  Button,
  Spin,
  Alert,
} from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import './index.less';
import axiosInstance from '../../services/api/axiosInstance';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '../../utils/imageUtils';

const { Option } = Select;

// 产品数据类型
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  isNew?: boolean;
  isFavorite: boolean;
}

const Shop = () => {
  // 产品数据状态
  const [products, setProducts] = useState<Product[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 错误状态
  const [error, setError] = useState<string | null>(null);

  // 从API获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // 使用any类型临时解决类型问题，因为响应拦截器已经处理了响应数据
        const response: any = await axiosInstance.get('/products');
        // 后端返回的数据格式是 { data: [...], pagination: {...} }
        // 需要从response.data中获取实际的产品数组
        const data = response.data || [];
        // 将后端返回的数据转换为Product类型
        const formattedProducts: Product[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          category: product.category,
          image: product.image,
          isNew: product.isNew,
          isFavorite: false,
        }));
        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        setError('获取产品数据失败，请稍后重试');
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 产品分类（去重后）
  const categories = [...new Set(products.map((p) => p.category))];

  // 价格范围状态
  const [priceRange, setPriceRange] = useState([0, 50000]);
  // 搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');
  // 排序方式状态
  const [sortBy, setSortBy] = useState('精选');
  // 收藏状态
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  // 选中的分类
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  // 处理价格范围变化
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  // 处理搜索关键词变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 处理排序方式变化
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // 处理分类选择
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // 处理收藏/取消收藏
  const handleFavoriteToggle = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  // 过滤和排序产品
  const filteredProducts = products.filter((product) => {
    // 价格过滤
    const inPriceRange =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    // 关键词过滤
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());
    // 分类过滤
    const matchesCategory =
      selectedCategory === '全部' || product.category === selectedCategory;
    return inPriceRange && matchesSearch && matchesCategory;
  });

  // 排序产品
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case '价格: 从低到高':
        return a.price - b.price;
      case '价格: 从高到低':
        return b.price - a.price;
      case '最新上架':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  return (
    <div className="shop-page">
      {/* 页面标题 */}
      <div className="page-title">
        <h1>红木产品展示</h1>
        <p>精选优质红木产品，为您的生活增添雅致</p>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : error ? (
        <div className="error-container">
          <Alert message="错误" description={error} type="error" showIcon />
        </div>
      ) : (
        <>
          {/* 搜索和排序 */}
          <div className="search-sort-section">
            <div className="search-box">
              <Input
                placeholder="搜索产品名称..."
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div className="sort-options">
              <Select
                defaultValue="精选"
                style={{ width: 180 }}
                onChange={handleSortChange}
                className="sort-select"
              >
                <Option value="精选">排序方式: 精选</Option>
                <Option value="价格: 从低到高">价格: 从低到高</Option>
                <Option value="价格: 从高到低">价格: 从高到低</Option>
                <Option value="最新上架">最新上架</Option>
              </Select>
            </div>
          </div>

          {/* 价格范围滑块 */}
          <div className="price-range-section">
            <div className="section-header">
              <span>价格范围</span>
              <span className="price-values">
                ¥{priceRange[0]} - ¥{priceRange[1]}
              </span>
            </div>
            <Slider
              range
              min={0}
              max={50000}
              defaultValue={[0, 50000]}
              onChange={handlePriceChange}
              className="price-slider"
              marks={{
                0: '¥0',
                10000: '¥10000',
                25000: '¥25000',
                50000: '¥50000',
              }}
            />
          </div>

          {/* 分类筛选 */}
          <div className="category-filters">
            <div className="section-header">
              <span>产品分类</span>
            </div>
            <div className="category-list">
              <Tag
                className={`category-tag ${selectedCategory === '全部' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('全部')}
              >
                全部
              </Tag>
              {categories.map((category, index) => (
                <Tag
                  key={index}
                  className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Tag>
              ))}
            </div>
          </div>

          {/* 产品展示 */}
          <div className="products-section">
            <div className="section-header">
              <span>产品列表</span>
              <span className="product-count">
                共 {sortedProducts.length} 件商品
              </span>
            </div>

            <Row gutter={[24, 24]} className="products-grid">
              {sortedProducts.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Card className="product-card">
                    <div className="product-image-wrapper">
                      <img
                        src={processImageUrl(product.image)}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                      <Button
                        icon={
                          favorites.has(product.id) ? (
                            <HeartFilled />
                          ) : (
                            <HeartOutlined />
                          )
                        }
                        className={`favorite-btn ${favorites.has(product.id) ? 'favorite' : ''}`}
                        onClick={() => handleFavoriteToggle(product.id)}
                        type="text"
                      />
                      {product.isNew && <Tag className="new-tag">新品</Tag>}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-category">{product.category}</div>
                      <div className="product-price">
                        ¥{product.price.toFixed(2)}
                      </div>
                      <Button className="product-detail-btn">查看详情</Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default Shop;
