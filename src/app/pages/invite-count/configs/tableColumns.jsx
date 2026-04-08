import React from 'react';

export function createInviteColumns() {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => value ?? '-' },
    { title: '用户昵称', dataIndex: 'realName', render: (value) => value || '无' },
    {
      title: '用户头像',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <a href={value} target="_blank" rel="noreferrer" className="avatar-link">
            <img src={value} alt={record.realName || 'invite'} className="avatar-thumb" />
          </a>
        ) : (
          <span className="table-muted">无</span>
        ),
    },
    { title: '手机号', dataIndex: 'mobile', render: (value) => value || '无' },
    { title: '邀请时间', dataIndex: 'inviteTime', render: (value) => value || '-' },
  ];
}
