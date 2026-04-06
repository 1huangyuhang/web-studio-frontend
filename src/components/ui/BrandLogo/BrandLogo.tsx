import './BrandLogo.less';

type Props = {
  className?: string;
  /** 顶栏等场景由外层按钮提供 accessible name，SVG 仅作装饰 */
  decorative?: boolean;
};

/**
 * 林之源：纯字标，衬线 + 大留白字距，与品牌克制、东方美学一致；无装饰图标。
 */
export default function BrandLogo({ className, decorative }: Props) {
  return (
    <svg
      className={['brand-logo', className].filter(Boolean).join(' ')}
      viewBox="0 0 200 40"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
    >
      {!decorative ? <title>林之源</title> : null}
      <text
        className="brand-logo__wordmark"
        x="100"
        y="26"
        textAnchor="middle"
        fill="currentColor"
      >
        林之源
      </text>
    </svg>
  );
}
