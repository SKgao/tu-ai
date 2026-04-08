import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Typography } from 'antd';

export function createCustomPassColumns({
  partsId,
  sessionId,
  onEdit,
  onDelete,
  submitting,
  actionSubmitting,
}) {
  return [
    { title: '小关卡 ID', dataIndex: 'id' },
    { title: '标题', dataIndex: 'title', render: (value) => value || '-' },
    { title: '过渡标题', dataIndex: 'tmpTitle', render: (value) => value || '-' },
    {
      title: '图片',
      dataIndex: 'icon',
      render: (value, pass) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={pass.title || 'custom-pass'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '详情',
      key: 'details',
      render: (_, pass) =>
        pass.id ? (
          <Link
            to={`/subjects?customsPassId=${pass.id}&partsId=${partsId}&sessionId=${sessionId}`}
            className="ant-btn ant-btn-link"
          >
            查看题目
          </Link>
        ) : (
          <Typography.Text type="secondary">无可用题目</Typography.Text>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, pass) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(pass)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除小关卡 ${pass.title || pass.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(pass)}
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
