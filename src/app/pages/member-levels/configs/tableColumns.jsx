import React from 'react';
import { Button, Image, Popconfirm, Space, Typography } from 'antd';
import { fromAmountCent } from '../utils/forms';

export function createMemberLevelColumns({
  onEdit,
  onDelete,
  submitting,
  actionSubmitting,
}) {
  return [
    {
      title: '会员等级 ID',
      dataIndex: 'userLevel',
    },
    {
      title: '会员等级名称',
      dataIndex: 'levelName',
      render: (value) => value || '-',
    },
    {
      title: '等级描述',
      dataIndex: 'explainInfo',
      ellipsis: true,
      render: (value) => value || '-',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={record.levelName || 'level'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '过期时间',
      dataIndex: 'exprieDays',
      render: (value) => (Number(value) === 0 ? '永久有效' : value ?? '-'),
    },
    {
      title: '原始价格',
      dataIndex: 'orgMoney',
      render: (value) => `${fromAmountCent(value) ?? '0.00'} 元`,
    },
    {
      title: '需充值金额',
      dataIndex: 'needMoney',
      render: (value) => `${fromAmountCent(value) ?? '0.00'} 元`,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, level) => (
        <Space size="small">
          <Button type="link" onClick={() => onEdit(level)}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除会员等级 ${level.levelName || level.userLevel} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(level)}
            disabled={actionSubmitting}
          >
            <Button type="link" danger disabled={actionSubmitting || submitting}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
