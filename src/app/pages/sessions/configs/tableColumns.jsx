import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image, InputNumber, Popconfirm, Select, Space, Tag, Typography } from 'antd';

export function createSessionColumns({
  bindSelections,
  availableCustomPasses,
  filterTextbookId,
  partsId,
  submitting,
  actionSubmitting,
  onBindSelectionChange,
  onBindCustomPass,
  onOpenBoundModal,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  return [
    { title: 'ID', dataIndex: 'id' },
    { title: '标题', dataIndex: 'title', render: (value) => value || '-' },
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
            alt={record.title || 'session'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => <Tag color={value === 1 ? 'success' : 'warning'}>{value === 1 ? '启用' : '禁用'}</Tag>,
    },
    { title: '顺序', dataIndex: 'sort', render: (value) => value ?? '-' },
    {
      title: '绑定小关卡',
      key: 'binding',
      render: (_, session) => (
        <Space size="small" wrap>
          <Select
            value={bindSelections[session.id] || undefined}
            placeholder="绑定小关卡"
            style={{ minWidth: 180 }}
            options={availableCustomPasses.map((item) => ({
              value: String(item.id),
              label: item.title,
            }))}
            onChange={(value) => onBindSelectionChange(session.id, value)}
          />
          <Button onClick={() => onBindCustomPass(session)} disabled={submitting || actionSubmitting}>
            绑定
          </Button>
          <Button type="link" onClick={() => onOpenBoundModal(session)} style={{ paddingInline: 0 }}>
            已绑定小关卡
          </Button>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, session) => (
        <Space size="small" wrap>
          {partsId ? (
            <Link
              to={`/custom-passes?textbookId=${filterTextbookId}&sessionId=${session.id}&partsId=${partsId}`}
              className="ant-btn ant-btn-link"
            >
              查看小关卡
            </Link>
          ) : null}
          <Button type="link" onClick={() => onEdit(session)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleStatus(session)}
            disabled={submitting || actionSubmitting}
            style={{ paddingInline: 0 }}
          >
            {session.status === 1 ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title={`确认删除大关卡 ${session.title || session.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(session)}
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

export function createBoundCustomPassColumns({
  actionSubmitting,
  onSortChange,
  onUnbind,
}) {
  return [
    { title: '小关卡标题', dataIndex: 'customTitle', render: (_, item) => item.customTitle || item.title || '-' },
    {
      title: '图片',
      dataIndex: 'icon',
      render: (value, item) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={item.customTitle || 'custom-pass'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      render: (value, item) => (
        <InputNumber
          min={0}
          defaultValue={value ?? undefined}
          onBlur={(event) => onSortChange(item, event.target.value)}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, item) => (
        <Popconfirm
          title={`确认解绑小关卡 ${item.customTitle || item.title || item.id} 吗？`}
          okText="确认"
          cancelText="取消"
          onConfirm={() => onUnbind(item)}
          disabled={actionSubmitting}
        >
          <Button type="link" danger disabled={actionSubmitting} style={{ paddingInline: 0 }}>
            解绑
          </Button>
        </Popconfirm>
      ),
    },
  ];
}
