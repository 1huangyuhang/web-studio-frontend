import { Card, Row, Col, Typography, Tag, Alert, Empty } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarFilled,
} from '@ant-design/icons';
import { handleImageError, handleImageLoad } from '@/utils/imageUtils';
import { mediaDisplaySrc } from '@/types/dto';
import { useCoursesPage } from './useCoursesPage';
import { MarketingListSkeleton } from '@/components/page-shell/MarketingListSkeleton';

const { Title, Text, Paragraph } = Typography;

const MAX_VISIBLE_TAGS = 4;

export default function CoursesView() {
  const { courses, loading, error, loadCourses } = useCoursesPage();

  if (loading) {
    return <MarketingListSkeleton items={8} />;
  }

  if (error) {
    return (
      <div className="loading-container error-container">
        <Alert
          message="暂时无法加载"
          description={error}
          type="error"
          showIcon
          action={
            <SiteButton
              size="sm"
              variant="primary"
              onClick={() => void loadCourses()}
            >
              重试
            </SiteButton>
          }
        />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="courses-empty-wrap">
        <Empty
          description="暂无课程，请稍后再试"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <SiteButton variant="primary" onClick={() => void loadCourses()}>
            重新加载
          </SiteButton>
        </Empty>
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]} className="courses-grid">
      {courses.map((course) => (
        <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
          <Card hoverable className="course-card">
            <div className="course-image-wrapper">
              <img
                src={mediaDisplaySrc(course)}
                alt={course.title}
                className="course-image"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
            <div className="course-info">
              <div className="course-meta">
                <div className="meta-item">
                  <UserOutlined className="meta-icon" />
                  <Text
                    className="meta-text"
                    ellipsis
                    title={course.instructor}
                  >
                    {course.instructor}
                  </Text>
                </div>
                <div className="meta-item">
                  <ClockCircleOutlined className="meta-icon" />
                  <Text className="meta-text" ellipsis title={course.duration}>
                    {course.duration}
                  </Text>
                </div>
                <div className="meta-item">
                  <BookOutlined className="meta-icon" />
                  <Text
                    className="meta-text"
                    ellipsis
                    title={`${course.students}人学习`}
                  >
                    {course.students}人学习
                  </Text>
                </div>
              </div>

              <Title level={3} className="course-title">
                {course.title}
              </Title>

              <div className="course-rating">
                {[...Array(5)].map((_, index) => (
                  <StarFilled
                    key={index}
                    className={`rating-star ${index < Math.floor(course.rating) ? 'filled' : ''}`}
                  />
                ))}
                <Text className="rating-text">{course.rating}</Text>
              </div>

              <Paragraph className="course-description">
                {course.description}
              </Paragraph>

              <div className="course-tags">
                {course.tags.slice(0, MAX_VISIBLE_TAGS).map((tag, index) => (
                  <Tag key={index} className="course-tag">
                    {tag}
                  </Tag>
                ))}
                {course.tags.length > MAX_VISIBLE_TAGS ? (
                  <Tag className="course-tag course-tag--more">
                    +{course.tags.length - MAX_VISIBLE_TAGS}
                  </Tag>
                ) : null}
              </div>

              <div className="course-footer">
                <div className="course-price">¥{course.price}</div>
                <SiteButton variant="primary" className="enroll-btn">
                  立即报名
                </SiteButton>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
