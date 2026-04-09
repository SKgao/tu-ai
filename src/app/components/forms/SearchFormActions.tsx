import type { ReactNode } from 'react';
import { Button, Space } from 'antd';

type SearchFormActionsProps = {
  loading?: boolean;
  onReset?: () => void;
  children?: ReactNode;
  searchText?: ReactNode;
  resetText?: ReactNode;
};

export function SearchFormActions({
  loading = false,
  onReset,
  children,
  searchText = '搜索',
  resetText = '重置',
}: SearchFormActionsProps) {
  return (
    <Space wrap>
      <Button type="primary" htmlType="submit" loading={loading}>
        {searchText}
      </Button>
      <Button onClick={onReset} disabled={loading}>
        {resetText}
      </Button>
      {children}
    </Space>
  );
}
