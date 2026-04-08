import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function CourseBagActivityToolbar({
  courseName,
  courseId,
  loading,
  onBack,
  onCreate,
  onRefresh,
}) {
  return (
    <div className="toolbar-grid toolbar-grid--books">
      <div>
        <Typography.Title level={4} style={{ marginBottom: 4 }}>
          {courseName || '未指定课程'}
        </Typography.Title>
        <Typography.Text type="secondary">当前课程 ID: {courseId || '-'}</Typography.Text>
      </div>
      <div>
        <Space wrap>
          <Button onClick={onBack}>返回上一页</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} disabled={!courseId}>
            添加课程活动
          </Button>
          <Button onClick={onRefresh} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>
    </div>
  );
}
