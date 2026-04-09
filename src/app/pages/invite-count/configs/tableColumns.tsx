import { Image, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { InviteRecord } from '../types';

export function createInviteColumns(): TableColumnsType<InviteRecord> {
  return [
    { title: '图图号', dataIndex: 'tutuNumber', render: (value) => String(value ?? '-') },
    { title: '用户昵称', dataIndex: 'realName', render: (value) => String(value || '无') },
    {
      title: '用户头像',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={String(value)}
            alt={String(record.realName || 'invite')}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '手机号', dataIndex: 'mobile', render: (value) => String(value || '无') },
    { title: '邀请时间', dataIndex: 'inviteTime', render: (value) => String(value || '-') },
  ];
}
