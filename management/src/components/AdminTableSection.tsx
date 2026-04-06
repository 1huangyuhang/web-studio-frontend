import React, { useRef } from 'react';
import { useAdminTableHorizontalWheel } from '@/hooks/useAdminTableHorizontalWheel';

export type AdminTableSectionProps = {
  children: React.ReactNode;
  /** 底部分页等，会包在 admin-pagination-wrap / admin-pagination-bar 内 */
  pagination?: React.ReactNode;
  className?: string;
};

/**
 * 列表页统一表格区块：卡片容器 + 可选分页 + 横向滚轮（rAF）与边缘渐变 class。
 */
const AdminTableSection: React.FC<AdminTableSectionProps> = ({
  children,
  pagination,
  className,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  useAdminTableHorizontalWheel(rootRef);

  const rootClass = ['admin-table-card', className].filter(Boolean).join(' ');

  return (
    <>
      <div ref={rootRef} className={rootClass} data-admin-table-scroll="1">
        {children}
      </div>
      {pagination != null ? (
        <div className="admin-pagination-wrap">
          <div className="admin-pagination-bar">{pagination}</div>
        </div>
      ) : null}
    </>
  );
};

export default AdminTableSection;
