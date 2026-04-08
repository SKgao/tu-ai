import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function SessionToolbar({
  filterTextbookId,
  loading,
  onTextbookIdChange,
  onCreate,
  onBack,
  onRefresh,
}) {
  return (
    <div className="toolbar-grid toolbar-grid--compact">
      <Form.Item label="教材 ID" style={{ marginBottom: 0 }}>
        <Input
          value={filterTextbookId}
          onChange={(event) => onTextbookIdChange(event.target.value)}
          placeholder="输入教材 ID"
        />
      </Form.Item>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          添加大关卡
        </Button>
        <Button onClick={onBack}>返回教材</Button>
        <Button onClick={onRefresh} loading={loading}>
          刷新
        </Button>
      </Space>
    </div>
  );
}
