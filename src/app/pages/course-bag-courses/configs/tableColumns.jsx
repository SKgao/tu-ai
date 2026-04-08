import React from 'react';
import { Link } from 'react-router-dom';
import { TableActionBar, TableActionButton } from '@/app/components/TableActionBar';
import { TableImageLink } from '@/app/components/TableImageLink';

export function createCourseBagCourseColumns({ onEdit, onToggleStatus, onDelete, submitting }) {
  return [
    { title: '课程名称', dataIndex: 'name', render: (value) => value || '-' },
    {
      title: '封面',
      dataIndex: 'icon',
      render: (value, row) => <TableImageLink src={value} alt={row.name || 'course'} />,
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
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '链路',
      key: 'links',
      render: (_, course) => (
        <TableActionBar>
          <Link to={`/units?textBookId=${course.id}`}>查看单元</Link>
          <Link to={`/sessions?textbookId=${course.id}`}>查看大关卡</Link>
          <Link to={`/custom-passes?textbookId=${course.id}`}>查看小关卡</Link>
          <Link to={`/course-bag-activities?id=${course.id}&courseName=${encodeURIComponent(course.name || '')}`}>
            查看活动
          </Link>
        </TableActionBar>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, course) => (
        <TableActionBar>
          <TableActionButton onClick={() => onEdit(course)}>编辑</TableActionButton>
          <TableActionButton onClick={() => onToggleStatus(course)} disabled={submitting}>
            {Number(course.status) === 1 ? '禁用' : '启用'}
          </TableActionButton>
          <TableActionButton danger onClick={() => onDelete(course)} disabled={submitting}>
            删除
          </TableActionButton>
        </TableActionBar>
      ),
    },
  ];
}
