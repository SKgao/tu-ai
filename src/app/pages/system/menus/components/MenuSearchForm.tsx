import { Button, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import type { MenuSearchValues } from '../types';

type MenuSearchFormProps = {
  form: FormInstance<MenuSearchValues>;
  loading: boolean;
  initialValues: MenuSearchValues;
  onSearch: FormProps<MenuSearchValues>['onFinish'];
  onReset: () => void;
  onCreate: () => void;
};

export function MenuSearchForm({
  form,
  loading,
  initialValues,
  onSearch,
  onReset,
  onCreate,
}: MenuSearchFormProps) {
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
