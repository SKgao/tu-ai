import React from 'react';
import { Button, DatePicker, Form, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';

export function BookSearchForm({
  form,
  loading,
  grades,
  versions,
  onSearch,
  onReset,
  onCreate,
}) {
  return (
    <Form form={form} layout="vertical" onFinish={onSearch}>
      <div className="toolbar-grid toolbar-grid--books">
        <Form.Item label="开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="年级" name="gradeId">
          <Select
            allowClear
            placeholder="全部"
            options={grades.map((item) => ({
              value: String(item.id),
              label: item.gradeName,
            }))}
          />
        </Form.Item>
        <Form.Item label="教材版本" name="bookVersionId">
          <Select
            allowClear
            placeholder="全部"
            options={versions.map((item) => ({
              value: String(item.id),
              label: item.name,
            }))}
          />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加教材
            </Button>
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
