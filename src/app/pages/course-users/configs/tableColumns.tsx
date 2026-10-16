import type { TableColumnsType } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';
import { formatDateTime } from '@/app/lib/dateTime';
import { formatCurrencyCent } from '@/app/lib/formatters';
import { MaskedPhoneText } from '@/app/components/MaskedPhoneText';
import type { CourseUserRecord } from '../types';

export function createCourseUserColumns(): TableColumnsType<CourseUserRecord> {
  return [
    { title: '精品课程名称', dataIndex: 'textbookName', render: (value) => String(value || '-') },
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => renderCopyableIdValue(value) },
    { title: '手机号', dataIndex: 'mobile', render: (value) => <MaskedPhoneText value={value} /> },
    { title: '用户名', dataIndex: 'realName', render: (value) => String(value || '无') },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (value) => (Number(value) === 1 ? '男' : Number(value) === 2 ? '女' : '-'),
    },
    { title: '付款金额', dataIndex: 'payAmt', render: (value) => formatCurrencyCent(value, '0.00 元') },
    { title: '购买时间', dataIndex: 'buyAt', render: (value) => formatDateTime(value) },
    { title: '开课时间', dataIndex: 'beginAt', render: (value) => formatDateTime(value) },
    { title: '结课时间', dataIndex: 'endAt', render: (value) => formatDateTime(value) },
  ];
}
