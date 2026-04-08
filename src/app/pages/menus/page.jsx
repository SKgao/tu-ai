import React, { useState } from 'react';
import { AppModal } from '@/app/components/AppModal';
import { createMenu, listMenus, removeMenu, updateMenu } from '@/app/services/menus';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { PageHero } from '@/app/components/PageHero';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createMenuColumns } from './configs/tableColumns';

const EMPTY_FORM = {
  id: '',
  menuName: '',
  parentId: '0',
  sortValue: '0',
  path: '',
  icon: '',
  menuScope: '1',
  url: '',
  status: '1',
};

const INITIAL_FILTERS = {
  menuName: '',
};

const INITIAL_QUERY = {
  ...INITIAL_FILTERS,
  pageNum: 1,
  pageSize: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const MENU_SCOPE_OPTIONS = [
  { value: '1', label: '左侧菜单' },
  { value: '2', label: '按钮' },
  { value: '3', label: '接口' },
];

const STATUS_OPTIONS = [
  { value: '1', label: '正常' },
  { value: '2', label: '不可用' },
  { value: '3', label: '删除' },
];

function MenuModal({ mode, form, submitting, onClose, onChange, onSubmit }) {
  return (
    <AppModal
      title={mode === 'create' ? '新增菜单' : '编辑菜单'}
      description={
        mode === 'create' ? '新增权限菜单或按钮/接口定义。' : '统一修改菜单字段，替代旧页的单字段弹出编辑。'
      }
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>菜单名称</span>
            <input
              value={form.menuName}
              onChange={(event) => onChange('menuName', event.target.value)}
              placeholder="请输入菜单名称"
            />
          </label>
          <label className="form-field">
            <span>父级 ID</span>
            <input
              value={form.parentId}
              onChange={(event) => onChange('parentId', event.target.value)}
              placeholder="一级菜单传 0"
            />
          </label>
          <label className="form-field">
            <span>排序字段</span>
            <input
              value={form.sortValue}
              onChange={(event) => onChange('sortValue', event.target.value)}
              placeholder="请输入排序数字"
            />
          </label>
          <label className="form-field">
            <span>作用</span>
            <select
              value={form.menuScope}
              onChange={(event) => onChange('menuScope', event.target.value)}
            >
              {MENU_SCOPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>路径</span>
            <input
              value={form.path}
              onChange={(event) => onChange('path', event.target.value)}
              placeholder="请输入路径"
            />
          </label>
          <label className="form-field">
            <span>图标</span>
            <input
              value={form.icon}
              onChange={(event) => onChange('icon', event.target.value)}
              placeholder="请输入 icon 类名"
            />
          </label>
          <label className="form-field form-field--full">
            <span>接口地址</span>
            <input
              value={form.url}
              onChange={(event) => onChange('url', event.target.value)}
              placeholder="请输入接口地址"
            />
          </label>
          {mode === 'edit' ? (
            <label className="form-field">
              <span>状态</span>
              <select
                value={form.status}
                onChange={(event) => onChange('status', event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function MenuManagementPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
  });
  const {
    mode: modalMode,
    isOpen: modalOpen,
    form,
    updateForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_FORM }),
    editState: (menu) => ({
      id: String(menu.id),
      menuName: menu.menuName || '',
      parentId: String(menu.parentId ?? 0),
      sortValue: String(menu.sortValue ?? 0),
      path: menu.path || '',
      icon: menu.icon || '',
      menuScope: String(menu.menuScope ?? 1),
      url: menu.url || '',
      status: String(menu.status ?? 1),
    }),
  });
  const {
    query,
    data: menus,
    totalCount,
    totalPages,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: listMenus,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (message) => showError(message || '菜单列表加载失败'),
  });

  const columns = createMenuColumns({
    onEdit: openEditModal,
    onDelete: handleDelete,
    submitting: modalSubmitting || actionSubmitting,
  });

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    applyFilters({
      menuName: filters.menuName.trim(),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.menuName.trim()) {
      showError('请输入菜单名称');
      return;
    }

    if (!/^\d+$/.test(form.parentId) || !/^\d+$/.test(form.sortValue)) {
      showError('父级 ID 和排序字段必须为数字');
      return;
    }

    if (!form.path.trim()) {
      showError('请输入路径');
      return;
    }

    if (!form.icon.trim()) {
      showError('请输入图标标识');
      return;
    }

    const payload = {
      menuName: form.menuName.trim(),
      parentId: Number(form.parentId),
      sortValue: Number(form.sortValue),
      path: form.path.trim(),
      icon: form.icon.trim(),
      menuScope: Number(form.menuScope),
      url: form.url.trim(),
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createMenu(payload);
          return;
        }

        await updateMenu({
          ...payload,
          id: Number(form.id),
          status: Number(form.status),
        });
      },
      successMessage: modalMode === 'create' ? '菜单创建成功' : '菜单更新成功',
      errorMessage: '菜单提交失败',
      close: closeModal,
      afterSuccess: reload,
    });
  }

  async function handleDelete(menu) {
    await runAction({
      confirmText: `确认删除菜单 ${menu.menuName || menu.id} 吗？`,
      action: () => removeMenu(menu.id),
      successMessage: '菜单已删除',
      errorMessage: '菜单删除失败',
      afterSuccess: async () => {
        const nextPage = menus.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        if (nextPage === query.pageNum) {
          await reload();
          return;
        }
        setPageNum(nextPage);
      },
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="菜单管理"
        copy="这一页作为页面抽象 demo：列表请求、反馈、分页和列配置都收敛到统一基建层。"
      />

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <form className="toolbar-grid toolbar-grid--compact" onSubmit={handleSearch}>
          <label className="form-field">
            <span>菜单名</span>
            <input
              value={filters.menuName}
              onChange={(event) => updateFilter('menuName', event.target.value)}
              placeholder="输入菜单名"
            />
          </label>
          <div className="toolbar-actions">
            <button type="submit" className="app-button app-button--primary">
              搜索
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={openCreateModal}>
              添加菜单
            </button>
          </div>
        </form>
      </section>

      <PageTableCard
        title="菜单列表"
        totalCount={totalCount}
        columns={columns}
        data={menus}
        rowKey="id"
        loading={loading}
        minWidth={1320}
        headerActions={
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => reload().catch(() => {})}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        }
        pagination={{
          pageNum: query.pageNum,
          pageSize: query.pageSize,
          totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: setPageNum,
          onPageSizeChange: setPageSize,
        }}
      />

      {modalOpen ? (
        <MenuModal
          mode={modalMode}
          form={form}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
