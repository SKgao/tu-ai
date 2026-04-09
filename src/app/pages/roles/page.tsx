import { useState } from 'react';
import type { Key } from 'react';
import { App, Button, Card, Form, Popconfirm, Space, Table, Typography } from 'antd';
import type { FormProps, TableColumnsType, TreeProps } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import {
  createRole,
  getRoleMenus,
  listRoles,
  removeRole,
  setRoleAuthorities,
} from '@/app/services/roles';
import { RoleAuthorityModal } from './components/RoleAuthorityModal';
import { RoleCreateModal } from './components/RoleCreateModal';
import { RoleSearchForm } from './components/RoleSearchForm';
import type {
  CurrentRole,
  RoleCheckedKey,
  RoleCreateValues,
  RoleRecord,
  RoleSearchValues,
} from './types';
import { INITIAL_ROLE_FILTERS } from './utils/forms';
import { flattenRoleMenuIds, transformRoleTreeData } from './utils/tree';

type TreeCheckedKeys = Parameters<NonNullable<TreeProps['onCheck']>>[0];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeCheckedKeys(nextCheckedKeys: TreeCheckedKeys): Key[] {
  return Array.isArray(nextCheckedKeys) ? nextCheckedKeys : nextCheckedKeys.checked;
}

export function RoleManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<RoleSearchValues>();
  const [createForm] = Form.useForm<RoleCreateValues>();
  const [keyword, setKeyword] = useState('');
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [tree, setTree] = useState<RoleRecord[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<RoleCheckedKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<CurrentRole>({ id: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const createModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      createForm.setFieldsValue({ name: '' });
    },
  });
  const authModal = useFormModal({
    submitting,
    onOpenEdit: (role: RoleRecord) => {
      setCurrentRole({ id: role.id, name: role.name || '' });
      void loadRoleTree(role.id);
    },
    onClose: () => {
      setCheckedKeys([]);
      setTree([]);
      setCurrentRole({ id: '', name: '' });
    },
  });

  async function loadRoles(nextKeyword = keyword): Promise<void> {
    setLoading(true);
    try {
      const data = await listRoles(nextKeyword.trim());
      setRoles(Array.isArray(data) ? (data as RoleRecord[]) : []);
    } catch (loadError) {
      message.error(getErrorMessage(loadError, '角色列表加载失败'));
    } finally {
      setLoading(false);
    }
  }

  async function loadRoleTree(roleId: number | string): Promise<void> {
    setTreeLoading(true);
    try {
      const [allMenus, currentMenus] = await Promise.all([getRoleMenus(1), getRoleMenus(Number(roleId))]);
      setTree(Array.isArray(allMenus) ? (allMenus as RoleRecord[]) : []);
      setCheckedKeys(flattenRoleMenuIds(Array.isArray(currentMenus) ? (currentMenus as RoleRecord[]) : []));
    } catch (loadError) {
      message.error(getErrorMessage(loadError, '权限树加载失败'));
      setTree([]);
      setCheckedKeys([]);
    } finally {
      setTreeLoading(false);
    }
  }

  useMountEffect(() => {
    void loadRoles();
  });

  const handleSearch: FormProps<RoleSearchValues>['onFinish'] = (values) => {
    const nextKeyword = values.keyword?.trim() || '';
    setKeyword(nextKeyword);
    void loadRoles(nextKeyword);
  };

  function handleReset(): void {
    searchForm.resetFields();
    setKeyword('');
    void loadRoles('');
  }

  const handleCreateRole: FormProps<RoleCreateValues>['onFinish'] = async (values) => {
    const name = values.name?.trim();

    if (!name) {
      message.error('请输入角色名称');
      return;
    }

    setSubmitting(true);
    try {
      await createRole(name);
      message.success('角色创建成功');
      createModal.setOpen(false);
      await loadRoles();
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '角色创建失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDeleteRole(role: RoleRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeRole(Number(role.id));
      message.success('角色已删除');
      setRoles((current) => current.filter((item) => item.id !== role.id));
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '角色删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  function handleOpenAuth(role: RoleRecord): void {
    authModal.openEdit(role);
  }

  async function handleSubmitAuthorities(): Promise<void> {
    if (!checkedKeys.length) {
      message.error('请至少选择一个授权菜单');
      return;
    }

    setSubmitting(true);
    try {
      await setRoleAuthorities({
        roleId: Number(currentRole.id),
        menuIds: checkedKeys.map((id) => Number(id)),
      });
      message.success('角色授权已更新');
      authModal.setOpen(false);
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '角色授权失败'));
    } finally {
      setSubmitting(false);
    }
  }

  const columns: TableColumnsType<RoleRecord> = [
    { title: '角色 ID', dataIndex: 'id', render: (value) => renderCopyableIdValue(value) },
    { title: '角色名', dataIndex: 'name', render: (value) => String(value || '-') },
    {
      title: '操作',
      key: 'actions',
      render: (_value, role) => (
        <Space size="small">
          <Button type="link" onClick={() => handleOpenAuth(role)} style={{ paddingInline: 0 }}>
            授权
          </Button>
          <Popconfirm
            title={`确认删除角色 ${role.name || role.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => handleDeleteRole(role)}
            disabled={submitting || actionSubmitting}
          >
            <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="角色管理"
        description="这一页对应旧版角色管理模块，保留角色查询、创建、删除和角色授权能力。"
      />

      <PageToolbarCard>
        <RoleSearchForm
          form={searchForm}
          loading={loading}
          initialValues={INITIAL_ROLE_FILTERS}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={createModal.openCreate}
        />
      </PageToolbarCard>

      <Card title="角色列表" extra={<Typography.Text type="secondary">当前共 {roles.length} 个角色</Typography.Text>}>
        <Table<RoleRecord> rowKey="id" columns={columns} dataSource={roles} loading={loading} pagination={false} />
      </Card>

      <RoleCreateModal
        open={createModal.open}
        form={createForm}
        submitting={submitting}
        onCancel={createModal.close}
        onSubmit={handleCreateRole}
      />

      <RoleAuthorityModal
        open={authModal.open}
        currentRole={currentRole}
        treeLoading={treeLoading}
        treeData={transformRoleTreeData(tree)}
        checkedKeys={checkedKeys}
        submitting={submitting}
        onCancel={authModal.close}
        onSubmit={handleSubmitAuthorities}
        onCheck={(nextCheckedKeys: TreeCheckedKeys) => setCheckedKeys(normalizeCheckedKeys(nextCheckedKeys))}
      />
    </div>
  );
}
