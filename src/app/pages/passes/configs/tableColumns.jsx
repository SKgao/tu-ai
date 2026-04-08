import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Typography } from 'antd';

export function createPassColumns({
  onEdit,
  onDelete,
  submitting,
  actionSubmitting,
}) {
  return [
    { title: '关卡标题', dataIndex: 'title', render: (value) => value || '-' },
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
            alt={record.title || 'pass'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '闯关人数', dataIndex: 'customerNumber', render: (value) => value ?? '-' },
    { title: '关卡顺序', dataIndex: 'sort', render: (value) => value ?? '-' },
    { title: '平均分', dataIndex: 'totalScore', render: (value) => value ?? '-' },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '详情',
      key: 'details',
      render: (_, pass) =>
        pass.id ? (
          <Link to={`/subjects?customsPassId=${pass.id}`} className="ant-btn ant-btn-link">
            查看题目
          </Link>
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
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
            title={`确认删除关卡 ${pass.title || pass.id} 吗？`}
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
