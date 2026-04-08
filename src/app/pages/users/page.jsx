import React, { startTransition, useEffect, useState } from 'react';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { FileUploadField } from '@/app/components/FileUploadField';
import { ModalActions } from '@/app/components/ModalActions';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import {
  createUser,
  deleteUser,
  enableUser,
  forbidUser,
  listRoles,
  listUsers,
  updateUser,
  uploadFile,
} from '@/app/services/users';

const EMPTY_FILTERS = {
  account: '',
  startTime: '',
  endTime: '',
};

const EMPTY_CREATE_FORM = {
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  avatar: '',
  status: '1',
  roleid: '',
};

const EMPTY_EDIT_FORM = {
  id: '',
  phone: '',
  email: '',
  name: '',
  sex: '',
  roleid: '',
  status: '',
  avatar: '',
};

const EMPTY_PASSWORD_FORM = {
  id: '',
  password: '',
  confirmPassword: '',
};

const STATUS_META = {
  1: { text: '正常', className: 'status-pill status-pill--success' },
  2: { text: '冻结', className: 'status-pill status-pill--warning' },
  3: { text: '已删除', className: 'status-pill status-pill--danger' },
};

const SEX_OPTIONS = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function toApiDateTime(value) {
  return value ? `${value.replace('T', ' ')}:00` : '';
}

function getStatusMeta(status) {
  return STATUS_META[status] || { text: '未知', className: 'status-pill' };
}

function normalizeRoleId(user) {
  const roleId = user.roleid ?? user.roleId ?? '';
  return roleId === null || roleId === undefined ? '' : String(roleId);
}

function AvatarCell({ src, alt }) {
  if (!src || src === 'string') {
    return <span className="table-muted">无</span>;
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className="avatar-link">
      <img src={src} alt={alt} className="avatar-thumb" />
    </a>
  );
}

function UserModal({
  title,
  mode,
  form,
  roles,
  submitting,
  uploadState,
  onClose,
  onSubmit,
  onChange,
  onUpload,
}) {
  return (
    <AppModal
      title={title}
      description={mode === 'create' ? '创建后台用户并分配角色。' : '更新用户基础资料与状态。'}
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          {mode === 'create' ? (
            <>
              <label className="form-field">
                <span>用户名</span>
                <input
                  value={form.account}
                  onChange={(event) => onChange('account', event.target.value)}
                  placeholder="请输入用户名"
                />
              </label>
              <label className="form-field">
                <span>状态</span>
                <select value={form.status} onChange={(event) => onChange('status', event.target.value)}>
                  <option value="1">启用</option>
                  <option value="2">冻结</option>
                  <option value="3">删除</option>
                </select>
              </label>
              <label className="form-field">
                <span>密码</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => onChange('password', event.target.value)}
                  placeholder="请输入密码"
                />
              </label>
              <label className="form-field">
                <span>确认密码</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => onChange('confirmPassword', event.target.value)}
                  placeholder="请再次输入密码"
                />
              </label>
            </>
          ) : null}

          {mode === 'edit' ? (
            <>
              <label className="form-field">
                <span>手机号</span>
                <input
                  value={form.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  placeholder="请输入手机号"
                />
              </label>
              <label className="form-field">
                <span>邮箱</span>
                <input
                  value={form.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="请输入邮箱"
                />
              </label>
              <label className="form-field">
                <span>姓名</span>
                <input
                  value={form.name}
                  onChange={(event) => onChange('name', event.target.value)}
                  placeholder="请输入姓名"
                />
              </label>
              <label className="form-field">
                <span>性别</span>
                <select value={form.sex} onChange={(event) => onChange('sex', event.target.value)}>
                  <option value="">未知</option>
                  {SEX_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>状态</span>
                <select value={String(form.status || '')} onChange={(event) => onChange('status', event.target.value)}>
                  <option value="1">正常</option>
                  <option value="2">冻结</option>
                  <option value="3">已删除</option>
                </select>
              </label>
            </>
          ) : null}

          <label className="form-field">
            <span>角色</span>
            <select value={form.roleid} onChange={(event) => onChange('roleid', event.target.value)}>
              <option value="">请选择角色</option>
              {roles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <FileUploadField
            label="头像地址"
            value={form.avatar}
            onValueChange={(value) => onChange('avatar', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            placeholder="可直接粘贴图片 URL，或使用下方文件上传"
            uploadHint="支持直接上传图片文件"
            previewAlt="头像预览"
            fullWidth
          />

          {mode === 'create' ? (
            <>
              <label className="form-field">
                <span>邮箱</span>
                <input
                  value={form.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="请输入邮箱"
                />
              </label>
              <label className="form-field">
                <span>手机号</span>
                <input
                  value={form.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  placeholder="请输入手机号"
                />
              </label>
            </>
          ) : null}
        </div>

        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

function PasswordModal({ form, submitting, onClose, onSubmit, onChange }) {
  return (
    <AppModal
      title="修改密码"
      description="为当前选中用户设置新的登录密码。"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <label className="form-field">
          <span>新密码</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange('password', event.target.value)}
            placeholder="请输入新密码"
          />
        </label>
        <label className="form-field">
          <span>确认密码</span>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => onChange('confirmPassword', event.target.value)}
            placeholder="请再次输入新密码"
          />
        </label>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function UserManagementPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState({
    pageNum: 1,
    pageSize: 10,
    ...EMPTY_FILTERS,
  });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { uploadState, upload, resetUploadState } = useFileUpload({
    uploadRequest: uploadFile,
  });
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
  });
  const {
    isOpen: userModalOpen,
    mode: userModalMode,
    form: userForm,
    updateForm: updateUserForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeUserModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_CREATE_FORM }),
    editState: (user) => ({
      ...EMPTY_EDIT_FORM,
      id: String(user.id),
      phone: user.phone || '',
      email: user.email || '',
      name: user.name || '',
      sex: user.sex ? String(user.sex) : '',
      roleid: normalizeRoleId(user),
      status: user.status ? String(user.status) : '1',
      avatar: user.avatar && user.avatar !== 'string' ? user.avatar : '',
    }),
    onOpenCreate: async () => {
      resetUploadState();
      await loadRoles();
    },
    onOpenEdit: async () => {
      resetUploadState();
      await loadRoles();
    },
  });
  const {
    isOpen: passwordModalOpen,
    form: passwordForm,
    updateForm: updatePasswordForm,
    openEdit: openPasswordModal,
    close: closePasswordModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_PASSWORD_FORM }),
    editState: (user) => ({
      id: String(user.id),
      password: '',
      confirmPassword: '',
    }),
  });

  async function loadUsers(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listUsers(nextQuery);
      setUsers(Array.isArray(data?.data) ? data.data : []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      showError(error?.message || '用户列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    if (roles.length || rolesLoading) {
      return;
    }

    setRolesLoading(true);
    try {
      const data = await listRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '角色列表加载失败');
    } finally {
      setRolesLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers(query);
  }, [query.account, query.endTime, query.pageNum, query.pageSize, query.startTime]);

  function updateFilters(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    startTransition(() => {
      setQuery({
        pageNum: 1,
        pageSize: query.pageSize,
        account: filters.account.trim(),
        startTime: toApiDateTime(filters.startTime),
        endTime: toApiDateTime(filters.endTime),
      });
    });
  }

  async function handleAvatarUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入头像地址',
        errorMessage: '上传失败',
        onSuccess: (url) => {
          updateUserForm('avatar', url);
        },
      });
    } catch {}
  }

  async function handleUserSubmit(event) {
    event.preventDefault();

    if (userModalMode === 'create') {
      if (!userForm.account || !userForm.password || !userForm.confirmPassword) {
        showError('请填写用户名和密码');
        return;
      }

      if (userForm.password !== userForm.confirmPassword) {
        showError('两次输入密码不一致');
        return;
      }
    }

    if (userForm.phone && !/^1[0-9]{10}$/.test(userForm.phone)) {
      showError('手机号格式不正确');
      return;
    }

    await submitModal({
      action: async () => {
        if (userModalMode === 'create') {
          await createUser({
            account: userForm.account.trim(),
            password: userForm.password,
            email: userForm.email.trim(),
            phone: userForm.phone.trim(),
            avatar: userForm.avatar.trim(),
            status: userForm.status,
            roleid: userForm.roleid ? Number(userForm.roleid) : undefined,
          });
          return;
        }

        await updateUser({
          id: Number(userForm.id),
          phone: userForm.phone.trim(),
          email: userForm.email.trim(),
          name: userForm.name.trim(),
          sex: userForm.sex ? Number(userForm.sex) : undefined,
          roleid: userForm.roleid ? Number(userForm.roleid) : undefined,
          status: userForm.status ? Number(userForm.status) : undefined,
          avatar: userForm.avatar.trim(),
        });
      },
      successMessage: userModalMode === 'create' ? '用户创建成功' : '用户信息已更新',
      errorMessage: userModalMode === 'create' ? '用户创建失败' : '用户更新失败',
      close: closeUserModal,
      afterSuccess: async () => {
        if (userModalMode === 'create') {
          startTransition(() => {
            setQuery((current) => ({
              ...current,
              pageNum: 1,
            }));
          });
          await loadUsers({
            ...query,
            pageNum: 1,
          });
          return;
        }

        await loadUsers();
      },
    });
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!passwordForm.password || !passwordForm.confirmPassword) {
      showError('请填写完整的新密码');
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      showError('两次输入密码不一致');
      return;
    }

    await submitModal({
      action: () =>
        updateUser({
          id: Number(passwordForm.id),
          password: passwordForm.password,
        }),
      successMessage: '密码修改成功',
      errorMessage: '密码修改失败',
      close: closePasswordModal,
    });
  }

  async function handleStatusChange(user) {
    await runAction({
      action: () => (user.status === 1 ? forbidUser(user.id) : enableUser(user.id)),
      successMessage: user.status === 1 ? '用户已禁用' : user.status === 2 ? '用户已启用' : '用户已恢复',
      errorMessage: '状态更新失败',
      afterSuccess: () => loadUsers(),
    });
  }

  async function handleDelete(user) {
    await runAction({
      confirmText: `确认删除用户 ${user.account || user.id} 吗？`,
      action: () => deleteUser(user.id),
      successMessage: '用户已删除',
      errorMessage: '删除失败',
      afterSuccess: async () => {
        const nextPage = users.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });
        if (nextPage === query.pageNum) {
          await loadUsers();
        }
      },
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">用户管理</h2>
          <p className="page-copy">
            这一页对应旧版的用户管理模块，现已迁到 React Router + hooks + 轻量 API 层。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <form className="toolbar-grid" onSubmit={handleSearch}>
          <label className="form-field">
            <span>用户名</span>
            <input
              value={filters.account}
              onChange={(event) => updateFilters('account', event.target.value)}
              placeholder="输入用户名"
            />
          </label>
          <label className="form-field">
            <span>开始时间</span>
            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(event) => updateFilters('startTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>结束时间</span>
            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(event) => updateFilters('endTime', event.target.value)}
            />
          </label>
          <div className="toolbar-actions">
            <button type="submit" className="app-button app-button--primary">
              搜索
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={openCreateModal}>
              添加用户
            </button>
          </div>
        </form>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">用户列表</h3>
            <p className="section-meta">
              共 {totalCount} 条记录，角色缓存 {rolesLoading ? '加载中' : `${roles.length} 个`}
            </p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadUsers()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>头像</th>
                <th>手机号</th>
                <th>邮箱</th>
                <th>姓名</th>
                <th>性别</th>
                <th>角色</th>
                <th>创建时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="table-empty">
                    数据加载中...
                  </td>
                </tr>
              ) : null}

              {!loading && !users.length ? (
                <tr>
                  <td colSpan="10" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}

              {!loading
                ? users.map((user) => {
                    const status = getStatusMeta(user.status);
                    return (
                      <tr key={user.id}>
                        <td>{user.account || '-'}</td>
                        <td>
                          <AvatarCell src={user.avatar} alt={user.account || 'avatar'} />
                        </td>
                        <td>{user.phone || <span className="table-muted">无</span>}</td>
                        <td>{user.email || <span className="table-muted">无</span>}</td>
                        <td>{user.name || <span className="table-muted">无</span>}</td>
                        <td>{user.sex === 1 ? '男' : user.sex === 2 ? '女' : '未知'}</td>
                        <td>{user.roleName || user.roleid || user.roleId || '-'}</td>
                        <td>{user.createtime || '-'}</td>
                        <td>
                          <span className={status.className}>{status.text}</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="text-button" onClick={() => openEditModal(user)}>
                              编辑
                            </button>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => handleStatusChange(user)}
                              disabled={submitting}
                            >
                              {user.status === 1 ? '禁用' : user.status === 2 ? '启用' : '恢复'}
                            </button>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => openPasswordModal(user)}
                            >
                              改密
                            </button>
                            <button
                              type="button"
                              className="text-button text-button--danger"
                              onClick={() => handleDelete(user)}
                              disabled={submitting}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="section-meta">
            第 {query.pageNum} / {totalPages} 页
          </div>
          <div className="pagination-controls">
            <select
              value={query.pageSize}
              onChange={(event) => {
                const pageSize = Number(event.target.value);
                startTransition(() => {
                  setQuery((current) => ({
                    ...current,
                    pageNum: 1,
                    pageSize,
                  }));
                });
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  每页 {size} 条
                </option>
              ))}
            </select>
            <button
              type="button"
              className="app-button app-button--ghost"
              disabled={query.pageNum <= 1 || loading}
              onClick={() => {
                startTransition(() => {
                  setQuery((current) => ({
                    ...current,
                    pageNum: current.pageNum - 1,
                  }));
                });
              }}
            >
              上一页
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              disabled={query.pageNum >= totalPages || loading}
              onClick={() => {
                startTransition(() => {
                  setQuery((current) => ({
                    ...current,
                    pageNum: current.pageNum + 1,
                  }));
                });
              }}
            >
              下一页
            </button>
          </div>
        </div>
      </section>

      {userModalOpen ? (
        <UserModal
          title={userModalMode === 'create' ? '新增用户' : '编辑用户'}
          mode={userModalMode}
          form={userForm}
          roles={roles}
          submitting={modalSubmitting}
          uploadState={uploadState}
          onClose={closeUserModal}
          onSubmit={handleUserSubmit}
          onChange={updateUserForm}
          onUpload={handleAvatarUpload}
        />
      ) : null}

      {passwordModalOpen ? (
        <PasswordModal
          form={passwordForm}
          submitting={modalSubmitting}
          onClose={closePasswordModal}
          onSubmit={handlePasswordSubmit}
          onChange={updatePasswordForm}
        />
      ) : null}
    </div>
  );
}
