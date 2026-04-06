import React from 'react';
import { Button, type ButtonProps } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export type AdminTableRowActionsProps = {
  children: React.ReactNode;
  /** 操作列内水平居中（如产品/新闻固定右列） */
  center?: boolean;
  className?: string;
};

/**
 * 列表「操作」列统一容器：间距、换行与对齐。
 */
export function AdminTableRowActions({
  children,
  center,
  className,
}: AdminTableRowActionsProps) {
  return (
    <div
      className={[
        'admin-table-row-actions',
        center && 'admin-table-row-actions--center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

const baseActionClass = 'admin-table-action';

/** 编辑：描边主色，与顶栏「新增」主按钮形成层次区分 */
export function AdminTableActionEdit({
  children = '编辑',
  className,
  icon = <EditOutlined />,
  size = 'small',
  variant = 'outlined',
  color = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <Button
      size={size}
      variant={variant}
      color={color}
      icon={icon}
      className={[baseActionClass, `${baseActionClass}--edit`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Button>
  );
}

/** 删除：描边危险色 */
export function AdminTableActionDelete({
  children = '删除',
  className,
  icon = <DeleteOutlined />,
  size = 'small',
  variant = 'outlined',
  danger,
  ...rest
}: ButtonProps) {
  return (
    <Button
      size={size}
      variant={variant}
      danger={danger ?? true}
      icon={icon}
      className={[baseActionClass, `${baseActionClass}--delete`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Button>
  );
}

/**
 * 辅助操作：详情、下载、标为已读等（轻量 link，与编辑/删除同列并排时视觉一致）
 */
export function AdminTableActionAux({
  children,
  className,
  type = 'link',
  size = 'small',
  ...rest
}: ButtonProps) {
  return (
    <Button
      type={type}
      size={size}
      className={[baseActionClass, `${baseActionClass}--aux`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Button>
  );
}
