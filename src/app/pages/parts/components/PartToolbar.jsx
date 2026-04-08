import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function PartToolbar({
  unitId,
  textBookId,
  loading,
  onCreate,
  onBack,
  onRefresh,
}) {
  return (
    <div className="toolbar-grid toolbar-grid--compact">
      <Typography.Text type="secondary">
        当前单元 ID: {unitId || '-'}，教材 ID: {textBookId || '-'}
      </Typography.Text>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          添加 Part
        </Button>
        <Button onClick={onBack}>返回单元</Button>
        <Button onClick={onRefresh} loading={loading}>
          刷新
        </Button>
      </Space>
    </div>
  );
}
