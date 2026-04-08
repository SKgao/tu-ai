import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';

export function createCourseBagColumns({ onEdit, onToggleStatus, onDelete, submitting }) {
  return [
    { title: 'ID', dataIndex: 'id' },
    { title: '课程包标题', dataIndex: 'title', render: (value) => value || '-' },
    {
      title: '图标',
      dataIndex: 'icon',
      render: (value, row) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={row.title || 'course-bag'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'success' : 'warning'}>
          {Number(value) === 1 ? '启用' : '禁用'}
        </Tag>
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
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(bag)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleStatus(bag)}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            {Number(bag.status) === 1 ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title={`确认删除课程包 ${bag.title || bag.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(bag)}
            disabled={submitting}
          >
            <Button type="link" danger disabled={submitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
          <Link to={`/course-bag-courses?id=${bag.id}&title=${encodeURIComponent(bag.title || '')}`} className="ant-btn ant-btn-link">
            查看精品课程
          </Link>
        </Space>
      ),
    },
  ];
}
