import { Button, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { DateTimeRangeField } from '@/app/components/forms/DateTimeRangeField';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import { INITIAL_FEEDBACK_FILTERS } from '../utils/forms';
import type { MemberFeedbackSearchValues } from '../types';

type MemberFeedbackSearchFormProps = {
  form: FormInstance<MemberFeedbackSearchValues>;
  loading: boolean;
  onSearch: FormProps<MemberFeedbackSearchValues>['onFinish'];
  onReset: () => void;
  onRefresh: () => void;
};

export function MemberFeedbackSearchForm({
  form,
  loading,
  onSearch,
  onReset,
  onRefresh,
}: MemberFeedbackSearchFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={INITIAL_FEEDBACK_FILTERS}
      onFinish={onSearch}
    >
      <div className="toolbar-grid toolbar-grid--units">
        <DateTimeRangeField
          form={form}
          startName="startTime"
          endName="endTime"
          placeholder={['开始时间', '结束时间']}
        />
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
