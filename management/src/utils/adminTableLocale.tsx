import { Empty } from 'antd';

/** Ant Design Table locale.emptyText：区分无数据与筛选无结果 */
export function adminListTableLocale(hasActiveFilters: boolean) {
  return {
    emptyText: (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          hasActiveFilters
            ? '没有符合条件的数据，可调整关键词或筛选条件'
            : '暂无数据'
        }
      />
    ),
  };
}
