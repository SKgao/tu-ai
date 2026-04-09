import { Button, DatePicker, Form, Select } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import type { UnitBookOption, UnitSearchValues } from '../types';

type UnitSearchFormProps = {
  form: FormInstance<UnitSearchValues>;
  loading: boolean;
  books: UnitBookOption[];
  initialTextbookId: string;
  onSearch: FormProps<UnitSearchValues>['onFinish'];
  onReset: () => void;
  onCreate: () => void;
  onBack: () => void;
};

export function UnitSearchForm({
  form,
  loading,
  books,
  initialTextbookId,
  onSearch,
  onReset,
  onCreate,
  onBack,
}: UnitSearchFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        startTime: undefined,
        endTime: undefined,
        textBookId: initialTextbookId || undefined,
      }}
      onFinish={onSearch}
    >
      <div className="toolbar-grid toolbar-grid--units">
        <Form.Item label="开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="教材" name="textBookId">
          <Select
            allowClear
            placeholder="全部"
            options={books.map((item) => ({
              value: String(item.id),
              label: item.name,
            }))}
          />
        </Form.Item>
        <Form.Item label=" ">
          <SearchFormActions loading={loading} onReset={onReset}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加单元
            </Button>
            <Button onClick={onBack}>返回教材</Button>
          </SearchFormActions>
        </Form.Item>
      </div>
    </Form>
  );
}
