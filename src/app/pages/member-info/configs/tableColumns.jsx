import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Space, Typography } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';

export function createMemberInfoColumns() {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => renderCopyableIdValue(value) },
    { title: '用户昵称', dataIndex: 'realName', render: (value) => value || '-' },
    {
      title: '用户头像',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={record.realName || 'member'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '会员等级', dataIndex: 'userLevelName', render: (value) => value || '-' },
    {
      title: '是否购买精品课程',
      dataIndex: 'hasBuyTextbook',
      render: (value) => (value === 0 ? '未购买' : '已购买'),
    },
    { title: '会员开始时间', dataIndex: 'payTime', render: (value) => value || '-' },
    { title: '会员到期时间', dataIndex: 'exprieTime', render: (value) => value || '-' },
    { title: '注册时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, member) =>
        member.hasBuyTextbook !== 0 ? (
          <Space size="small">
            <Link to={`/course-users?tutuNumber=${member.tutuNumber}`} className="ant-btn ant-btn-link">
              查看已买课程
            </Link>
          </Space>
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
  ];
}
