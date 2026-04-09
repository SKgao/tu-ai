import { Button, DatePicker, Form, Select, Space } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { INITIAL_FILTERS } from '../utils/forms';
import type { ActivityOptionRecord, ActivitySearchValues } from '../types';

type ActivitySearchFormProps = {
  form: FormInstance<ActivitySearchValues>;
  loading: boolean;
  activityOptions: ActivityOptionRecord[];
  onSearch: FormProps<ActivitySearchValues>['onFinish'];
  onReset: () => void;
  onCreate: () => void;
  onRefresh: () => void;
};

export function ActivitySearchForm({
  form,
  loading,
  activityOptions,
  onSearch,
  onReset,
  onCreate,
  onRefresh,
}: ActivitySearchFormProps) {
  return (
    <Form form={form} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={onSearch}>
      <div className="toolbar-grid toolbar-grid--books">
        <Form.Item label="活动开始时间" name="startTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="活动结束时间" name="endTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="活动筛选" name="id">
          <Select
            allowClear
            placeholder="全部"
            options={activityOptions.map((item) => ({
              value: String(item.id),
              label: item.title,
            }))}
          />
        </Form.Item>
        <Form.Item label=" ">
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={loading}>
              搜索
            </Button>
            <Button onClick={onReset} disabled={loading}>
              重置
            </Button>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={onCreate}>
              添加活动
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
