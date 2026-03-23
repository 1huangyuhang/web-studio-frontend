import { Card, Row, Col, Typography, Button, Tag } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useState } from 'react';
import './index.less';
import {
  processImageUrl,
  handleImageError,
  handleImageLoad,
} from '../../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

// 课程数据类型
interface CourseItem {
  id: number;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  description: string;
  image: string;
  tags: string[];
}

const Courses = () => {
  // 课程数据
  const [courses] = useState<CourseItem[]>([
    {
      id: 1,
      title: '红木雕刻基础课程',
      instructor: '张老师',
      category: '雕刻工艺',
      duration: '8周',
      students: 128,
      rating: 4.8,
      price: 1280,
      description:
        '学习红木雕刻的基础知识和技能，包括工具使用、雕刻技法、图案设计等。适合初学者学习。',
      image: 'https://picsum.photos/seed/红木雕刻基础课程/500/300',
      tags: ['基础课程', '雕刻工艺', '新手入门'],
    },
    {
      id: 2,
      title: '高级红木家具制作',
      instructor: '李大师',
      category: '家具制作',
      duration: '12周',
      students: 85,
      rating: 4.9,
      price: 2880,
      description:
        '深入学习高级红木家具制作工艺，包括榫卯结构、拼接技法、表面处理等。适合有一定基础的学员。',
      image: 'https://picsum.photos/seed/高级红木家具制作/500/300',
      tags: ['高级课程', '家具制作', '传统工艺'],
    },
    {
      id: 3,
      title: '红木鉴定与评估',
      instructor: '王专家',
      category: '鉴定评估',
      duration: '6周',
      students: 156,
      rating: 4.7,
      price: 1980,
      description:
        '学习红木的种类识别、质量评估、市场行情分析等知识。适合收藏家和从业者学习。',
      image: 'https://picsum.photos/seed/红木鉴定与评估/500/300',
      tags: ['鉴定评估', '收藏投资', '市场分析'],
    },
    {
      id: 4,
      title: '现代红木设计课程',
      instructor: '刘设计师',
      category: '设计创新',
      duration: '8周',
      students: 98,
      rating: 4.6,
      price: 1680,
      description:
        '学习现代红木设计理念和方法，将传统工艺与现代设计相结合，创造出符合时代需求的红木作品。',
      image: 'https://picsum.photos/seed/现代红木设计课程/500/300',
      tags: ['设计创新', '现代理念', '创意设计'],
    },
  ]);

  return (
    <div className="courses-page">
      {/* 页面标题 */}
      <div className="page-title">
        <Title level={1}>红木课程</Title>
        <Paragraph>学习红木工艺，传承传统文化</Paragraph>
      </div>

      {/* 课程列表 */}
      <Row gutter={[24, 24]} className="courses-grid">
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card className="course-card">
              <div className="course-image-wrapper">
                <img
                  src={processImageUrl(course.image)}
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
                    <Text className="meta-text">{course.instructor}</Text>
                  </div>
                  <div className="meta-item">
                    <ClockCircleOutlined className="meta-icon" />
                    <Text className="meta-text">{course.duration}</Text>
                  </div>
                  <div className="meta-item">
                    <BookOutlined className="meta-icon" />
                    <Text className="meta-text">{course.students}人学习</Text>
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
                  {course.tags.map((tag, index) => (
                    <Tag key={index} className="course-tag">
                      {tag}
                    </Tag>
                  ))}
                </div>

                <div className="course-footer">
                  <div className="course-price">¥{course.price}</div>
                  <Button type="primary" className="enroll-btn">
                    立即报名
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Courses;
