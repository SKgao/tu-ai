import React from 'react';
import { Link } from 'react-router-dom';
import { TableActionBar, TableActionButton } from '@/app/components/TableActionBar';
import { TableImageLink } from '@/app/components/TableImageLink';
import { formatCurrencyCent } from '@/app/lib/formatters';

export function createMemberColumns({ onOpenVip, onMemberStatus, submitting }) {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => value ?? '-' },
    { title: '用户昵称', dataIndex: 'realName', render: (value) => value || '-' },
    {
      title: '用户头像',
      dataIndex: 'icon',
      render: (value, member) => <TableImageLink src={value} alt={member.realName || 'member'} />,
    },
    {
      title: '邀请用户人数',
      dataIndex: 'inviteCount',
      render: (value, member) =>
        Number(value) > 0 ? (
          <Link to={`/invite-count?userId=${member.tutuNumber}`} className="text-button">
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
    { title: '手机号', dataIndex: 'mobile', render: (value) => value || '无' },
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
        <TableActionBar>
          <Link to={`/learning-record?userId=${member.tutuNumber}`} className="text-button">
            查看学习记录
          </Link>
          {member.hasBuyTextbook !== 0 ? (
            <Link to={`/course-users?tutuNumber=${member.tutuNumber}`} className="text-button">
              查看已买课程
            </Link>
          ) : null}
        </TableActionBar>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, member) => (
        <TableActionBar>
          <TableActionButton onClick={() => onOpenVip(member)}>开通会员</TableActionButton>
          <TableActionButton onClick={() => onMemberStatus(member, 'enable')} disabled={submitting}>
            启用
          </TableActionButton>
          <TableActionButton danger onClick={() => onMemberStatus(member, 'disable')} disabled={submitting}>
            禁用
          </TableActionButton>
        </TableActionBar>
      ),
    },
  ];
}

export function createMemberFeedbackColumns() {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => value ?? '-' },
    { title: '手机号', dataIndex: 'mobile', render: (value) => value || '无' },
    {
      title: '反馈内容',
      dataIndex: 'content',
      className: 'table-content-cell',
      render: (value) => value || '无',
    },
    { title: '反馈时间', dataIndex: 'createdAt', render: (value) => value || '-' },
  ];
}
