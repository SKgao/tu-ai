import { useState } from 'react';
import { App, Card, Form, Table, Typography } from 'antd';
import type { FormProps, UploadProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
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
import type {
  PasswordFormValues,
  RoleOption,
  UserFormValues,
  UserListResult,
  UserQuery,
  UserRecord,
  UserSearchValues,
} from './types';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getUploadFileName(file: unknown): string {
  return typeof file === 'object' && file && 'name' in file && typeof file.name === 'string' ? file.name : '文件';
}

export function UserManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<UserSearchValues>();
  const [userForm] = Form.useForm<UserFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [roles, setRoles] = useState<RoleOption[]>([]);
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
    onOpenEdit: (user: UserRecord) => {
      resetUploadState();
      userForm.setFieldsValue(normalizeEditFormValues(user));
    },
  });
  const avatarValue = Form.useWatch('avatar', userForm) as string | undefined;
  const {
    query,
    data: users,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<UserQuery, UserListResult, UserRecord>({
    initialQuery: {
      pageNum: 1,
      pageSize: 10,
      account: '',
      startTime: '',
      endTime: '',
    },
    request: listUsers,
    getItems: (result: UserListResult) => result?.data,
    getTotalCount: (result: UserListResult) => result?.totalCount || 0,
    onError: (errorMessage: string) => message.error(errorMessage || '用户列表加载失败'),
  });

  async function loadRoleList(): Promise<void> {
    setRolesLoading(true);
    try {
      const data = await listRoles();
      setRoles(Array.isArray(data) ? (data as RoleOption[]) : []);
    } catch (loadError) {
      message.error(getErrorMessage(loadError, '角色列表加载失败'));
    } finally {
      setRolesLoading(false);
    }
  }

  useMountEffect(() => {
    void loadRoleList();
  });

  function openPasswordModal(user: UserRecord): void {
    passwordForm.setFieldsValue({
      ...EMPTY_PASSWORD_FORM,
      id: Number(user.id),
    });
    setPasswordModalOpen(true);
  }

  function closePasswordModal(): void {
    if (submitting) {
      return;
    }

    setPasswordModalOpen(false);
  }

  const handleSearch: FormProps<UserSearchValues>['onFinish'] = (values) => {
    applyFilters(buildUserSearchFilters(values));
  };

  function handleReset(): void {
    searchForm.resetFields();
    applyFilters({
      account: '',
      startTime: '',
      endTime: '',
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleAvatarUpload(options: UploadRequestOptions): Promise<void> {
    const { file, onError, onSuccess } = options;
    const fileName = getUploadFileName(file);

    setUploading(fileName);

    try {
      if (!(file instanceof Blob)) {
        throw new Error('上传文件无效');
      }

      const url = await uploadFile(file);
      userForm.setFieldValue('avatar', url);
      setUploadSuccess('上传成功，已自动写入头像地址');
      onSuccess?.({ url });
    } catch (uploadError) {
      const errorMessage = getErrorMessage(uploadError, '上传失败');
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError as Error);
    }
  }

  const handleUserSubmit: FormProps<UserFormValues>['onFinish'] = async (values) => {
    if (userModal.mode === 'create') {
      const account = values.account?.trim();

      if (!account || !values.password || !values.confirmPassword) {
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
        const account = values.account?.trim();

        if (!account) {
          throw new Error('请填写用户名');
        }

        await createUser({
          account,
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
    } catch (submitError) {
      message.error(
        getErrorMessage(submitError, userModal.mode === 'create' ? '用户创建失败' : '用户更新失败'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit: FormProps<PasswordFormValues>['onFinish'] = async (values) => {
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
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '密码修改失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleStatusChange(user: UserRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      if (user.status === 1) {
        await forbidUser(Number(user.id));
      } else {
        await enableUser(Number(user.id));
      }

      message.success(user.status === 1 ? '用户已禁用' : user.status === 2 ? '用户已启用' : '用户已恢复');
      await reload().catch(() => {});
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '状态更新失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDelete(user: UserRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await deleteUser(Number(user.id));
      message.success('用户已删除');
      if (users.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createUserColumns({
    onEdit: userModal.openEdit,
    onToggleStatus: handleStatusChange,
    onChangePassword: openPasswordModal,
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

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
        <Table<UserRecord>
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
