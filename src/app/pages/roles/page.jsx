import React, { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Form, Popconfirm, Space, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import {
  createRole,
  getRoleMenus,
  listRoles,
  removeRole,
  setRoleAuthorities,
} from '@/app/services/roles';
import { useFormModal } from '@/app/hooks/useFormModal';
import { RoleAuthorityModal } from './components/RoleAuthorityModal';
import { RoleCreateModal } from './components/RoleCreateModal';
import { RoleSearchForm } from './components/RoleSearchForm';
import { INITIAL_ROLE_FILTERS } from './utils/forms';
import { flattenRoleMenuIds, transformRoleTreeData } from './utils/tree';

export function RoleManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [roles, setRoles] = useState([]);
  const [tree, setTree] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState({ id: '', name: '' });
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
    onOpenEdit: (role) => {
      setCurrentRole({ id: role.id, name: role.name });
      loadRoleTree(role.id).catch(() => {});
    },
    onClose: () => {
      setCheckedKeys([]);
      setTree([]);
      setCurrentRole({ id: '', name: '' });
    },
  });

  async function loadRoles(nextKeyword = keyword) {
    setLoading(true);
    try {
      const data = await listRoles(nextKeyword.trim());
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '角色列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadRoleTree(roleId) {
    setTreeLoading(true);
    try {
      const [allMenus, currentMenus] = await Promise.all([getRoleMenus(1), getRoleMenus(roleId)]);
      setTree(Array.isArray(allMenus) ? allMenus : []);
      setCheckedKeys(flattenRoleMenuIds(Array.isArray(currentMenus) ? currentMenus : []));
    } catch (error) {
      message.error(error?.message || '权限树加载失败');
      setTree([]);
      setCheckedKeys([]);
    } finally {
      setTreeLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  function handleSearch(values) {
    setKeyword(values.keyword || '');
    loadRoles(values.keyword || '');
  }

  function handleReset() {
    searchForm.resetFields();
    setKeyword('');
    loadRoles('');
  }

  async function handleCreateRole(values) {
    if (!values.name?.trim()) {
      message.error('请输入角色名称');
      return;
    }

    setSubmitting(true);
    try {
      await createRole(values.name.trim());
      message.success('角色创建成功');
      createModal.setOpen(false);
      await loadRoles();
    } catch (error) {
      message.error(error?.message || '角色创建失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRole(role) {
    setActionSubmitting(true);
    try {
      await removeRole(role.id);
      message.success('角色已删除');
      setRoles((current) => current.filter((item) => item.id !== role.id));
    } catch (error) {
      message.error(error?.message || '角色删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleOpenAuth(role) {
    authModal.openEdit(role);
  }

  async function handleSubmitAuthorities() {
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
    } catch (error) {
      message.error(error?.message || '角色授权失败');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: '角色 ID', dataIndex: 'id' },
      { title: '角色名', dataIndex: 'name', render: (value) => value || '-' },
      {
        title: '操作',
        key: 'actions',
        render: (_, role) => (
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
    ],
    [actionSubmitting, submitting],
  );

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
        <Table
          rowKey="id"
          columns={columns}
          dataSource={roles}
          loading={loading}
          pagination={false}
        />
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
        onCheck={(nextCheckedKeys) => setCheckedKeys(nextCheckedKeys)}
      />
    </div>
  );
}
