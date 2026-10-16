import { useState } from 'react';
import { App, Button, Card, Form, Space, Table, Typography } from 'antd';
import type { FormProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { createMenu, listMenus, removeMenu, updateMenu } from '@/app/services/menus';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { MenuModal } from './components/MenuModal';
import { MenuSearchForm } from './components/MenuSearchForm';
import { createMenuColumns } from './configs/tableColumns';
import type {
  MenuFormValues,
  MenuListResult,
  MenuQuery,
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
  icon: '',
  menuScope: '1',
  url: '',
  status: '1',
};

const INITIAL_FILTERS: MenuSearchValues = {
  menuName: '',
};

const INITIAL_QUERY: MenuQuery = {
  menuName: '',
  pageNum: 1,
  pageSize: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const MENU_SCOPE_OPTIONS: MenuSelectOption[] = [
  { value: '1', label: '左侧菜单' },
  { value: '2', label: '按钮' },
  { value: '3', label: '接口' },
];

const STATUS_OPTIONS: MenuSelectOption[] = [
  { value: '1', label: '正常' },
  { value: '2', label: '不可用' },
  { value: '3', label: '删除' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
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
    icon: menu.icon || '',
    menuScope: String(menu.menuScope ?? 1),
    url: menu.url || '',
    status: String(menu.status ?? 1),
  };
}

export function MenuManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<MenuSearchValues>();
  const [modalForm] = Form.useForm<MenuFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const menuModal = useFormModal<MenuRecord>({
    submitting,
    onOpenCreate: () => {
      modalForm.setFieldsValue(EMPTY_FORM);
    },
    onOpenEdit: (menu) => {
      modalForm.setFieldsValue(normalizeMenuFormValues(menu));
    },
  });
  const {
    query,
    data: menus,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<MenuQuery, MenuListResult, MenuRecord>({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) => (await listMenus(currentQuery)) as MenuListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '菜单列表加载失败'),
  });

  const handleSearch: FormProps<MenuSearchValues>['onFinish'] = (values) => {
    applyFilters({
      menuName: values.menuName?.trim() || '',
    });
  };

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  const handleSubmit: FormProps<MenuFormValues>['onFinish'] = async (values) => {
    const payload = {
      menuName: values.menuName.trim(),
      parentId: Number(values.parentId),
      sortValue: Number(values.sortValue),
      path: values.path.trim(),
      icon: values.icon.trim(),
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
      await reload().catch(() => {});
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
      const nextPage = menus.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
      if (nextPage === query.pageNum) {
        await reload().catch(() => {});
      } else {
        setPageNum(nextPage);
      }
    } catch (error) {
      message.error(getErrorMessage(error, '菜单删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createMenuColumns({
    onEdit: menuModal.openEdit,
    onDelete: handleDelete,
    submitting: submitting || actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="菜单管理"
        description="这一页作为 antd 化的页面抽象 demo：列表请求、筛选、分页和弹窗表单都直接对齐官方组件。"
      />

      <PageToolbarCard>
        <MenuSearchForm
          form={searchForm}
          loading={loading}
          initialValues={INITIAL_FILTERS}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={menuModal.openCreate}
        />
      </PageToolbarCard>

      <Card
        title="菜单列表"
        extra={
          <Space>
            <Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>
            <Button onClick={() => reload().catch(() => {})} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table<MenuRecord>
          rowKey="id"
          columns={columns}
          dataSource={menus}
          loading={loading}
          scroll={{ x: 1320 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <MenuModal
        open={menuModal.open}
        mode={menuModal.mode}
        form={modalForm}
        emptyForm={EMPTY_FORM}
        menuScopeOptions={MENU_SCOPE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        submitting={submitting}
        onCancel={menuModal.close}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
