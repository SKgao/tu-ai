import { Button, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import type { RoleSearchValues } from '../types';

type RoleSearchFormProps = {
  form: FormInstance<RoleSearchValues>;
  loading: boolean;
  initialValues: RoleSearchValues;
  onSearch: FormProps<RoleSearchValues>['onFinish'];
  onReset: () => void;
  onCreate: () => void;
};

export function RoleSearchForm({
  form,
  loading,
  initialValues,
  onSearch,
  onReset,
  onCreate,
}: RoleSearchFormProps) {
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSearch}>
      <div className="toolbar-grid toolbar-grid--compact">
        <Form.Item label="角色名" name="keyword">
          <Input placeholder="输入角色名" />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加角色
            </Button>
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
