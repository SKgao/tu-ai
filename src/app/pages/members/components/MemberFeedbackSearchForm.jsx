import React from 'react';
import { Button, DatePicker, Form, Input } from 'antd';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import { INITIAL_FEEDBACK_FILTERS } from '../utils/forms';

export function MemberFeedbackSearchForm({
  form,
  loading,
  onSearch,
  onReset,
  onRefresh,
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={INITIAL_FEEDBACK_FILTERS}
      onFinish={onSearch}
    >
      <div className="toolbar-grid toolbar-grid--units">
        <Form.Item label="开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="图图号" name="tutuNumber">
          <Input allowClear placeholder="输入图图号" />
        </Form.Item>
        <Form.Item label="手机号" name="mobile">
          <Input allowClear placeholder="输入手机号" />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button onClick={onRefresh} loading={loading}>
              刷新
            </Button>
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
