import React from 'react';
import { Button, DatePicker, Form, Input, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function SubjectSearchForm({
  form,
  loading,
  routeCustomsPassId,
  textbookId,
  partsId,
  sessionId,
  selectedCount,
  submitting,
  actionSubmitting,
  onSearch,
  onCreate,
  onBatchDelete,
  onBack,
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        startTime: undefined,
        endTime: undefined,
        customsPassName: '',
        sourceIds: '',
      }}
      onFinish={onSearch}
    >
      <div className="toolbar-grid">
        <Form.Item label="开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="关卡名称" name="customsPassName">
          <Input placeholder="请输入关卡名称" />
        </Form.Item>
        <Form.Item label="题目内容" name="sourceIds">
          <Input placeholder="请输入题目内容" />
        </Form.Item>
      </div>
      <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
        <Typography.Text type="secondary">
          当前关卡 ID: {routeCustomsPassId || '-'}，教材 ID: {textbookId || '-'}，Part ID: {partsId || '-'}，大关卡 ID: {sessionId || '-'}
        </Typography.Text>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={loading}>
            搜索
          </Button>
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
            添加题目
          </Button>
          <Button danger onClick={onBatchDelete} disabled={!selectedCount || loading || submitting || actionSubmitting}>
            批量删除
          </Button>
          <Button onClick={onBack}>返回上一层</Button>
        </Space>
      </div>
    </Form>
  );
}
