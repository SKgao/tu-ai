import React from 'react';
import { TableActionBar, TableActionButton } from '@/app/components/TableActionBar';
import { TableImageLink } from '@/app/components/TableImageLink';
import { formatCurrencyCent } from '@/app/lib/formatters';

export function createSpecialCourseColumns({ onEdit, onToggleStatus, onDelete, submitting }) {
  return [
    { title: '课程 ID', dataIndex: 'textbookId', render: (value) => value || '-' },
    { title: '课程名称', dataIndex: 'textbookName', render: (value) => value || '-' },
    { title: '辅导老师', dataIndex: 'teacher', render: (value) => value || '-' },
    { title: '详情图', dataIndex: 'iconDetail', render: (value) => <TableImageLink src={value} alt="详情图" /> },
    { title: '优惠券图', dataIndex: 'iconTicket', render: (value) => <TableImageLink src={value} alt="优惠券图" /> },
    { title: '原始金额', dataIndex: 'orgAmt', render: (value) => formatCurrencyCent(value) },
    { title: '实际金额', dataIndex: 'amt', render: (value) => formatCurrencyCent(value) },
    { title: '数量', dataIndex: 'num', render: (value) => value ?? '-' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => (
        <span
          className={
            Number(value) === 1 ? 'status-pill status-pill--success' : 'status-pill status-pill--danger'
          }
        >
          {Number(value) === 1 ? '启动' : '关闭'}
        </span>
      ),
    },
    {
      title: '开课方式',
      dataIndex: 'type',
      render: (value) => (Number(value) === 1 ? '统一开课' : '购买生效'),
    },
    { title: '预售开始', dataIndex: 'saleBeginAt', render: (value) => value || '-' },
    { title: '预售结束', dataIndex: 'saleEndAt', render: (value) => value || '-' },
    { title: '开课时间', dataIndex: 'beginAt', render: (value) => value || '-' },
    { title: '结课时间', dataIndex: 'endAt', render: (value) => value || '-' },
    { title: '微信号', dataIndex: 'chatNo', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, course) => (
        <TableActionBar>
          <TableActionButton onClick={() => onEdit(course)}>编辑</TableActionButton>
          <TableActionButton onClick={() => onToggleStatus(course)} disabled={submitting}>
            {Number(course.status) === 1 ? '下架' : '上架'}
          </TableActionButton>
          <TableActionButton danger onClick={() => onDelete(course)} disabled={submitting}>
            删除
          </TableActionButton>
        </TableActionBar>
      ),
    },
  ];
}
