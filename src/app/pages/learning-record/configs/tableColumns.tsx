import type { TableColumnsType } from 'antd';
import { formatDateTime } from '@/app/lib/dateTime';
import type { LearningRecord } from '../types';

export function createLearningRecordColumns(): TableColumnsType<LearningRecord> {
  return [
    { title: '教材名称', dataIndex: 'textbookName', render: (value) => String(value || '-') },
    { title: '单元名称', dataIndex: 'unitName', render: (value) => String(value || '无') },
    { title: 'Part 名称', dataIndex: 'partName', render: (value) => String(value || '无') },
    { title: '关卡名称', dataIndex: 'sessionName', render: (value) => String(value || '无') },
    { title: '学习时间', dataIndex: 'createdAt', render: (value) => formatDateTime(value) },
  ];
}
