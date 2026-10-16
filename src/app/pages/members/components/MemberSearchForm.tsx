import { Button, Form, Input, Select } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import { DateTimeRangeField } from '@/app/components/forms/DateTimeRangeField';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import {
  INITIAL_MEMBER_FILTERS,
  SEX_OPTIONS,
  SORT_OPTIONS,
  YES_NO_OPTIONS,
} from '../utils/forms';
import type { MemberLevelSelectOption, MemberSearchValues } from '../types';

type MemberSearchFormProps = {
  form: FormInstance<MemberSearchValues>;
  loading: boolean;
  levelOptions: MemberLevelSelectOption[];
  onSearch: FormProps<MemberSearchValues>['onFinish'];
  onReset: () => void;
  onRefresh: () => void;
};

export function MemberSearchForm({
  form,
  loading,
  levelOptions,
  onSearch,
  onReset,
  onRefresh,
}: MemberSearchFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={INITIAL_MEMBER_FILTERS}
      onFinish={onSearch}
    >
      <div className="toolbar-grid toolbar-grid--books">
        <DateTimeRangeField
          form={form}
          startName="registerStartTime"
          endName="registerEndTime"
          placeholder={['注册开始时间', '注册结束时间']}
        />
        <DateTimeRangeField
          form={form}
          startName="payStartTime"
          endName="payEndTime"
          placeholder={['会员开始时间', '会员结束时间']}
        />
        <DateTimeRangeField
          form={form}
          startName="expireStartTime"
          endName="expireEndTime"
          placeholder={['到期开始时间', '到期结束时间']}
        />
        <Form.Item label="会员等级" name="userLevelIds">
          <Select
            mode="multiple"
            allowClear
            placeholder="请选择会员等级"
            options={levelOptions}
          />
        </Form.Item>
        <Form.Item label="图图号" name="tutuNumber">
          <Input allowClear placeholder="输入图图号" />
        </Form.Item>
        <Form.Item label="手机号" name="mobile">
          <Input allowClear placeholder="输入手机号" />
        </Form.Item>
        <Form.Item label="性别" name="sex">
          <Select allowClear placeholder="全部" options={SEX_OPTIONS} />
        </Form.Item>
        <Form.Item label="是否设置密码" name="hasSetPassword">
          <Select allowClear placeholder="全部" options={YES_NO_OPTIONS} />
        </Form.Item>
        <Form.Item label="图图号排序" name="sortUserId">
          <Select allowClear placeholder="默认" options={SORT_OPTIONS} />
        </Form.Item>
        <Form.Item label="邀请人数排序" name="sortInvite">
          <Select allowClear placeholder="默认" options={SORT_OPTIONS} />
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
