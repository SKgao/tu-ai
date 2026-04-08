import React, { useEffect, useMemo } from 'react';
import { App, Button, Card, Form, Input, Select, Space, Table, Typography } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { listOrders } from '@/app/services/orders';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createOrderColumns } from './configs/tableColumns';
import {
  selectOrderFilterOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const INITIAL_FILTERS = {
  tutuNumber: '',
  orderNo: '',
  itemId: undefined,
  payType: undefined,
  orderStatus: undefined,
  activityId: undefined,
  textbookId: undefined,
};

const INITIAL_QUERY = {
  tutuNumber: '',
  orderNo: '',
  itemId: '',
  payType: '',
  orderStatus: '',
  activityId: '',
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

function normalizeSearchValues(values) {
  return {
    tutuNumber: values.tutuNumber?.trim() || '',
    orderNo: values.orderNo?.trim() || '',
    itemId: values.itemId || '',
    payType: values.payType || '',
    orderStatus: values.orderStatus || '',
    activityId: values.activityId || '',
    textbookId: values.textbookId || '',
  };
}

export function OrderManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { memberLevelOptions, activityOptions, courseOptions } = useMemberCommerceOptionsStore(
    useShallow(selectOrderFilterOptions),
  );
  const ensureOrderFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureOrderFilterOptions,
  );
  const columns = useMemo(() => createOrderColumns(), []);
  const {
    query,
    data: orders,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: listOrders,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '订单列表加载失败'),
  });

  useEffect(() => {
    ensureOrderFilterOptions().catch((error) => {
      message.error(error?.message || '筛选项加载失败');
    });
  }, [ensureOrderFilterOptions, message]);

  function handleSearch(values) {
    applyFilters(normalizeSearchValues(values));
  }

  function handleReset() {
    form.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            订单管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `order` 模块，先按新版 antd 组件重构筛选表单、表格与分页。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={INITIAL_FILTERS}
          onFinish={handleSearch}
        >
          <div className="toolbar-grid toolbar-grid--books">
            <Form.Item label="图图号" name="tutuNumber">
              <Input allowClear placeholder="输入图图号" />
            </Form.Item>
            <Form.Item label="订单号" name="orderNo">
              <Input allowClear placeholder="输入订单号" />
            </Form.Item>
            <Form.Item label="会员等级" name="itemId">
              <Select
                allowClear
                placeholder="全部"
                options={memberLevelOptions.map((item) => ({
                  value: String(item.userLevel),
                  label: item.levelName,
                }))}
              />
            </Form.Item>
            <Form.Item label="支付类型" name="payType">
              <Select allowClear placeholder="全部" options={PAY_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item label="支付状态" name="orderStatus">
              <Select allowClear placeholder="全部" options={ORDER_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item label="活动筛选" name="activityId">
              <Select
                allowClear
                placeholder="全部"
                options={activityOptions.map((item) => ({
                  value: String(item.id),
                  label: item.title,
                }))}
              />
            </Form.Item>
            <Form.Item label="精品课程" name="textbookId">
              <Select
                allowClear
                placeholder="全部"
                options={courseOptions.map((item) => ({
                  value: String(item.textbookId),
                  label: item.textbookName,
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
      </Card>

      <Card
        title="订单列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table
          rowKey={(row) => row.orderNo || row.id}
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
