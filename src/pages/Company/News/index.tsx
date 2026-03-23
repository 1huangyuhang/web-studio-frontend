import {
  Card,
  List,
  Typography,
  Row,
  Col,
  Pagination,
  Spin,
  Alert,
} from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import './index.less';
import axiosInstance from '../../../services/api/axiosInstance';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '../../../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

// 新闻数据类型
interface NewsItem {
  id: number;
  title: string;
  date: string;
  time: string;
  summary: string;
  image: string;
}

const News = () => {
  // 新闻数据状态
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 错误状态
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // 处理页码变化
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 切换每页条数时，重置到第一页
  };

  // 从API获取新闻数据
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // 使用any类型临时解决类型问题，因为响应拦截器已经处理了响应数据
        const data: any = await axiosInstance.get('/news');
        // 将后端返回的数据转换为NewsItem类型
        // 由于响应拦截器已经处理，直接使用data.data
        const formattedNews: NewsItem[] = data.data.map((news: any) => ({
          id: news.id,
          title: news.title,
          date: news.date,
          time: news.time,
          summary: news.summary,
          image: news.image,
        }));
        setNewsData(formattedNews);
        setError(null);
      } catch (err) {
        setError('获取新闻数据失败，请稍后重试');
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news-page">
      {/* 页面标题 */}
      <div className="page-header">
        <Title level={1}>新闻动态</Title>
        <Text>了解公司最新动态和行业资讯</Text>
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
          {/* 新闻列表 */}
          <div className="news-content">
            <List
              grid={{ gutter: 24, column: 1 }}
              dataSource={newsData}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Card hoverable className="news-card">
                    <Row gutter={[24, 0]}>
                      <Col xs={24} md={8}>
                        <div className="news-image-wrapper">
                          <img
                            src={processImageUrl(item.image)}
                            alt={item.title}
                            className="news-image"
                            loading="lazy"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                          />
                        </div>
                      </Col>
                      <Col xs={24} md={16}>
                        <div className="news-info">
                          <div className="news-meta">
                            <CalendarOutlined className="meta-icon" />
                            <Text className="meta-text">{item.date}</Text>
                            <ClockCircleOutlined className="meta-icon" />
                            <Text className="meta-text">{item.time}</Text>
                          </div>
                          <Title level={3} className="news-title">
                            {item.title}
                          </Title>
                          <Paragraph className="news-summary">
                            {item.summary}
                          </Paragraph>
                          <div className="news-actions">
                            <Text className="read-more">阅读全文</Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </div>

          {/* 分页 */}
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={newsData.length}
              pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条记录`}
              onChange={handlePageChange}
              onShowSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default News;
