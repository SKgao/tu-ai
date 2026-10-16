import { Button, Form, Space } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DateTimeRangeField } from '@/app/components/forms/DateTimeRangeField';
import { INITIAL_FILTERS } from '../utils/forms';
import type { SpecialCourseSearchValues } from '../types';

type SpecialCourseSearchFormProps = {
  form: FormInstance<SpecialCourseSearchValues>;
  loading: boolean;
  onSearch: FormProps<SpecialCourseSearchValues>['onFinish'];
  onReset: () => void;
  onCreate: () => void;
  onRefresh: () => void;
};

export function SpecialCourseSearchForm({
  form,
  loading,
  onSearch,
  onReset,
  onCreate,
  onRefresh,
}: SpecialCourseSearchFormProps) {
  return (
    <Form form={form} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={onSearch}>
      <div className="toolbar-grid toolbar-grid--books">
        <DateTimeRangeField form={form} placeholder={['预售开始时间', '预售结束时间']} />
        <Form.Item label=" ">
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={loading}>
              搜索
            </Button>
            <Button onClick={onReset} disabled={loading}>
              重置
            </Button>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加精品课程
            </Button>
            <Button onClick={onRefresh} loading={loading}>
              刷新
            </Button>
          </Space>
        </Form.Item>
      </div>
    </Form>
  );
}
