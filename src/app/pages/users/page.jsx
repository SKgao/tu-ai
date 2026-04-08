import React, { useEffect, useMemo, useState } from 'react';
import { App, Card, Form, Space, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
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
import { PasswordModal } from './components/PasswordModal';
import { UserModal } from './components/UserModal';
import { UserSearchForm } from './components/UserSearchForm';
import { createUserColumns } from './configs/tableColumns';
import {
  EMPTY_CREATE_FORM,
  EMPTY_PASSWORD_FORM,
  PAGE_SIZE_OPTIONS,
  buildUserSearchFilters,
  isValidPhoneNumber,
  normalizeEditFormValues,
} from './utils/forms';

export function UserManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const userModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      userForm.setFieldsValue({ ...EMPTY_CREATE_FORM });
    },
    onOpenEdit: (user) => {
      resetUploadState();
      userForm.setFieldsValue(normalizeEditFormValues(user));
    },
  });
  const avatarValue = Form.useWatch('avatar', userForm);
  const {
    query,
    data: users,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      pageNum: 1,
      pageSize: 10,
      account: '',
      startTime: '',
      endTime: '',
    },
    request: listUsers,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '用户列表加载失败'),
  });

  useEffect(() => {
    async function loadRoleList() {
      setRolesLoading(true);
      try {
        const data = await listRoles();
        setRoles(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error?.message || '角色列表加载失败');
      } finally {
        setRolesLoading(false);
      }
    }

    loadRoleList();
  }, []);

  function openPasswordModal(user) {
    passwordForm.setFieldsValue({
      ...EMPTY_PASSWORD_FORM,
      id: Number(user.id),
    });
    setPasswordModalOpen(true);
  }

  function closePasswordModal() {
    if (submitting) {
      return;
    }

    setPasswordModalOpen(false);
  }

  function handleSearch(values) {
    applyFilters(buildUserSearchFilters(values));
  }

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      account: '',
      startTime: '',
      endTime: '',
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleAvatarUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadFile(file);
      userForm.setFieldValue('avatar', url);
      setUploadSuccess('上传成功，已自动写入头像地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleUserSubmit(values) {
    if (userModal.mode === 'create') {
      if (!values.account?.trim() || !values.password || !values.confirmPassword) {
        message.error('请填写用户名和密码');
        return;
      }

      if (values.password !== values.confirmPassword) {
        message.error('两次输入密码不一致');
        return;
      }
    }

    if (values.phone && !isValidPhoneNumber(values.phone)) {
      message.error('手机号格式不正确');
      return;
    }

    setSubmitting(true);
    try {
      if (userModal.mode === 'create') {
        await createUser({
          account: values.account.trim(),
          password: values.password,
          email: values.email?.trim() || '',
          phone: values.phone?.trim() || '',
          avatar: values.avatar?.trim() || '',
          status: values.status,
          roleid: values.roleid ? Number(values.roleid) : undefined,
        });
      } else {
        await updateUser({
          id: Number(values.id),
          phone: values.phone?.trim() || '',
          email: values.email?.trim() || '',
          name: values.name?.trim() || '',
          sex: values.sex ? Number(values.sex) : undefined,
          roleid: values.roleid ? Number(values.roleid) : undefined,
          status: values.status ? Number(values.status) : undefined,
          avatar: values.avatar?.trim() || '',
        });
      }

      message.success(userModal.mode === 'create' ? '用户创建成功' : '用户信息已更新');
      userModal.setOpen(false);
      if (userModal.mode === 'create') {
        applyFilters((current) => ({
          ...current,
          pageNum: 1,
        }));
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || (userModal.mode === 'create' ? '用户创建失败' : '用户更新失败'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(values) {
    if (!values.password || !values.confirmPassword) {
      message.error('请填写完整的新密码');
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error('两次输入密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      await updateUser({
        id: Number(values.id),
        password: values.password,
      });
      message.success('密码修改成功');
      setPasswordModalOpen(false);
    } catch (error) {
      message.error(error?.message || '密码修改失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(user) {
    setActionSubmitting(true);
    try {
      if (user.status === 1) {
        await forbidUser(user.id);
      } else {
        await enableUser(user.id);
      }

      message.success(user.status === 1 ? '用户已禁用' : user.status === 2 ? '用户已启用' : '用户已恢复');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDelete(user) {
    setActionSubmitting(true);
    try {
      await deleteUser(user.id);
      message.success('用户已删除');
      if (users.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createUserColumns({
        onEdit: userModal.openEdit,
        onToggleStatus: handleStatusChange,
        onChangePassword: openPasswordModal,
        onDelete: handleDelete,
        submitting,
        actionSubmitting,
      }),
    [actionSubmitting, submitting, userModal.openEdit],
  );

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="用户管理"
        description="这一页对应旧版用户管理模块，保留查询、分页、创建、编辑、改密、状态切换和头像上传能力。"
      />

      <PageToolbarCard>
        <UserSearchForm
          form={searchForm}
          loading={loading}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={userModal.openCreate}
        />
      </PageToolbarCard>

      <Card
        title="用户列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录，角色缓存 {rolesLoading ? '加载中' : `${roles.length} 个`}</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 1340 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <UserModal
        open={userModal.open}
        mode={userModal.mode}
        form={userForm}
        roles={roles}
        rolesLoading={rolesLoading}
        submitting={submitting}
        uploadState={uploadState}
        avatarValue={avatarValue}
        onCancel={userModal.close}
        onSubmit={handleUserSubmit}
        onUpload={handleAvatarUpload}
      />

      <PasswordModal
        open={passwordModalOpen}
        form={passwordForm}
        submitting={submitting}
        onCancel={closePasswordModal}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}
