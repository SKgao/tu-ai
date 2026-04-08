import { formatCurrencyCent } from '@/app/lib/formatters';

export function createOrderColumns() {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => value ?? '-' },
    { title: '真实姓名', dataIndex: 'realName', render: (value) => value || '无' },
    { title: '商品名称', dataIndex: 'itemName', render: (value) => value || '-' },
    { title: '订单号', dataIndex: 'orderNo', render: (value) => value || '-' },
    { title: '订单金额', dataIndex: 'orderAmount', render: (value) => formatCurrencyCent(value, '0.00 元') },
    { title: '支付方式', dataIndex: 'payTypeName', render: (value) => value || '无' },
    { title: '支付状态', dataIndex: 'orderStatusDesc', render: (value) => value || '-' },
    { title: '支付时间', dataIndex: 'payTime', render: (value) => value || '-' },
    {
      title: '第三方交易号',
      dataIndex: 'outNo',
      className: 'table-content-cell',
      render: (value) => value || '无',
    },
    {
      title: '取消原因',
      dataIndex: 'cancelReason',
      className: 'table-content-cell',
      render: (value) => value || '无',
    },
    { title: '活动名称', dataIndex: 'activityName', render: (value) => value || '无' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
  ];
}
