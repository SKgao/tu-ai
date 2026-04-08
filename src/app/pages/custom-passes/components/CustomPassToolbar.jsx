import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EMPTY_TOPIC_FORM } from '../utils/forms';

export function CustomPassToolbar({
  textbookId,
  sessionId,
  partsId,
  loading,
  topicForm,
  onCreatePass,
  onOpenTopic,
  onBack,
  onRefresh,
}) {
  return (
    <div className="toolbar-grid toolbar-grid--compact">
      <Typography.Text type="secondary">
        当前教材 ID: {textbookId || '-'}，大关卡 ID: {sessionId || '-'}，Part ID: {partsId || '-'}
      </Typography.Text>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreatePass}>
          添加小关卡
        </Button>
        {partsId ? (
          <Button
            type="primary"
            ghost
            onClick={() => {
              topicForm.setFieldsValue({ ...EMPTY_TOPIC_FORM });
              onOpenTopic();
            }}
          >
            添加题目
          </Button>
        ) : null}
        <Button onClick={onBack}>返回上一层</Button>
        <Button onClick={onRefresh} loading={loading}>
          刷新
        </Button>
      </Space>
    </div>
  );
}
