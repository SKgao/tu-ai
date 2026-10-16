import { useEffect, useMemo, useRef } from 'react';
import { App, Button, Card, Form, Input, Select, Space, Table, Typography } from 'antd';
import type { FormProps } from 'antd';
import { DateTimeRangeField } from '@/app/components/forms/DateTimeRangeField';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { toApiDateTime } from '@/app/lib/dateTime';
import { listMemberInfos } from '@/app/services/member-info';
import {
  selectMemberLevelOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';
import { createMemberInfoColumns } from './configs/tableColumns';
import type {
  MemberInfoListResult,
  MemberInfoQuery,
  MemberInfoRecord,
  MemberInfoSearchValues,
  MemberLevelFilterOption,
} from './types';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const INITIAL_FILTERS: MemberInfoSearchValues = {
  registerStartTime: undefined,
  registerEndTime: undefined,
  payStartTime: undefined,
  payEndTime: undefined,
  expireStartTime: undefined,
  expireEndTime: undefined,
  userLevelIds: [],
  tutuNumber: '',
  mobile: '',
};

const INITIAL_QUERY: MemberInfoQuery = {
  pageNum: 1,
  pageSize: 10,
  userLevelIds: [],
  expireStartTime: '',
  expireEndTime: '',
  payStartTime: '',
  payEndTime: '',
  registerStartTime: '',
  registerEndTime: '',
  tutuNumber: '',
  mobile: '',
};

function normalizeSearchValues(values: MemberInfoSearchValues): Partial<MemberInfoQuery> {
  return {
    userLevelIds: (values.userLevelIds || []).map((item) => Number(item)),
    expireStartTime: toApiDateTime(values.expireStartTime),
    expireEndTime: toApiDateTime(values.expireEndTime),
    payStartTime: toApiDateTime(values.payStartTime),
    payEndTime: toApiDateTime(values.payEndTime),
    registerStartTime: toApiDateTime(values.registerStartTime),
    registerEndTime: toApiDateTime(values.registerEndTime),
    tutuNumber: values.tutuNumber?.trim() || '',
    mobile: values.mobile?.trim() || '',
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeLevelOptions(items: Record<string, unknown>[]): MemberLevelFilterOption[] {
  return items
    .filter((item) => String(item.levelName ?? '') !== '普通用户')
    .map((item) => ({
      userLevel: String(item.userLevel ?? ''),
      levelName: String(item.levelName ?? ''),
    }))
    .filter((item) => Boolean(item.userLevel));
}

export function MemberInfoManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<MemberInfoSearchValues>();
  const didInitLevelsRef = useRef(false);
  const memberLevelOptions = useMemberCommerceOptionsStore(selectMemberLevelOptions);
  const ensureMemberLevelOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureMemberLevelOptions,
  );
  const columns = useMemo(() => createMemberInfoColumns(), []);
  const levelOptions = useMemo(
    () => normalizeLevelOptions(memberLevelOptions),
    [memberLevelOptions],
  );
  const {
    query,
    data: members,
    totalCount,
    loading,
    applyFilters,
    patchQuery,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<MemberInfoQuery, MemberInfoListResult, MemberInfoRecord>({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) => (await listMemberInfos(currentQuery)) as MemberInfoListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '会员信息列表加载失败'),
  });

  useMountEffect(() => {
    ensureMemberLevelOptions().catch((error: unknown) => {
      message.error(getErrorMessage(error, '会员等级列表加载失败'));
    });
  });

  useEffect(() => {
    if (didInitLevelsRef.current || !levelOptions.length) {
      return;
    }

    const selectedLevelIds = levelOptions.map((item) => item.userLevel);
    form.setFieldsValue({
      userLevelIds: selectedLevelIds,
    });
    patchQuery({
      userLevelIds: levelOptions.map((item) => Number(item.userLevel)),
    });
    didInitLevelsRef.current = true;
  }, [form, levelOptions, patchQuery]);

  const handleSearch: FormProps<MemberInfoSearchValues>['onFinish'] = (values) => {
    applyFilters(normalizeSearchValues(values));
  };

  function handleReset() {
    const selectedLevelIds = levelOptions.map((item) => item.userLevel);
    form.setFieldsValue({
      ...INITIAL_FILTERS,
      userLevelIds: selectedLevelIds,
    });
    applyFilters({
      ...INITIAL_QUERY,
      userLevelIds: selectedLevelIds.map((item) => Number(item)),
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="会员信息"
        description="这一页对应旧版 `memberInfo` 模块，先按新版 antd 组件重构多时间筛选、多选等级和数据表格。"
      />

      <PageToolbarCard>
        <Form form={form} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={handleSearch}>
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
                maxTagCount="responsive"
                options={levelOptions.map((item) => ({
                  value: item.userLevel,
                  label: item.levelName,
                }))}
              />
            </Form.Item>
            <Form.Item label="图图号" name="tutuNumber">
              <Input allowClear placeholder="输入图图号" />
            </Form.Item>
            <Form.Item label="手机号" name="mobile">
              <Input allowClear placeholder="输入手机号" />
            </Form.Item>
            <Form.Item label=" ">
              <Space wrap>
                <Button type="primary" htmlType="submit" loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset} disabled={loading}>
                  重置
                </Button>
                <Button onClick={() => void reload().catch(() => {})} loading={loading}>
                  刷新
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </PageToolbarCard>

      <Card
        title="会员信息列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table<MemberInfoRecord>
          rowKey={(row) => String(row.userId || row.tutuNumber || '')}
          columns={columns}
          dataSource={members}
          loading={loading}
          scroll={{ x: 1280 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>
    </div>
  );
}
