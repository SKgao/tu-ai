import { useEffect, useMemo, useState } from 'react';
import type { Key } from 'react';
import { App, Button, Card, Form, Space, Table, Typography } from 'antd';
import type { FormProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { getErrorMessage } from '@/app/lib/errors';
import {
  createMenu,
  getMenuTree,
  removeMenu,
  updateMenu,
} from '@/app/services/system/menus';
import { MenuModal } from './components/MenuModal';
import { MenuSearchForm } from './components/MenuSearchForm';
import { createMenuColumns } from './configs/tableColumns';
import type {
  MenuFormValues,
  MenuParentOption,
  MenuRecord,
  MenuSearchValues,
  MenuSelectOption,
} from './types';

const EMPTY_FORM: MenuFormValues = {
  id: undefined,
  menuName: '',
  parentId: 0,
  sortValue: 0,
  path: '',
  icon: 'appstore',
  menuScope: '1',
  url: '',
  status: '1',
};

const INITIAL_FILTERS: MenuSearchValues = {
  menuName: '',
};

const MENU_SCOPE_OPTIONS: MenuSelectOption[] = [
  { value: '1', label: '左侧菜单' },
  { value: '2', label: '按钮' },
  { value: '3', label: '接口' },
];

const STATUS_OPTIONS: MenuSelectOption[] = [
  { value: '1', label: '正常' },
  { value: '2', label: '停用' },
  { value: '3', label: '删除' },
];

type FlatMenu = MenuRecord & { depth: number };

function flattenMenuTree(nodes: MenuRecord[], depth = 0, acc: FlatMenu[] = []): FlatMenu[] {
  nodes.forEach((node) => {
    acc.push({ ...node, depth });
    if (node.children?.length) {
      flattenMenuTree(node.children, depth + 1, acc);
    }
  });
  return acc;
}

function collectMenuIds(menu: MenuRecord, acc: Set<number> = new Set()): Set<number> {
  acc.add(Number(menu.id));
  (menu.children || []).forEach((child) => collectMenuIds(child, acc));
  return acc;
}

function filterMenuTree(nodes: MenuRecord[], keyword: string): MenuRecord[] {
  if (!keyword) {
    return nodes;
  }

  const result: MenuRecord[] = [];
  nodes.forEach((node) => {
    const name = String(node.menuName || node.name || '');
    const matched = name.includes(keyword) || String(node.path || '').includes(keyword);
    const children = filterMenuTree(node.children || [], keyword);

    if (matched) {
      result.push(node);
    } else if (children.length) {
      result.push({ ...node, children });
    }
  });

  return result;
}

function normalizeMenuFormValues(menu?: MenuRecord | null): MenuFormValues {
  if (!menu) {
    return { ...EMPTY_FORM };
  }

  return {
    id: Number(menu.id),
    menuName: menu.menuName || '',
    parentId: Number(menu.parentId ?? 0),
    sortValue: Number(menu.sortValue ?? 0),
    path: menu.path || '',
    icon: menu.icon || 'appstore',
    menuScope: String(menu.menuScope ?? 1),
    url: menu.url || '',
    status: String(menu.status ?? 1),
  };
}

export function MenuManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<MenuSearchValues>();
  const [modalForm] = Form.useForm<MenuFormValues>();
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const menuModal = useFormModal<MenuRecord>({
    submitting,
    onOpenCreate: () => {
      setEditingId(undefined);
      modalForm.setFieldsValue(EMPTY_FORM);
    },
    onOpenEdit: (menu) => {
      setEditingId(Number(menu.id));
      modalForm.setFieldsValue(normalizeMenuFormValues(menu));
    },
  });

  async function loadMenus(): Promise<void> {
    setLoading(true);
    try {
      const tree = await getMenuTree();
      setMenus(tree as unknown as MenuRecord[]);
    } catch (error) {
      message.error(getErrorMessage(error, '菜单树加载失败'));
    } finally {
      setLoading(false);
    }
  }

  useMountEffect(() => {
    void loadMenus();
  });

  const flatMenus = useMemo(() => flattenMenuTree(menus), [menus]);
  const parentNameMap = useMemo(
    () => new Map(flatMenus.map((menu) => [Number(menu.id), String(menu.menuName || menu.name || '')])),
    [flatMenus],
  );
  const filteredMenus = useMemo(
    () => filterMenuTree(menus, keyword.trim()),
    [menus, keyword],
  );
  const totalCount = flatMenus.length;
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  // 数据加载/筛选后默认展开全部目录（受控，用户可以再手动收起）
  useEffect(() => {
    const keys: Key[] = [];
    const walk = (nodes: MenuRecord[]): void => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          keys.push(node.id);
          walk(node.children);
        }
      });
    };
    walk(filteredMenus);
    setExpandedRowKeys(keys);
  }, [filteredMenus]);

  const parentOptions = useMemo<MenuParentOption[]>(() => {
    const excluded = new Set<number>();
    if (editingId) {
      excluded.add(editingId);
      const editingMenu = flatMenus.find((menu) => Number(menu.id) === editingId);
      if (editingMenu) {
        collectMenuIds(editingMenu).forEach((id) => excluded.add(id));
      }
    }

    return flatMenus
      .filter((menu) => !excluded.has(Number(menu.id)))
      .map((menu) => ({
        value: Number(menu.id),
        label: `${'　'.repeat(menu.depth)}${menu.menuName || menu.id}`,
        disabled: Number(menu.status) !== 1,
      }));
  }, [editingId, flatMenus]);

  const handleSearch: FormProps<MenuSearchValues>['onFinish'] = (values) => {
    setKeyword(values.menuName?.trim() || '');
  };

  function handleReset(): void {
    searchForm.resetFields();
    setKeyword('');
  }

  function handleCreateTopLevel(): void {
    menuModal.openCreate();
    modalForm.setFieldsValue({ ...EMPTY_FORM, parentId: 0 });
  }

  function handleAddChild(menu: MenuRecord): void {
    menuModal.openCreate();
    modalForm.setFieldsValue({ ...EMPTY_FORM, parentId: Number(menu.id) });
  }

  const handleSubmit: FormProps<MenuFormValues>['onFinish'] = async (values) => {
    const payload = {
      menuName: values.menuName.trim(),
      parentId: Number(values.parentId ?? 0),
      sortValue: Number(values.sortValue ?? 0),
      path: values.path.trim(),
      icon: values.icon,
      menuScope: Number(values.menuScope),
      url: values.url?.trim() || '',
    };

    setSubmitting(true);
    try {
      if (menuModal.mode === 'create') {
        await createMenu(payload);
      } else {
        await updateMenu({
          ...payload,
          id: Number(values.id),
          status: Number(values.status),
        });
      }

      message.success(menuModal.mode === 'create' ? '菜单创建成功' : '菜单更新成功');
      menuModal.setOpen(false);
      await loadMenus();
    } catch (error) {
      message.error(getErrorMessage(error, '菜单提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(menu: MenuRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeMenu(Number(menu.id));
      message.success('菜单已删除');
      await loadMenus();
    } catch (error) {
      message.error(getErrorMessage(error, '菜单删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createMenuColumns({
    parentNameMap,
    onEdit: menuModal.openEdit,
    onAddChild: handleAddChild,
    onDelete: handleDelete,
    submitting: submitting || actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="菜单管理"
        description="维护左侧导航的全部菜单：修改上级目录调整层级，修改图标改变展示，修改排序值控制先后顺序；用户管理里的授权树会同步使用这套菜单。"
      />

      <PageToolbarCard>
        <MenuSearchForm
          form={searchForm}
          loading={loading}
          initialValues={INITIAL_FILTERS}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={handleCreateTopLevel}
        />
      </PageToolbarCard>

      <Card
        title="菜单目录"
        extra={
          <Space>
            <Typography.Text type="secondary">共 {totalCount} 个菜单节点</Typography.Text>
            <Button onClick={() => void loadMenus()} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table<MenuRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredMenus}
          loading={loading}
          pagination={false}
          scroll={{ x: 1180 }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
          }}
        />
      </Card>

      <MenuModal
        open={menuModal.open}
        mode={menuModal.mode}
        form={modalForm}
        emptyForm={EMPTY_FORM}
        parentOptions={parentOptions}
        menuScopeOptions={MENU_SCOPE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        submitting={submitting}
        onCancel={menuModal.close}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
