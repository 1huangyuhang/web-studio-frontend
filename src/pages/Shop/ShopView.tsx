import {
  Card,
  Row,
  Col,
  Slider,
  Input,
  Select,
  Tag,
  Button,
  Alert,
  Empty,
  Modal,
} from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useState, useMemo, type KeyboardEvent } from 'react';
import { handleImageError, handleImageLoad } from '@/utils/imageUtils';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import { mediaDisplaySrc } from '@/types/dto';
import type { ShopProduct } from './useShopPage';
import { useShopPage } from './useShopPage';
import { MarketingListSkeleton } from '@/components/page-shell/MarketingListSkeleton';

const { Option } = Select;

function categoryTagKeyDown(e: KeyboardEvent, onSelect: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onSelect();
  }
}

export default function ShopView() {
  const { products, loading, error, loadProducts } = useShopPage();
  const [detailProduct, setDetailProduct] = useState<ShopProduct | null>(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );

  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('精选');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const resetFilters = () => {
    setPriceRange([0, 50000]);
    setSearchKeyword('');
    setSortBy('精选');
    setSelectedCategory('全部');
  };

  const handleFavoriteToggle = (productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const filteredProducts = products.filter((product: ShopProduct) => {
    const inPriceRange =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());
    const matchesCategory =
      selectedCategory === '全部' || product.category === selectedCategory;
    return inPriceRange && matchesSearch && matchesCategory;
  });

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

  if (loading) {
    return <MarketingListSkeleton items={8} />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert
          message="暂时无法加载"
          description={error}
          type="error"
          showIcon
          action={
            <SiteButton
              size="sm"
              variant="primary"
              onClick={() => void loadProducts()}
            >
              重试
            </SiteButton>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="shop-filters-stack">
        <div className="search-sort-section">
          <div className="search-box">
            <Input
              placeholder="搜索产品名称..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={handleSearchChange}
              className="search-input"
              allowClear
            />
          </div>
          <div className="sort-options">
            <Select
              value={sortBy}
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
            value={priceRange}
            onChange={(v) => handlePriceChange(v as number[])}
            className="price-slider"
            marks={{
              0: '¥0',
              10000: '¥10000',
              25000: '¥25000',
              50000: '¥50000',
            }}
          />
        </div>

        <div className="category-filters">
          <div className="section-header">
            <span>产品分类</span>
          </div>
          <div className="category-list">
            <Tag
              role="button"
              tabIndex={0}
              aria-pressed={selectedCategory === '全部'}
              className={`category-tag ${selectedCategory === '全部' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('全部')}
              onKeyDown={(e) =>
                categoryTagKeyDown(e, () => handleCategoryChange('全部'))
              }
            >
              全部
            </Tag>
            {categories.map((category, index) => (
              <Tag
                key={index}
                role="button"
                tabIndex={0}
                aria-pressed={selectedCategory === category}
                className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
                onKeyDown={(e) =>
                  categoryTagKeyDown(e, () => handleCategoryChange(category))
                }
              >
                {category}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="products-section">
        <div className="section-header">
          <span>产品列表</span>
          <span className="product-count">
            共 {sortedProducts.length} 件商品
          </span>
        </div>

        {sortedProducts.length === 0 ? (
          <Empty className="list-empty" description="暂无符合筛选条件的产品">
            <SiteButton variant="outline" onClick={resetFilters}>
              清除筛选条件
            </SiteButton>
          </Empty>
        ) : (
          <Row gutter={[24, 24]} className="products-grid">
            {sortedProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Card hoverable className="product-card">
                  <div className="product-image-wrapper">
                    <img
                      src={mediaDisplaySrc(product)}
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
                      aria-label={
                        favorites.has(product.id) ? '取消收藏' : '收藏'
                      }
                    />
                    {product.isNew && <Tag className="new-tag">新品</Tag>}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-category">{product.category}</div>
                    <div className="product-price">
                      ¥{product.price.toFixed(2)}
                    </div>
                    <SiteButton
                      variant="primary"
                      className="product-detail-btn"
                      onClick={() => setDetailProduct(product)}
                    >
                      查看详情
                    </SiteButton>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={detailProduct?.name ?? '产品详情'}
        open={detailProduct != null}
        onCancel={() => setDetailProduct(null)}
        footer={
          <Button type="primary" onClick={() => setDetailProduct(null)}>
            关闭
          </Button>
        }
        width={560}
        className="shop-product-detail-modal"
        styles={{ body: { maxHeight: 'min(70vh, 520px)', overflowY: 'auto' } }}
      >
        {detailProduct ? (
          <div className="shop-product-detail-body">
            <div className="shop-product-detail-thumb">
              <img
                src={mediaDisplaySrc(detailProduct)}
                alt=""
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
            <p className="shop-product-detail-meta">
              <span>{detailProduct.category}</span>
              {detailProduct.isNew ? <Tag color="red">新品</Tag> : null}
            </p>
            <p className="shop-product-detail-price">
              ¥{detailProduct.price.toFixed(2)}
            </p>
            <p
              className="shop-product-detail-hint"
              style={{ color: 'var(--app-text-secondary)' }}
            >
              更多规格与库存请咨询客服或前往线下展厅。
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
