import React from 'react';
import { Input, Space, Typography } from 'antd';

const { Search } = Input;

export type AdminListSearchBarProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /** 回车或点击搜索图标时回调（可选，不传则仅 onChange） */
  onSearch?: (value: string) => void;
  /** 右侧展示「共 n 条」 */
  totalCount?: number;
  /** 筛选行额外控件（分类下拉等） */
  extra?: React.ReactNode;
};

/**
 * 列表页统一关键词筛选：宽度、清除、与分页 total 提示一致。
 */
const AdminListSearchBar: React.FC<AdminListSearchBarProps> = ({
  placeholder,
  value,
  onChange,
  onSearch,
  totalCount,
  extra,
}) => {
  return (
    <div className="admin-list-search-bar">
      <Space
        wrap
        align="center"
        size="middle"
        className="admin-list-search-bar__main"
      >
        <Search
          allowClear
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSearch={onSearch ?? ((v) => onChange(v))}
          style={{ width: 300, maxWidth: '100%' }}
        />
        {extra}
      </Space>
      {totalCount !== undefined ? (
        <Typography.Text
          type="secondary"
          className="admin-list-search-bar__total"
        >
          共 {totalCount} 条
        </Typography.Text>
      ) : null}
    </div>
  );
};

export default AdminListSearchBar;
