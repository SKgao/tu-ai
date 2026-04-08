import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function PassToolbar({
  partsId,
  textbookId,
  loading,
  onCreate,
  onBack,
  onRefresh,
}) {
  return (
    <div className="toolbar-grid toolbar-grid--compact">
      <Typography.Text type="secondary">
        当前 Part ID: {partsId || '-'}，教材 ID: {textbookId || '-'}
      </Typography.Text>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          添加关卡
        </Button>
        <Button onClick={onBack}>返回 Part</Button>
        <Button onClick={onRefresh} loading={loading}>
          刷新
        </Button>
      </Space>
    </div>
  );
}
