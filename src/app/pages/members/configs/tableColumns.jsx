import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, Space, Typography } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';
import { MaskedPhoneText } from '@/app/components/MaskedPhoneText';
import { formatCurrencyCent } from '@/app/lib/formatters';

export function createMemberColumns({ onOpenVip, onMemberStatus, submitting }) {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => renderCopyableIdValue(value) },
    { title: '用户昵称', dataIndex: 'realName', render: (value) => value || '-' },
    {
      title: '用户头像',
      dataIndex: 'icon',
      render: (value, member) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={member.realName || 'member'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '邀请用户人数',
      dataIndex: 'inviteCount',
      render: (value, member) =>
        Number(value) > 0 ? (
          <Link to={`/invite-count?userId=${member.tutuNumber}`} className="ant-btn ant-btn-link">
            {value}
          </Link>
        ) : (
          value ?? 0
        ),
    },
    { title: '会员等级', dataIndex: 'userLevelName', render: (value) => value || '-' },
    {
      title: '用户来源',
      dataIndex: 'channel',
      render: (value) => (value === 1 ? '自主注册' : '后台添加'),
    },
    {
      title: '是否购买精品课程',
      dataIndex: 'hasBuyTextbook',
      render: (value) => (value === 0 ? '未购买' : '已购买'),
    },
    { title: '会员开始时间', dataIndex: 'payTime', render: (value) => value || '-' },
    { title: '会员到期时间', dataIndex: 'exprieTime', render: (value) => value || '-' },
    { title: '累计消费金额', dataIndex: 'userMoney', render: (value) => formatCurrencyCent(value, '0.00 元') },
    { title: '手机号', dataIndex: 'mobile', render: (value) => <MaskedPhoneText value={value} /> },
    { title: 'E-mail', dataIndex: 'email', render: (value) => value || '无' },
    { title: '会员生日', dataIndex: 'birthday', render: (value) => value || '无' },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (value) => (value === 1 ? '男' : value === 2 ? '女' : '-'),
    },
    {
      title: '是否设立密码',
      dataIndex: 'hasSetPassword',
      render: (value) => (value === 1 ? '是' : '否'),
    },
    { title: '注册时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    { title: '教材版本', dataIndex: 'bookVersionName', render: (value) => value || '无' },
    { title: '练习教材名称', dataIndex: 'textbookNamePractice', render: (value) => value || '无' },
    {
      title: '详情',
      key: 'details',
      render: (_, member) => (
        <Space size="small">
          <Link to={`/learning-record?userId=${member.tutuNumber}`} className="ant-btn ant-btn-link">
            查看学习记录
          </Link>
          {member.hasBuyTextbook !== 0 ? (
            <Link to={`/course-users?tutuNumber=${member.tutuNumber}`} className="ant-btn ant-btn-link">
              查看已买课程
            </Link>
          ) : null}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, member) => (
        <Space size="small">
          <Button type="link" onClick={() => onOpenVip(member)} style={{ paddingInline: 0 }}>
            开通会员
          </Button>
          <Button
            type="link"
            onClick={() => onMemberStatus(member, 'enable')}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            启用
          </Button>
          <Button
            type="link"
            danger
            onClick={() => onMemberStatus(member, 'disable')}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            禁用
          </Button>
        </Space>
      ),
    },
  ];
}

export function createMemberFeedbackColumns() {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => renderCopyableIdValue(value) },
    { title: '手机号', dataIndex: 'mobile', render: (value) => <MaskedPhoneText value={value} /> },
    {
      title: '反馈内容',
      dataIndex: 'content',
      className: 'table-content-cell',
      render: (value) => value || '无',
    },
    { title: '反馈时间', dataIndex: 'createdAt', render: (value) => value || '-' },
  ];
}
