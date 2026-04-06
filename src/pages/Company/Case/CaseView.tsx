import { Card, List, Typography, Tag, Pagination } from 'antd';
import { useState } from 'react';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '@/utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

const MAX_VISIBLE_TAGS = 4;

interface CaseItem {
  id: number;
  title: string;
  client: string;
  category: string;
  date: string;
  description: string;
  image: string;
  tags: string[];
}

export default function CaseView() {
  const [caseData] = useState<CaseItem[]>([
    {
      id: 1,
      title: '高端红木家具定制项目',
      client: '某知名企业',
      category: '家具定制',
      date: '2024-10-15',
      description:
        '为某知名企业定制了一系列高端红木家具，包括会议桌、办公椅、展示柜等。项目采用了优质的红木材料，结合现代设计理念，打造出既具有传统韵味又符合现代办公需求的家具产品。',
      image: 'https://picsum.photos/seed/高端红木家具定制项目/600/400',
      tags: ['高端定制', '办公家具', '红木'],
    },
    {
      id: 2,
      title: '别墅红木装修工程',
      client: '私人客户',
      category: '装修工程',
      date: '2024-09-20',
      description:
        '为一栋豪华别墅提供了全套红木装修解决方案，包括地板、楼梯、门窗、家具等。项目注重细节处理，将传统红木工艺与现代装修技术相结合，营造出温馨舒适的居住环境。',
      image: 'https://picsum.photos/seed/别墅红木装修工程/600/400',
      tags: ['别墅装修', '全屋定制', '传统工艺'],
    },
    {
      id: 3,
      title: '酒店红木家具配套项目',
      client: '五星级酒店',
      category: '商业配套',
      date: '2024-08-10',
      description:
        '为一家五星级酒店提供了全套红木家具配套服务，包括客房家具、餐厅家具、大堂家具等。项目规模大，要求高，我们凭借丰富的经验和专业的团队，按时完成了所有任务，获得了客户的高度评价。',
      image: 'https://picsum.photos/seed/酒店红木家具配套项目/600/400',
      tags: ['酒店配套', '商业空间', '大规模项目'],
    },
    {
      id: 4,
      title: '红木工艺品开发项目',
      client: '文化创意公司',
      category: '工艺品开发',
      date: '2024-07-05',
      description:
        '与一家文化创意公司合作，开发了一系列具有文化内涵的红木工艺品。项目融合了传统工艺与现代设计，推出了多款深受市场欢迎的产品，为客户创造了良好的经济效益。',
      image: 'https://picsum.photos/seed/红木工艺品开发项目/600/400',
      tags: ['工艺品开发', '文化创意', '设计创新'],
    },
    {
      id: 5,
      title: '红木家具展览策划',
      client: '家具协会',
      category: '展览策划',
      date: '2024-06-15',
      description:
        '为家具协会策划了一场红木家具展览，展示了来自全国各地的优质红木家具产品。展览吸引了大量观众和媒体关注，提升了红木家具的知名度和影响力。',
      image: 'https://picsum.photos/seed/红木家具展览策划/600/400',
      tags: ['展览策划', '行业活动', '品牌推广'],
    },
  ]);

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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = caseData.slice(startIndex, endIndex);

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
                    src={processImageUrl(item.image)}
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
