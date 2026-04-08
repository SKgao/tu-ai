import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';

export function createBookColumns({
  onEdit,
  onToggleLock,
  onDelete,
  submitting,
}) {
  return [
    { title: '教材名', dataIndex: 'name', render: (value) => value || '-' },
    {
      title: '封面',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={record.name || 'book'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '年级',
      dataIndex: 'gradeName',
      render: (_, record) => record.gradeName || record.gradeId || '-',
    },
    {
      title: '教材版本',
      dataIndex: 'bookVersionName',
      render: (_, record) => record.bookVersionName || record.bookVersionId || '-',
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    { title: '年级顺序', dataIndex: 'status', render: (value) => value ?? '-' },
    {
      title: '锁定状态',
      dataIndex: 'canLock',
      render: (value) => (
        <Tag color={value === 1 ? 'success' : 'warning'}>
          {value === 1 ? '已解锁' : '已锁定'}
        </Tag>
      ),
    },
    {
      title: '详情',
      key: 'details',
      render: (_, book) => (
        <Space size="small" wrap>
          <Link to={`/units?textbookId=${book.id}`} className="ant-btn ant-btn-link">
            查看单元
          </Link>
          <Link to={`/sessions?textbookId=${book.id}`} className="ant-btn ant-btn-link">
            查看大关卡
          </Link>
          <Link
            to={`/custom-passes?textbookId=${book.id}`}
            className="ant-btn ant-btn-link"
          >
            查看小关卡
          </Link>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, book) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(book)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleLock(book)}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            {book.canLock === 1 ? '锁定' : '解锁'}
          </Button>
          <Popconfirm
            title={`确认删除教材 ${book.name || book.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(book)}
            disabled={submitting}
          >
            <Button
              type="link"
              danger
              disabled={submitting}
              style={{ paddingInline: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}

export function createResourceColumns({
  resourceType,
  onEdit,
  onDelete,
  submitting,
}) {
  return [
    { title: 'ID', dataIndex: 'id' },
    {
      title: resourceType === 'grade' ? '年级名称' : '教材版本名称',
      dataIndex: resourceType === 'grade' ? 'gradeName' : 'name',
      render: (value) => value || '-',
    },
    {
      title: resourceType === 'grade' ? '年级顺序' : '备注',
      dataIndex: resourceType === 'grade' ? 'status' : 'memo',
      render: (_, record) =>
        resourceType === 'grade' ? record.status ?? '-' : '版本资源',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, item) => (
        <Space size="small" wrap>
          <Button
            type="link"
            onClick={() => onEdit(resourceType, item)}
            style={{ paddingInline: 0 }}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确认删除 ${
              resourceType === 'grade' ? item.gradeName || item.id : item.name || item.id
            } 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(resourceType, item)}
            disabled={submitting}
          >
            <Button
              type="link"
              danger
              disabled={submitting}
              style={{ paddingInline: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
