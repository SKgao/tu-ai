import React from 'react';
import { Button, Form, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';

export function CourseUserSearchForm({
  form,
  loading,
  routeTutuNumber,
  initialValues,
  books,
  sexOptions,
  onSearch,
  onReset,
  onCreate,
  onBack,
}) {
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSearch}>
      <div className="toolbar-grid toolbar-grid--books">
        <Form.Item label="精品课程" name="textbookId">
          <Select
            allowClear
            placeholder="全部"
            options={books.map((item) => ({
              value: String(item.textbookId),
              label: item.textbookName,
            }))}
          />
        </Form.Item>
        <Form.Item label="图图号" name="tutuNumber">
          <Input allowClear placeholder="输入图图号" />
        </Form.Item>
        <Form.Item label="手机号" name="mobile">
          <Input allowClear placeholder="输入手机号" />
        </Form.Item>
        <Form.Item label="用户名" name="realName">
          <Input allowClear placeholder="输入用户名" />
        </Form.Item>
        <Form.Item label="性别" name="sex">
          <Select allowClear placeholder="全部" options={sexOptions} />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              开通精品课程
            </Button>
            {routeTutuNumber ? <Button onClick={onBack}>返回上一层</Button> : null}
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
