import React, { startTransition, useEffect, useState } from 'react';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import {
  createRole,
  getRoleMenus,
  listRoles,
  removeRole,
  setRoleAuthorities,
} from '@/app/services/roles';

function flattenMenuIds(tree, acc = []) {
  tree.forEach((item) => {
    acc.push(item.id);
    if (item.children?.length) {
      flattenMenuIds(item.children, acc);
    }
  });
  return acc;
}

function buildParentMap(tree, parentId = null, map = new Map()) {
  tree.forEach((item) => {
    map.set(item.id, parentId);
    if (item.children?.length) {
      buildParentMap(item.children, item.id, map);
    }
  });
  return map;
}

function collectNodeIds(node, acc = []) {
  acc.push(node.id);
  if (node.children?.length) {
    node.children.forEach((child) => collectNodeIds(child, acc));
  }
  return acc;
}

function withAncestors(ids, parentMap) {
  const result = new Set(ids);

  ids.forEach((id) => {
    let current = parentMap.get(id);
    while (current) {
      result.add(current);
      current = parentMap.get(current);
    }
  });

  return Array.from(result);
}

function TreeNode({ node, selectedIds, onToggle }) {
  const descendantIds = node.children?.length ? flattenMenuIds(node.children) : [];
  const checked = selectedIds.has(node.id);
  const selectedChildren = descendantIds.filter((id) => selectedIds.has(id)).length;
  const indeterminate = !checked && selectedChildren > 0 && selectedChildren < descendantIds.length;

  return (
    <li className="tree-node">
      <label className={indeterminate ? 'tree-check tree-check--mixed' : 'tree-check'}>
        <input type="checkbox" checked={checked} onChange={() => onToggle(node)} />
        <span>{node.name}</span>
      </label>
      {node.children?.length ? (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} selectedIds={selectedIds} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function RoleCreateModal({ value, submitting, onChange, onClose, onSubmit }) {
  return (
    <AppModal
      title="新增角色"
      description="创建新的后台角色，后续可继续分配权限菜单。"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <label className="form-field">
          <span>角色名称</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="请输入角色名"
          />
        </label>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

function RoleAuthorityModal({
  roleName,
  tree,
  selectedIds,
  submitting,
  loading,
  onClose,
  onToggle,
  onSubmit,
}) {
  return (
    <AppModal
      title={roleName ? `给 ${roleName} 授权` : '角色授权'}
      description="提交时会自动把父级菜单一并带上，避免权限树丢失祖先节点。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <div className="modal-form">
        {loading ? <div className="table-empty">权限树加载中...</div> : null}
        {!loading && !tree.length ? <div className="table-empty">暂无可授权菜单</div> : null}
        {!loading && tree.length ? (
          <div className="tree-shell">
            <ul className="tree-root">
              {tree.map((item) => (
                <TreeNode key={item.id} node={item} selectedIds={selectedIds} onToggle={onToggle} />
              ))}
            </ul>
          </div>
        ) : null}
        <div className="modal-actions">
          <button type="button" className="app-button app-button--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="app-button app-button--primary"
            disabled={submitting || loading}
            onClick={onSubmit}
          >
            {submitting ? '提交中...' : '确认授权'}
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export function RoleManagementPage() {
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [roles, setRoles] = useState([]);
  const [tree, setTree] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({ id: '', name: '' });
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
    isOpen: createOpen,
    form: roleForm,
    setForm: setRoleForm,
    openCreate: openCreateModal,
    close: closeCreateModal,
  } = useModalState({
    createState: () => '',
  });

  async function loadRoles(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listRoles(nextQuery.trim());
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '角色列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadRoleTree(roleId) {
    setTreeLoading(true);
    try {
      const [allMenus, currentMenus] = await Promise.all([getRoleMenus(1), getRoleMenus(roleId)]);
      setTree(Array.isArray(allMenus) ? allMenus : []);
      setSelectedIds(new Set(flattenMenuIds(Array.isArray(currentMenus) ? currentMenus : [])));
    } catch (error) {
      showError(error?.message || '权限树加载失败');
      setTree([]);
      setSelectedIds(new Set());
    } finally {
      setTreeLoading(false);
    }
  }

  useEffect(() => {
    loadRoles(query);
  }, [query]);

  function handleSearch(event) {
    event.preventDefault();
    startTransition(() => {
      setQuery(keyword);
    });
  }

  function handleToggleNode(node) {
    const ids = collectNodeIds(node);
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldSelect = !ids.every((id) => next.has(id));

      ids.forEach((id) => {
        if (shouldSelect) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });

      return next;
    });
  }

  async function handleCreateRole(event) {
    event.preventDefault();
    if (!String(roleForm).trim()) {
      showError('请输入角色名称');
      return;
    }

    await submitModal({
      action: () => createRole(String(roleForm).trim()),
      successMessage: '角色创建成功',
      errorMessage: '角色创建失败',
      close: closeCreateModal,
      afterSuccess: async () => {
        setRoleForm('');
        await loadRoles();
      },
    });
  }

  async function handleDeleteRole(role) {
    await runAction({
      confirmText: `确认删除角色 ${role.name || role.id} 吗？`,
      action: () => removeRole(role.id),
      successMessage: '角色已删除',
      errorMessage: '角色删除失败',
      afterSuccess: () => {
        setRoles((current) => current.filter((item) => item.id !== role.id));
      },
    });
  }

  async function handleOpenAuth(role) {
    setCurrentRole({ id: role.id, name: role.name });
    setAuthOpen(true);
    await loadRoleTree(role.id);
  }

  async function handleSubmitAuthorities() {
    if (!selectedIds.size) {
      showError('请至少选择一个授权菜单');
      return;
    }

    const parentMap = buildParentMap(tree);
    const menuIds = withAncestors(selectedIds, parentMap).map((id) => Number(id));

    await submitModal({
      action: () =>
        setRoleAuthorities({
          roleId: Number(currentRole.id),
          menuIds,
        }),
      successMessage: '角色授权已更新',
      errorMessage: '角色授权失败',
      close: () => setAuthOpen(false),
    });
  }

  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">角色管理</h2>
          <p className="page-copy">
            这一页对应旧版角色管理模块，当前已迁到新路由，并保留角色授权能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <form className="toolbar-grid toolbar-grid--compact" onSubmit={handleSearch}>
          <label className="form-field">
            <span>角色名</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="输入角色名"
            />
          </label>
          <div className="toolbar-actions">
            <button type="submit" className="app-button app-button--primary">
              搜索
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => {
                setRoleForm('');
                openCreateModal();
              }}
            >
              添加角色
            </button>
          </div>
        </form>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">角色列表</h3>
            <p className="section-meta">当前共 {roles.length} 个角色</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadRoles()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>角色 ID</th>
                <th>角色名</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="table-empty">
                    数据加载中...
                  </td>
                </tr>
              ) : null}
              {!loading && !roles.length ? (
                <tr>
                  <td colSpan="3" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>{role.name || '-'}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="text-button" onClick={() => handleOpenAuth(role)}>
                            授权
                          </button>
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDeleteRole(role)}
                            disabled={submitting}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </section>

      {createOpen ? (
        <RoleCreateModal
          value={String(roleForm)}
          submitting={modalSubmitting}
          onChange={setRoleForm}
          onClose={closeCreateModal}
          onSubmit={handleCreateRole}
        />
      ) : null}

      {authOpen ? (
        <RoleAuthorityModal
          roleName={currentRole.name}
          tree={tree}
          selectedIds={selectedIds}
          submitting={modalSubmitting}
          loading={treeLoading}
          onClose={() => setAuthOpen(false)}
          onToggle={handleToggleNode}
          onSubmit={handleSubmitAuthorities}
        />
      ) : null}
    </div>
  );
}
