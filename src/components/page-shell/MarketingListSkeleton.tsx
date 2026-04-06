import { Card, Col, Row, Skeleton } from 'antd';
import type { ColProps } from 'antd';
import './MarketingListSkeleton.less';

export type MarketingListSkeletonProps = {
  /** 骨架卡片数量 */
  items?: number;
  /** 与列表页 `Col` 一致的栅格，默认对齐商店/课程四列大屏 */
  colProps?: ColProps;
  className?: string;
};

/**
 * 营销列表页加载占位：栅格与真实卡片列数一致，避免布局跳动。
 */
export function MarketingListSkeleton({
  items = 8,
  colProps = { xs: 24, sm: 12, md: 8, lg: 6 },
  className = 'marketing-list-skeleton',
}: MarketingListSkeletonProps) {
  return (
    <Row gutter={[24, 24]} className={className} aria-hidden>
      {Array.from({ length: items }, (_, i) => (
        <Col {...colProps} key={i}>
          <Card className="marketing-list-skeleton__card">
            <div className="marketing-list-skeleton__media">
              <Skeleton.Image
                active
                className="marketing-list-skeleton__image"
              />
            </div>
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '70%' }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export type MarketingNewsListSkeletonProps = {
  rows?: number;
  className?: string;
};

/** 新闻列表：横向图文卡片骨架 */
export function MarketingNewsListSkeleton({
  rows = 3,
  className = 'marketing-news-list-skeleton',
}: MarketingNewsListSkeletonProps) {
  return (
    <div className={className} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Card key={i} className="marketing-news-list-skeleton__card">
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <div className="marketing-news-list-skeleton__thumb-wrap">
                <Skeleton.Image
                  active
                  className="marketing-news-list-skeleton__thumb"
                />
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Skeleton active paragraph={{ rows: 3 }} title />
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );
}
