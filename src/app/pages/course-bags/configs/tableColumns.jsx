import React from 'react';
import { Link } from 'react-router-dom';
import { TableActionBar, TableActionButton } from '@/app/components/TableActionBar';
import { TableImageLink } from '@/app/components/TableImageLink';

export function createCourseBagColumns({ onEdit, onToggleStatus, onDelete, submitting }) {
  return [
    { title: 'ID', dataIndex: 'id' },
    { title: '课程包标题', dataIndex: 'title', render: (value) => value || '-' },
    {
      title: '图标',
      dataIndex: 'icon',
      render: (value, row) => <TableImageLink src={value} alt={row.title || 'bag'} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => (
        <span
          className={
            Number(value) === 1 ? 'status-pill status-pill--success' : 'status-pill status-pill--warning'
          }
        >
          {Number(value) === 1 ? '启用' : '禁用'}
        </span>
      ),
    },
    { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
    {
      title: '课程数',
      dataIndex: 'textBookDOS',
      render: (value) => (Array.isArray(value) ? value.length : 0),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, bag) => (
        <TableActionBar>
          <TableActionButton onClick={() => onEdit(bag)}>编辑</TableActionButton>
          <TableActionButton onClick={() => onToggleStatus(bag)} disabled={submitting}>
            {Number(bag.status) === 1 ? '禁用' : '启用'}
          </TableActionButton>
          <TableActionButton danger onClick={() => onDelete(bag)} disabled={submitting}>
            删除
          </TableActionButton>
          <Link to={`/course-bag-courses?id=${bag.id}&title=${encodeURIComponent(bag.title || '')}`}>
            查看精品课程
          </Link>
        </TableActionBar>
      ),
    },
  ];
}
