import { Row, Col, Typography, Button } from 'antd';
import { useEffect, useRef } from 'react';
import './index.less';
import {
  AnimatedImage,
  ScrollAnimatedSection,
  ScrollyVideo,
  animateNumber,
  checkAndAnimate,
  checkVisibility,
} from '@/animations';
import HoverText from '@/components/ui/HoverText';

// 使用更便捷的默认导入方式
import { redwoodImages } from '@/assets/images/redwood';

// 解构赋值的便捷方式，只导入需要使用的图片
const {
  redwood1,
  redwoodDetail1,
  redwoodDetail2,
  redwoodDetail3,
  redwoodDetail4,
  redwoodDetail5,
  redwoodScenery,
  redwoodFactory,
  redwoodRaw1,
} = redwoodImages;

const { Title, Paragraph } = Typography;

const Home = () => {
  // 数据统计 - 使用实际数字，便于数字动画
  const stats = [
    { label: '客户', value: 10000, color: '#80322E' },
    { label: '产品系列', value: 60, color: '#80322E' },
    { label: '销售地区', value: 150, color: '#80322E' },
    { label: '年销量', value: 1000000, color: '#80322E' },
  ];

  // 存储已动画元素的引用，避免重复执行
  const animatedElementsRef = useRef<Set<Element>>(new Set());

  // 产品类别
  const productCategories = [
    { id: 1, name: '红木家具', image: redwood1 },
    { id: 2, name: '红木饰品', image: redwoodDetail1 },
    { id: 3, name: '红木工艺', image: redwoodDetail2 },
    { id: 4, name: '红木定制', image: redwoodDetail3 },
  ];

  // 初始化动画观察器
  useEffect(() => {
    // 检测 Intersection Observer 支持
    if (!('IntersectionObserver' in window)) {
      console.warn(
        'IntersectionObserver not supported, animations will not work'
      );
      return;
    }

    // 创建 Intersection Observer 实例
    const observer = new IntersectionObserver(checkAndAnimate, {
      threshold: [0, 0.1, 0.2, 0.5, 0.8, 1.0], // 多阈值检测，提高触发机会
      rootMargin: '-100px 0px -100px 0px', // 扩大检测范围，确保元素进入视口时能触发
    });

    // 观察所有需要动画的元素
    const cards = document.querySelectorAll('.animate-card');
    const numbers = document.querySelectorAll('.animate-number');

    // 观察所有卡片和数字元素
    cards.forEach((card) => observer.observe(card));
    numbers.forEach((number) => observer.observe(number));

    // 立即手动检查一次，确保已经在视口中的数字动画也能触发
    const checkImmediately = () => {
      numbers.forEach((element) => {
        if (checkVisibility(element)) {
          if (element.classList.contains('animate-number')) {
            animateNumber(element);
          }
        }
      });
    };

    // 立即执行一次检查
    checkImmediately();

    // 保存当前的 ref 值，用于清理函数
    const savedAnimatedElementsRef = animatedElementsRef.current;

    // 清理函数
    return () => {
      observer.disconnect();
      if ((window as any).scrollTimeout) {
        clearTimeout((window as any).scrollTimeout);
      }
      savedAnimatedElementsRef.clear();
    };
  }, []);

  return (
    <div className="home-page-wrapper">
      <div className="home-page">
        {/* 滚动视频动画区 */}
        <ScrollyVideo
          src="https://scrollyvideo.js.org/goldengate.mp4"
          id="redwood-video"
        />

        {/* 顶部图片展示区 */}
        <ScrollAnimatedSection
          className="top-gallery-section"
          animationType="fadeIn"
          duration={1000}
          threshold={0.2}
        >
          <Row gutter={[0, 0]} className="gallery-grid">
            <Col xs={24} md={12}>
              <div className="gallery-item large">
                <AnimatedImage src={redwoodRaw1} alt="红木原材料" />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="gallery-item">
                <AnimatedImage src={redwoodDetail1} alt="红木细节" />
              </div>
              <div className="gallery-item">
                <AnimatedImage src={redwoodFactory} alt="红木工厂" />
              </div>
            </Col>
          </Row>

          <div className="gallery-text">
            <Title level={3} className="gallery-title">
              <HoverText text="红木古韵 传承利好" />
            </Title>
            <Paragraph className="gallery-description">
              张家港作为中国红木产业的重要基地，凭借得天独厚的地理位置和丰富的木材资源，
              已经成为全国最大的红木家具生产和销售中心之一。
            </Paragraph>
          </div>
        </ScrollAnimatedSection>

        {/* 数据统计区 - 根据参考图像更新 */}
        <div className="stats-section">
          {/* 统计描述文本 */}
          <div className="stats-description">
            <Paragraph className="stats-text">
              深受行业领导者信赖
              <br />
              林之源为众多行业提供可靠的红木解决方案，从高端家具到工艺品制造等，助力客户获得竞争优势。
            </Paragraph>
          </div>

          {/* 数据统计 */}
          <Row gutter={[0, 0]} className="stats-grid">
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} lg={6} key={index}>
                <div className="stat-item animate-card">
                  <div
                    className="stat-value animate-number"
                    data-target={stat.value}
                    style={{ color: stat.color }}
                  >
                    0
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* 价值主张区 */}
        <ScrollAnimatedSection
          className="value-proposition-section"
          animationType="fadeIn"
          duration={1000}
          threshold={0.2}
        >
          <div className="value-content">
            <div className="value-text">
              <Title level={3} className="value-title">
                <HoverText text="传承红木文化，创新工艺技术" />
              </Title>
              <Paragraph className="value-description">
                我们致力于传承和发扬红木文化，结合现代工艺技术，
                打造出既有传统韵味又符合现代审美的红木产品。
              </Paragraph>
            </div>
            <div className="value-image">
              <AnimatedImage src={redwoodScenery} alt="红木风景" />
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* 产品系列区 */}
        <ScrollAnimatedSection
          className="products-section"
          animationType="slideUp"
          duration={1000}
          threshold={0.2}
        >
          <div className="section-header">
            <Title level={3} className="section-title">
              产品系列
            </Title>
            <Button type="link" className="section-more">
              查看更多
            </Button>
          </div>

          <Row gutter={[0, 0]} className="products-grid">
            {productCategories.map((category, index) => (
              <Col xs={24} sm={12} md={12} lg={6} key={index}>
                <div className="product-item animate-card">
                  <div className="product-image-wrapper">
                    <AnimatedImage src={category.image} alt={category.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{category.name}</h3>
                    <Button type="link" className="product-more">
                      了解详情
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </ScrollAnimatedSection>

        {/* 品牌传承区 - 根据参考图像更新 */}
        <ScrollAnimatedSection
          className="heritage-section"
          animationType="fadeIn"
          duration={1000}
          threshold={0.2}
        >
          <div className="heritage-content">
            <div className="heritage-text">
              <Title level={3} className="heritage-title">
                <HoverText text="匠心工艺，传承百年" />
              </Title>
              <Paragraph className="heritage-description">
                我们拥有一支技艺精湛的工匠团队，
                传承百年红木工艺，每一件产品都凝聚了匠人的心血和智慧。
              </Paragraph>
            </div>
            <div className="heritage-images">
              <div className="heritage-item">
                <AnimatedImage src={redwoodDetail3} alt="红木细节" />
              </div>
              <div className="heritage-item">
                <AnimatedImage src={redwoodDetail4} alt="红木细节" />
              </div>
              <div className="heritage-item">
                <AnimatedImage src={redwoodDetail5} alt="红木细节" />
              </div>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* 普通的 section 内容，取消拖动效果 */}
        <div className="action-section-container">
          <div className="action-content">
            <Title level={3} className="action-title">
              <HoverText text="懂红木才会爱上红木" />
            </Title>
            <Paragraph className="action-description">
              我们邀请您深入了解红木文化，感受红木的独特魅力，
              选择最适合您的红木产品。
            </Paragraph>
            <Button type="primary" size="large" className="action-button">
              立即咨询
            </Button>
          </div>
        </div>
      </div>

      {/* 页脚内容，直接放在页面最后面 */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-about">
            <Title level={4} className="footer-title">
              关于我们
            </Title>
            <Paragraph className="footer-description">
              我们是一支深耕红木产业的专业团队，致力于通过构建系统化、标准化的产业服务体系，推动红木市场整体品质与运营效率的提升。
            </Paragraph>
            <Paragraph className="footer-description">
              我们以红木原材流通、精细加工、高端家具制造及收藏品级成品交易为核心，持续解决红木企业在合规溯源、生产管理、工艺标准与市场流通等环节中面临的关键问题，助力红木产业实现长期稳健发展。
            </Paragraph>
            <Button type="primary" className="contact-btn">
              保持联系
            </Button>
          </div>
          <div className="footer-info">
            <div className="company-info">
              <div className="company-name">My Company</div>
              <div className="company-address">张家港市金港镇江海路</div>
              <div className="company-address">张家港名贵木材交易中心</div>
              <div className="company-address">C库11、13号</div>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">+86 139104171782</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-text">1265345823@qq.com</span>
              </div>
            </div>
            <div className="social-links">
              <a href="#" className="social-link">
                <span className="social-icon">f</span>
              </a>
              <a href="#" className="social-link">
                <span className="social-icon">x</span>
              </a>
              <a href="#" className="social-link">
                <span className="social-icon">in</span>
              </a>
              <a href="#" className="social-link">
                <span className="social-icon">📷</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="copyright-text">Copyright © 林之源</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
