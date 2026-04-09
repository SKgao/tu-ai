import React from 'react';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';
import { formatCurrencyCent } from '@/app/lib/formatters';

export function createCourseBagActivityColumns({ onEdit, onDelete, submitting }) {
  return [
    { title: '活动 ID', dataIndex: 'id', render: (value) => renderCopyableIdValue(value) },
    { title: '课程名称', dataIndex: 'textbookName', render: (value) => value || '-' },
    { title: '辅导老师', dataIndex: 'teacher', render: (value) => value || '-' },
    {
      title: '详情图',
      dataIndex: 'iconDetail',
      render: (value) =>
        value ? (
          <Image width={52} height={52} style={{ borderRadius: 16, objectFit: 'cover' }} src={value} alt="详情图" />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '优惠券图',
      dataIndex: 'iconTicket',
      render: (value) =>
        value ? (
          <Image width={52} height={52} style={{ borderRadius: 16, objectFit: 'cover' }} src={value} alt="优惠券图" />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '原始金额', dataIndex: 'orgAmt', render: (value) => formatCurrencyCent(value) },
    { title: '实际金额', dataIndex: 'amt', render: (value) => formatCurrencyCent(value) },
    { title: '数量', dataIndex: 'num', render: (value) => value ?? '-' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => <Tag color={Number(value) === 1 ? 'success' : 'error'}>{Number(value) === 1 ? '启动' : '关闭'}</Tag>,
    },
    {
      title: '开课方式',
      dataIndex: 'type',
      render: (value) =>
        Number(value) === 1 ? '统一开课' : Number(value) === 2 ? '购买生效' : '闯关解锁',
    },
    { title: '预售开始', dataIndex: 'saleBeginAt', render: (value) => value || '-' },
    { title: '预售结束', dataIndex: 'saleEndAt', render: (value) => value || '-' },
    { title: '开课时间', dataIndex: 'beginAt', render: (value) => value || '-' },
    { title: '结课时间', dataIndex: 'endAt', render: (value) => value || '-' },
    { title: '微信号', dataIndex: 'chatNo', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, activity) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(activity)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除课程活动 ${activity.id} 吗？`}
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
