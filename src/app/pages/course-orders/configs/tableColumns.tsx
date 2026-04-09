import type { TableColumnsType } from 'antd';
import { formatCurrencyCent } from '@/app/lib/formatters';
import type { CourseOrderRecord } from '../types';

export function createCourseOrderColumns(): TableColumnsType<CourseOrderRecord> {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => String(value ?? '-') },
    { title: '真实姓名', dataIndex: 'realName', render: (value) => String(value || '无') },
    { title: '商品名称', dataIndex: 'itemName', render: (value) => String(value || '-') },
    { title: '订单号', dataIndex: 'orderNo', render: (value) => String(value || '-') },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      render: (value) => formatCurrencyCent(value as string | number | null | undefined, '0.00 元'),
    },
    { title: '支付方式', dataIndex: 'payTypeName', render: (value) => String(value || '无') },
    { title: '支付状态', dataIndex: 'orderStatusDesc', render: (value) => String(value || '-') },
    { title: '支付时间', dataIndex: 'payTime', render: (value) => String(value || '-') },
    {
      title: '第三方交易号',
      dataIndex: 'outNo',
      className: 'table-content-cell',
      render: (value) => String(value || '无'),
    },
    {
      title: '取消原因',
      dataIndex: 'cancelReason',
      className: 'table-content-cell',
      render: (value) => String(value || '无'),
    },
    { title: '活动名称', dataIndex: 'activityName', render: (value) => String(value || '无') },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => String(value || '-') },
  ];
}
