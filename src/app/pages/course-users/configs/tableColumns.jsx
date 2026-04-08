function formatCurrency(value) {
  return `${(Number(value || 0) / 100).toFixed(2)} 元`;
}

export function createCourseUserColumns() {
  return [
    { title: '精品课程名称', dataIndex: 'textbookName', render: (value) => value || '-' },
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => value ?? '-' },
    { title: '手机号', dataIndex: 'mobile', render: (value) => value || '无' },
    { title: '用户名', dataIndex: 'realName', render: (value) => value || '无' },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (value) => (value === 1 ? '男' : value === 2 ? '女' : '-'),
    },
    { title: '付款金额', dataIndex: 'payAmt', render: (value) => formatCurrency(value) },
    { title: '购买时间', dataIndex: 'buyAt', render: (value) => value || '-' },
    { title: '开课时间', dataIndex: 'beginAt', render: (value) => value || '-' },
    { title: '结课时间', dataIndex: 'endAt', render: (value) => value || '-' },
  ];
}
