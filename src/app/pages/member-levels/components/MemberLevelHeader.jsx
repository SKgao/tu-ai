import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function MemberLevelHeader({
  count,
  loading,
  onCreate,
  onRefresh,
}) {
  return (
    <Space wrap>
      <Typography.Text type="secondary">共 {count} 个会员等级</Typography.Text>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        添加会员等级
      </Button>
      <Button onClick={onRefresh} loading={loading}>
        刷新
      </Button>
    </Space>
  );
}
