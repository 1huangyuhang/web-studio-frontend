/**
 * 数据分页展示组件
 * 功能：
 * 1. 清晰显示当前数据集合的总记录数量
 * 2. 明确标识每一页最多可展示的记录数量
 * 3. 提供用户可交互的记录数量选择功能
 * 4. 简洁的上一页/下一页导航
 * 5. 保持与整体界面设计风格的一致性
 */
import React from 'react';
import './SimplePagination.less';

// 分页组件属性接口
interface SimplePaginationProps {
  currentPage: number; // 当前页码
  pageSize: number; // 每页显示条数
  total: number; // 总记录数
  onChange: (page: number, size: number) => void; // 页码或每页条数变化时的回调函数
  pageSizeOptions?: number[]; // 每页显示条数选项
}

const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  pageSize,
  total,
  onChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  // 计算总页数
  const totalPages = Math.ceil(total / pageSize) || 1;

  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onChange(page, pageSize);
    }
  };

  // 处理每页显示条数变化
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    onChange(1, newPageSize); // 切换每页显示条数时，重置到第一页
  };

  return (
    <div className="simple-pagination">
      {/* 总记录数显示 */}
      <div className="pagination-info">共 {total} 条记录</div>

      {/* 上一页按钮 */}
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        &lt;
      </button>

      {/* 当前页码 */}
      <div className="pagination-current">{currentPage}</div>

      {/* 下一页按钮 */}
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        &gt;
      </button>

      {/* 每页显示条数选择器 */}
      <select
        className="pagination-select"
        value={pageSize}
        onChange={handlePageSizeChange}
        aria-label="每页显示条数"
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}条/页
          </option>
        ))}
      </select>
    </div>
  );
};

export default SimplePagination;
