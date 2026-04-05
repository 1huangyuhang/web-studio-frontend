import { Row, Col, Typography } from 'antd';
import type { HomeStatRow } from '@/services/siteAssets';

const { Paragraph } = Typography;

type Props = {
  statsIntroTitle: string;
  statsIntroBody: string;
  stats: HomeStatRow[];
};

export default function HomeStatsSection({
  statsIntroTitle,
  statsIntroBody,
  stats,
}: Props) {
  return (
    <div className="stats-section home-unified-flow-section">
      <div className="stats-description">
        <div className="stats-text">
          <div className="stats-kicker">{statsIntroTitle}</div>
          <Paragraph className="stats-body">{statsIntroBody}</Paragraph>
        </div>
      </div>

      <Row gutter={[16, 24]} className="stats-grid" wrap>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={`${stat.label}-${index}`}>
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
  );
}
