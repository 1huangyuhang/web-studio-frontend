import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './SiteFooter.less';

const { Title, Paragraph } = Typography;

/**
 * 全站页脚：样式仅用 --ly-footer-* / 排版 var，与 Layout 组成首尾闭环
 */
const SiteFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="ly-footer" role="contentinfo">
      <div className="ly-footer__content ly-container ly-container--wide">
        <div className="ly-footer__about">
          <Title level={4} className="ly-footer__title">
            关于我们
          </Title>
          <Paragraph className="ly-footer__desc">
            我们是一支深耕红木产业的专业团队，致力于通过构建系统化、标准化的产业服务体系，推动红木市场整体品质与运营效率的提升。
          </Paragraph>
          <Paragraph className="ly-footer__desc">
            我们以红木原材流通、精细加工、高端家具制造及收藏品级成品交易为核心，持续解决红木企业在合规溯源、生产管理、工艺标准与市场流通等环节中面临的关键问题，助力红木产业实现长期稳健发展。
          </Paragraph>
          <Button
            type="primary"
            className="ly-footer__cta"
            onClick={() => navigate('/contact')}
          >
            保持联系
          </Button>
        </div>
        <div className="ly-footer__aside">
          <div className="ly-footer__company">
            <div className="ly-footer__brand">林之源</div>
            <div className="ly-footer__address">张家港市金港镇江海路</div>
            <div className="ly-footer__address">张家港名贵木材交易中心</div>
            <div className="ly-footer__address">C库11、13号</div>
          </div>
          <div className="ly-footer__contacts">
            <div className="ly-footer__contact-row">
              <span className="ly-footer__icon" aria-hidden>
                📞
              </span>
              <span className="ly-footer__contact-text">+86 13910417182</span>
            </div>
            <div className="ly-footer__contact-row">
              <span className="ly-footer__icon" aria-hidden>
                ✉️
              </span>
              <span className="ly-footer__contact-text">1265345823@qq.com</span>
            </div>
          </div>
          <div className="ly-footer__social" aria-label="社交媒体">
            <a href="#" className="ly-footer__social-link">
              <span className="ly-footer__social-icon">f</span>
            </a>
            <a href="#" className="ly-footer__social-link">
              <span className="ly-footer__social-icon">x</span>
            </a>
            <a href="#" className="ly-footer__social-link">
              <span className="ly-footer__social-icon">in</span>
            </a>
            <a href="#" className="ly-footer__social-link">
              <span className="ly-footer__social-icon">📷</span>
            </a>
          </div>
        </div>
      </div>
      <div className="ly-footer__bar">
        <div className="ly-container ly-container--wide">
          <div className="ly-footer__copyright">Copyright © 林之源</div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
