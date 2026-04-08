import React from 'react';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import { SearchFormActions } from '@/app/components/forms/SearchFormActions';
import {
  INITIAL_MEMBER_FILTERS,
  SEX_OPTIONS,
  SORT_OPTIONS,
  YES_NO_OPTIONS,
} from '../utils/forms';

export function MemberSearchForm({
  form,
  loading,
  levelOptions,
  onSearch,
  onReset,
  onRefresh,
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={INITIAL_MEMBER_FILTERS}
      onFinish={onSearch}
    >
      <div className="toolbar-grid toolbar-grid--books">
        <Form.Item label="注册开始时间" name="registerStartTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="注册结束时间" name="registerEndTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="会员开始时间" name="payStartTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="会员结束时间" name="payEndTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="到期开始时间" name="expireStartTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="到期结束时间" name="expireEndTime">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
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
