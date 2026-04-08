import React from 'react';
import { Button, Space } from 'antd';

export function SearchFormActions({
  loading,
  onReset,
  children,
  searchText = '搜索',
  resetText = '重置',
}) {
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
