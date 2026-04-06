import { useState } from 'react';
import { Card, List, Typography, Tag, Pagination, Alert, Empty } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '@/utils/imageUtils';
import { useCaseStudiesPage } from './useCaseStudiesPage';
import { MarketingListSkeleton } from '@/components/page-shell/MarketingListSkeleton';

const { Title, Text, Paragraph } = Typography;

const MAX_VISIBLE_TAGS = 4;

export default function CaseView() {
  const { caseData, loading, error, loadCases } = useCaseStudiesPage();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size != null) setPageSize(size);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <MarketingListSkeleton items={4} colProps={{ span: 24 }} />
      </div>
    );
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
              onClick={() => void loadCases()}
            >
              重试
            </SiteButton>
          }
        />
      </div>
    );
  }

  if (caseData.length === 0) {
    return (
      <div className="news-empty-wrap">
        <Empty description="暂无案例" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <SiteButton variant="primary" onClick={() => void loadCases()}>
            重新加载
          </SiteButton>
        </Empty>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = caseData.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <div className="case-content">
        <List
          grid={{ gutter: [24, 24], column: 1, xs: 1, sm: 1, md: 2, lg: 2 }}
          dataSource={currentData}
          renderItem={(item) => (
            <List.Item>
              <Card hoverable className="case-card">
                <div className="case-image-wrapper">
                  <img
                    src={processImageUrl(item.imageSrc)}
                    alt={item.title}
                    className="case-image"
                    loading="lazy"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
                <div className="case-info">
                  <div className="case-meta">
                    <Text className="meta-text client">{item.client}</Text>
                    <Text className="meta-text date">{item.date}</Text>
                  </div>
                  <Title level={3} className="case-title">
                    {item.title}
                  </Title>
                  <Paragraph className="case-description">
                    {item.description}
                  </Paragraph>
                  <div className="case-tags">
                    {item.tags.slice(0, MAX_VISIBLE_TAGS).map((tag, index) => (
                      <Tag key={index} className="case-tag">
                        {tag}
                      </Tag>
                    ))}
                    {item.tags.length > MAX_VISIBLE_TAGS ? (
                      <Tag className="case-tag case-tag--more">
                        +{item.tags.length - MAX_VISIBLE_TAGS}
                      </Tag>
                    ) : null}
                  </div>
                  <div className="case-actions">
                    <Text className="view-details">查看详情</Text>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>

      <div className="pagination-container">
        <Pagination
          current={currentPage}
          total={caseData.length}
          pageSize={pageSize}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条记录`}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePageSizeChange}
        />
      </div>
    </>
  );
}
