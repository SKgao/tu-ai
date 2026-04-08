import React from 'react';
import { TableActionBar, TableActionButton } from '@/app/components/TableActionBar';
import { TableImageLink } from '@/app/components/TableImageLink';
import { formatCurrencyCent } from '@/app/lib/formatters';

export function createActivityColumns({ onEdit, onToggleStatus, onDelete, submitting }) {
  return [
    { title: '活动名称', dataIndex: 'title', render: (value) => value || '-' },
    {
      title: '活动内容',
      dataIndex: 'content',
      className: 'table-content-cell',
      render: (value) => value || '-',
    },
    {
      title: '活动图片',
      dataIndex: 'icon',
      render: (value, row) => <TableImageLink src={value} alt={row.title || 'activity'} />,
    },
    {
      title: '活动金额',
      dataIndex: 'activeMoney',
      render: (value) => formatCurrencyCent(value),
    },
    {
      title: '活动状态',
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
    { title: '活动持续时间', dataIndex: 'activeExpireDays', render: (value) => value ?? '-' },
    { title: '活动开始时间', dataIndex: 'beginAt', render: (value) => value || '-' },
    { title: '活动结束时间', dataIndex: 'endAt', render: (value) => value || '-' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, activity) => (
        <TableActionBar>
          <TableActionButton onClick={() => onEdit(activity)}>编辑</TableActionButton>
          <TableActionButton
            onClick={() => onToggleStatus(activity, Number(activity.status) === 2 ? 1 : 2)}
            disabled={submitting}
          >
            {Number(activity.status) === 2 ? '打开' : '关闭'}
          </TableActionButton>
          <TableActionButton danger onClick={() => onDelete(activity)} disabled={submitting}>
            删除
          </TableActionButton>
        </TableActionBar>
      ),
    },
  ];
}
