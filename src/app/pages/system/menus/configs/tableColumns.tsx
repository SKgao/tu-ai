import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { MenuIcon } from '@/app/lib/menuIcons';
import type { MenuRecord } from '../types';

type CreateMenuColumnsOptions = {
  parentNameMap: Map<number, string>;
  onEdit: (menu: MenuRecord) => void;
  onAddChild: (menu: MenuRecord) => void;
  onDelete: (menu: MenuRecord) => void | Promise<void>;
  submitting: boolean;
};

const MENU_SCOPE_LABELS: Record<string, string> = {
  1: '左侧菜单',
  2: '按钮',
  3: '接口',
};

const MENU_STATUS_META: Record<string, { text: string; color: string }> = {
  1: { text: '正常', color: 'success' },
  2: { text: '停用', color: 'warning' },
  3: { text: '删除', color: 'error' },
};

export function createMenuColumns({
  parentNameMap,
  onEdit,
  onAddChild,
  onDelete,
  submitting,
}: CreateMenuColumnsOptions): TableColumnsType<MenuRecord> {
  return [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      width: 240,
      render: (value, menu) => (
        <Space size={8}>
          <span className="menu-icon-preview">
            <MenuIcon name={String(menu.icon || '')} />
          </span>
          <Typography.Text strong>{String(value || menu.name || '-')}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 230,
      render: (value) => (
        <Typography.Text code copyable={{ text: String(value || '') }}>
          {String(value || '-')}
        </Typography.Text>
      ),
    },
    {
      title: '上级目录',
      dataIndex: 'parentId',
      width: 140,
      render: (value) => {
        const parentId = Number(value || 0);
        return parentId ? parentNameMap.get(parentId) || `#${parentId}` : '顶级菜单';
      },
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 150,
      render: (value) => (
        <Space size={6}>
          <MenuIcon name={String(value || '')} />
          <Typography.Text type="secondary">{String(value || '-')}</Typography.Text>
        </Space>
      ),
    },
    { title: '排序', dataIndex: 'sortValue', width: 80, render: (value) => Number(value ?? 0) },
    {
      title: '作用',
      dataIndex: 'menuScope',
      width: 100,
      render: (value) => MENU_SCOPE_LABELS[String(value)] || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (value) => {
        const meta = MENU_STATUS_META[String(value)] || { text: '-', color: 'default' };
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_value, menu) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onAddChild(menu)} style={{ paddingInline: 0 }}>
            新增子级
          </Button>
          <Button type="link" onClick={() => onEdit(menu)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除菜单「${menu.menuName || menu.id}」及其子菜单吗？`}
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
