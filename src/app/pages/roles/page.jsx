import React, { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tree,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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

function transformTreeData(tree = []) {
  return tree.map((item) => ({
    key: item.id,
    title: item.name,
    children: transformTreeData(item.children || []),
  }));
}

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
  const [createOpen, setCreateOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({ id: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);

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
      setCheckedKeys(flattenMenuIds(Array.isArray(currentMenus) ? currentMenus : []));
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

  function openCreateModal() {
    createForm.setFieldsValue({ name: '' });
    setCreateOpen(true);
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
      setCreateOpen(false);
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
    setCurrentRole({ id: role.id, name: role.name });
    setAuthOpen(true);
    await loadRoleTree(role.id);
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
      setAuthOpen(false);
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
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            角色管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版角色管理模块，保留角色查询、创建、删除和角色授权能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form form={searchForm} layout="vertical" initialValues={{ keyword: '' }} onFinish={handleSearch}>
          <div className="toolbar-grid toolbar-grid--compact">
            <Form.Item label="角色名" name="keyword">
              <Input placeholder="输入角色名" />
            </Form.Item>
            <Form.Item label=" ">
              <Space wrap>
                <Button type="primary" htmlType="submit" loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset} disabled={loading}>
                  重置
                </Button>
                <Button type="primary" ghost icon={<PlusOutlined />} onClick={openCreateModal}>
                  添加角色
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card title="角色列表" extra={<Typography.Text type="secondary">当前共 {roles.length} 个角色</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={roles}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="新增角色"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="创建"
        cancelText="取消"
        confirmLoading={submitting}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          创建新的后台角色，后续可继续分配权限菜单。
        </Typography.Paragraph>
        <Form form={createForm} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名' }]}>
            <Input placeholder="请输入角色名" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={currentRole.name ? `给 ${currentRole.name} 授权` : '角色授权'}
        open={authOpen}
        onCancel={() => setAuthOpen(false)}
        onOk={handleSubmitAuthorities}
        okText="确认授权"
        cancelText="取消"
        confirmLoading={submitting}
        width={660}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          提交时会自动带上当前选中的菜单树节点，保持授权结构完整。
        </Typography.Paragraph>
        {treeLoading ? <Typography.Text type="secondary">权限树加载中...</Typography.Text> : null}
        {!treeLoading && !tree.length ? <Typography.Text type="secondary">暂无可授权菜单</Typography.Text> : null}
        {!treeLoading && tree.length ? (
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys}
            treeData={transformTreeData(tree)}
            onCheck={(nextCheckedKeys) => setCheckedKeys(nextCheckedKeys)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
