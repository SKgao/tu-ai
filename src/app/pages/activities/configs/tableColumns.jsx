import React from 'react';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';
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
      render: (value, row) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={row.title || 'activity'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '活动金额',
      dataIndex: 'activeMoney',
      render: (value) => formatCurrencyCent(value),
    },
    {
      title: '活动状态',
      dataIndex: 'status',
      render: (value) => <Tag color={Number(value) === 1 ? 'success' : 'error'}>{Number(value) === 1 ? '启动' : '关闭'}</Tag>,
    },
    { title: '活动持续时间', dataIndex: 'activeExpireDays', render: (value) => value ?? '-' },
    { title: '活动开始时间', dataIndex: 'beginAt', render: (value) => value || '-' },
    { title: '活动结束时间', dataIndex: 'endAt', render: (value) => value || '-' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, activity) => (
        <Space size="small">
          <Button type="link" onClick={() => onEdit(activity)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleStatus(activity, Number(activity.status) === 2 ? 1 : 2)}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            {Number(activity.status) === 2 ? '打开' : '关闭'}
          </Button>
          <Popconfirm
            title={`确认删除活动 ${activity.title || activity.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(activity)}
            disabled={submitting}
          >
            <Button type="link" danger disabled={submitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
