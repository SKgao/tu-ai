import { Button, DatePicker, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import type { UserSearchValues } from '../types';

type UserSearchFormProps = {
  form: FormInstance<UserSearchValues>;
  loading: boolean;
  onSearch: FormProps<UserSearchValues>['onFinish'];
  onReset: () => void;
  onCreate: () => void;
};

export function UserSearchForm({
  form,
  loading,
  onSearch,
  onReset,
  onCreate,
}: UserSearchFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ account: '', startTime: undefined, endTime: undefined }}
      onFinish={onSearch}
    >
      <div className="toolbar-grid">
        <Form.Item label="用户名" name="account">
          <Input placeholder="输入用户名" />
        </Form.Item>
        <Form.Item label="开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加用户
            </Button>
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
