import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';

export function createPartColumns({
  textBookId,
  onEdit,
  onToggleLock,
  onDelete,
  submitting,
  actionSubmitting,
}) {
  return [
    { title: 'Part 名称', dataIndex: 'title', render: (value) => value || '-' },
    {
      title: '图片',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={record.title || 'part'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '描述', dataIndex: 'tips', render: (value) => value || '无' },
    { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
    {
      title: '锁定状态',
      dataIndex: 'canLock',
      render: (value) => <Tag color={value === 1 ? 'success' : 'warning'}>{value === 1 ? '已解锁' : '已锁定'}</Tag>,
    },
    {
      title: '详情',
      key: 'details',
      render: (_, part) =>
        part.id ? (
          <Link to={`/passes?partsId=${part.id}&textbookId=${textBookId}`} className="ant-btn ant-btn-link">
            查看关卡
          </Link>
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, part) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(part)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleLock(part)}
            disabled={submitting || actionSubmitting}
            style={{ paddingInline: 0 }}
          >
            {part.canLock === 1 ? '锁定' : '解锁'}
          </Button>
          <Popconfirm
            title={`确认删除 Part ${part.title || part.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(part)}
            disabled={submitting || actionSubmitting}
          >
            <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
