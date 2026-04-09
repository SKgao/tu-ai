import React from 'react';
import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';

const MENU_SCOPE_LABELS = {
  1: '左侧菜单',
  2: '按钮',
  3: '接口',
};

const MENU_STATUS_META = {
  1: { text: '正常', className: 'status-pill status-pill--success' },
  2: { text: '不可用', className: 'status-pill status-pill--warning' },
  3: { text: '删除', className: 'status-pill status-pill--danger' },
};

function getScopeLabel(value) {
  return MENU_SCOPE_LABELS[value] || '-';
}

function getStatusMeta(value) {
  return MENU_STATUS_META[value] || { text: '-', color: 'default' };
}

export function createMenuColumns({ onEdit, onDelete, submitting }) {
  return [
    { title: 'ID', dataIndex: 'id', render: (value) => renderCopyableIdValue(value) },
    { title: '父级 ID', dataIndex: 'parentId', render: (value) => renderCopyableIdValue(value, { placeholder: 0 }) },
    { title: '排序', dataIndex: 'sortValue', render: (value) => value ?? 0 },
    {
      title: '作用',
      dataIndex: 'menuScope',
      render: (value) => getScopeLabel(String(value)),
    },
    { title: '菜单名称', dataIndex: 'menuName', render: (value) => value || '-' },
    { title: '路径', dataIndex: 'path', render: (value) => value || '-' },
    { title: '图标', dataIndex: 'icon', render: (value) => value || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value) => {
        const meta = getStatusMeta(String(value));
        const color =
          String(value) === '1' ? 'success' : String(value) === '2' ? 'warning' : String(value) === '3' ? 'error' : 'default';
        return <Tag color={color}>{meta.text}</Tag>;
      },
    },
    {
      title: 'URL',
      dataIndex: 'url',
      render: (value) => value || <Typography.Text type="secondary">无</Typography.Text>,
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    { title: '更新时间', dataIndex: 'updatedAt', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, menu) => (
        <Space size="small">
          <Button type="link" onClick={() => onEdit(menu)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除菜单 ${menu.menuName || menu.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(menu)}
            disabled={submitting}
          >
            <Button type="link" danger disabled={submitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
