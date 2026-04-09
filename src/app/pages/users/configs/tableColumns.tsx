import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { getStatusMeta } from '../utils/forms';
import type { UserRecord } from '../types';

type CreateUserColumnsOptions = {
  onEdit: (user: UserRecord) => void;
  onToggleStatus: (user: UserRecord) => void | Promise<void>;
  onChangePassword: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void | Promise<void>;
  submitting: boolean;
  actionSubmitting: boolean;
};

export function createUserColumns({
  onEdit,
  onToggleStatus,
  onChangePassword,
  onDelete,
  submitting,
  actionSubmitting,
}: CreateUserColumnsOptions): TableColumnsType<UserRecord> {
  return [
    { title: '用户名', dataIndex: 'account', render: (value) => String(value || '-') },
    {
      title: '头像',
      dataIndex: 'avatar',
      render: (value, record) =>
        value && value !== 'string' ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={String(value)}
            alt={String(record.account || 'avatar')}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '手机号', dataIndex: 'phone', render: (value) => String(value || '无') },
    { title: '邮箱', dataIndex: 'email', render: (value) => String(value || '无') },
    { title: '姓名', dataIndex: 'name', render: (value) => String(value || '无') },
    { title: '性别', dataIndex: 'sex', render: (value) => (Number(value) === 1 ? '男' : Number(value) === 2 ? '女' : '未知') },
    { title: '角色', dataIndex: 'roleName', render: (_value, user) => String(user.roleName || user.roleid || user.roleId || '-') },
    { title: '创建时间', dataIndex: 'createtime', render: (value) => String(value || '-') },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => {
        const status = getStatusMeta(value);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_value, user) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(user)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleStatus(user)}
            disabled={submitting || actionSubmitting}
            style={{ paddingInline: 0 }}
          >
            {Number(user.status) === 1 ? '禁用' : Number(user.status) === 2 ? '启用' : '恢复'}
          </Button>
          <Button type="link" onClick={() => onChangePassword(user)} style={{ paddingInline: 0 }}>
            改密
          </Button>
          <Popconfirm
            title={`确认删除用户 ${user.account || user.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(user)}
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
