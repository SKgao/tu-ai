import React from 'react';

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
  return MENU_STATUS_META[value] || { text: '-', className: 'status-pill' };
}

export function createMenuColumns({ onEdit, onDelete, submitting }) {
  return [
    { title: 'ID', dataIndex: 'id', render: (value) => value ?? '-' },
    { title: '父级 ID', dataIndex: 'parentId', render: (value) => value ?? 0 },
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
        return <span className={meta.className}>{meta.text}</span>;
      },
    },
    {
      title: 'URL',
      dataIndex: 'url',
      render: (value) => value || <span className="table-muted">无</span>,
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    { title: '更新时间', dataIndex: 'updatedAt', render: (value) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      render: (_, menu) => (
        <div className="table-actions">
          <button type="button" className="text-button" onClick={() => onEdit(menu)}>
            编辑
          </button>
          <button
            type="button"
            className="text-button text-button--danger"
            onClick={() => onDelete(menu)}
            disabled={submitting}
          >
            删除
          </button>
        </div>
      ),
    },
  ];
}
