import { useMemo } from 'react';
import { App, Button, Card, Form, Input, Select, Space, Table, Typography } from 'antd';
import type { FormProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { listCourseOrders } from '@/app/services/course-orders';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createCourseOrderColumns } from './configs/tableColumns';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';
import type {
  CourseOrderFilterValues,
  CourseOrderListResult,
  CourseOrderQuery,
  CourseOrderRecord,
} from './types';

const INITIAL_FILTERS: CourseOrderFilterValues = {
  tutuNumber: '',
  orderNo: '',
  payType: undefined,
  orderStatus: undefined,
  textbookId: undefined,
};

const INITIAL_QUERY: CourseOrderQuery = {
  tutuNumber: '',
  orderNo: '',
  payType: '',
  orderStatus: '',
  textbookId: '',
  pageNum: 1,
  pageSize: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const PAY_TYPE_OPTIONS = [
  { value: '1', label: '微信' },
  { value: '2', label: '支付宝' },
];

const ORDER_STATUS_OPTIONS = [
  { value: '1', label: '待支付' },
  { value: '2', label: '已支付' },
  { value: '3', label: '用户取消' },
  { value: '4', label: '超时关闭' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeSearchValues(values: CourseOrderFilterValues): Partial<CourseOrderQuery> {
  return {
    tutuNumber: values.tutuNumber?.trim() || '',
    orderNo: values.orderNo?.trim() || '',
    payType: values.payType || '',
    orderStatus: values.orderStatus || '',
    textbookId: values.textbookId || '',
  };
}

export function CourseOrderManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<CourseOrderFilterValues>();
  const courseOptions = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const columns = useMemo(() => createCourseOrderColumns(), []);
  const {
    query,
    data: orders,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<CourseOrderQuery, CourseOrderListResult, CourseOrderRecord>({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) =>
      (await listCourseOrders(currentQuery)) as CourseOrderListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '精品课程订单列表加载失败'),
  });

  useMountEffect(() => {
    return ensureCourseOptions().catch((error) => {
      message.error(getErrorMessage(error, '课程筛选项加载失败'));
    });
  });

  const handleSearch: FormProps<CourseOrderFilterValues>['onFinish'] = (values) => {
    applyFilters(normalizeSearchValues(values));
  };

  function handleReset(): void {
    form.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="精品课程订单"
        description="这一页对应旧版 `courseOrder` 模块，先按新版 antd 组件重构筛选表单、表格与分页。"
      />

      <PageToolbarCard>
        <Form form={form} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={handleSearch}>
          <div className="toolbar-grid toolbar-grid--books">
            <Form.Item label="图图号" name="tutuNumber">
              <Input allowClear placeholder="输入图图号" />
            </Form.Item>
            <Form.Item label="订单号" name="orderNo">
              <Input allowClear placeholder="输入订单号" />
            </Form.Item>
            <Form.Item label="支付类型" name="payType">
              <Select allowClear placeholder="全部" options={PAY_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item label="支付状态" name="orderStatus">
              <Select allowClear placeholder="全部" options={ORDER_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item label="精品课程" name="textbookId">
              <Select
                allowClear
                placeholder="全部"
                options={courseOptions.map((item) => ({
                  value: String(item.textbookId),
                  label: String(item.textbookName),
                }))}
              />
            </Form.Item>
            <Form.Item label=" ">
              <Space wrap>
                <Button type="primary" htmlType="submit" loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset} disabled={loading}>
                  重置
                </Button>
                <Button onClick={() => reload().catch(() => {})} loading={loading}>
                  刷新
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </PageToolbarCard>

      <Card title="精品课程订单列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table<CourseOrderRecord>
          rowKey={(row) => String(row.orderNo || row.id || 'course-order')}
          columns={columns}
          dataSource={orders}
          loading={loading}
          scroll={{ x: 1480 }}
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
