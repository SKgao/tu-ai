import React from 'react';
import { Button, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';

export function MenuSearchForm({ form, loading, initialValues, onSearch, onReset, onCreate }) {
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSearch}>
      <div className="toolbar-grid toolbar-grid--compact">
        <Form.Item label="菜单名" name="menuName">
          <Input allowClear placeholder="输入菜单名" />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加菜单
            </Button>
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
