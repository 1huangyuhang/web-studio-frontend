import React from 'react';
import { Pagination } from 'antd';

// 分页组件属性接口
interface EnhancedPaginationProps {
  currentPage: number; // 当前页码
  pageSize: number; // 每页显示条数
  total: number; // 总记录数
  onChange: (page: number, size: number) => void; // 页码或每页条数变化时的回调函数
  pageSizeOptions?: string[]; // 每页显示条数选项
  showTotal?: (total: number) => React.ReactNode; // 总记录数展示函数
}

/**
 * 增强型分页组件
 * 功能：
 * 1. 清晰显示当前数据集合的总记录数量
 * 2. 明确标识每一页最多可展示的记录数量
 * 3. 提供用户可交互的记录数量选择功能
 * 4. 支持快速跳转
 * 5. 保持与整体界面设计风格的一致性
 */
const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  pageSize,
  total,
  onChange,
  pageSizeOptions = ['10', '20', '50', '100'],
  showTotal = (total) => `共 ${total} 条记录`,
}) => {
  return (
    <div className="pagination-container">
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={true}
        pageSizeOptions={pageSizeOptions}
        showTotal={showTotal}
        showQuickJumper={true}
        style={{ margin: 0 }}
      />
    </div>
  );
};

export default EnhancedPagination;
