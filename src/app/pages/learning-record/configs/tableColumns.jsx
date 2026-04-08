export function createLearningRecordColumns() {
  return [
    { title: '教材名称', dataIndex: 'textbookName', render: (value) => value || '-' },
    { title: '单元名称', dataIndex: 'unitName', render: (value) => value || '无' },
    { title: 'Part 名称', dataIndex: 'partName', render: (value) => value || '无' },
    { title: '关卡名称', dataIndex: 'sessionName', render: (value) => value || '无' },
    { title: '学习时间', dataIndex: 'createdAt', render: (value) => value || '-' },
  ];
}
