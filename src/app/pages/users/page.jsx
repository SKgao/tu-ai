import React, { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { toApiDateTime } from '@/app/lib/dateTime';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
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

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_CREATE_FORM = {
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  avatar: '',
  status: '1',
  roleid: undefined,
};

const EMPTY_EDIT_FORM = {
  id: undefined,
  phone: '',
  email: '',
  name: '',
  sex: undefined,
  roleid: undefined,
  status: '1',
  avatar: '',
};

const EMPTY_PASSWORD_FORM = {
  id: undefined,
  password: '',
  confirmPassword: '',
};

function getStatusMeta(status) {
  if (status === 1) {
    return { text: '正常', color: 'success' };
  }

  if (status === 2) {
    return { text: '冻结', color: 'warning' };
  }

  if (status === 3) {
    return { text: '已删除', color: 'error' };
  }

  return { text: '未知', color: 'default' };
}

function normalizeRoleId(user) {
  const roleId = user.roleid ?? user.roleId ?? '';
  return roleId === null || roleId === undefined || roleId === '' ? undefined : String(roleId);
}

function normalizeEditFormValues(user) {
  if (!user) {
    return { ...EMPTY_EDIT_FORM };
  }

  return {
    id: Number(user.id),
    phone: user.phone || '',
    email: user.email || '',
    name: user.name || '',
    sex: user.sex ? String(user.sex) : undefined,
    roleid: normalizeRoleId(user),
    status: user.status ? String(user.status) : '1',
    avatar: user.avatar && user.avatar !== 'string' ? user.avatar : '',
  };
}

export function UserManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
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

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateModal() {
    setUserModalMode('create');
    resetUploadState();
    userForm.setFieldsValue({ ...EMPTY_CREATE_FORM });
    setUserModalOpen(true);
  }

  function openEditModal(user) {
    setUserModalMode('edit');
    resetUploadState();
    userForm.setFieldsValue(normalizeEditFormValues(user));
    setUserModalOpen(true);
  }

  function closeUserModal() {
    if (submitting) {
      return;
    }

    setUserModalOpen(false);
  }

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
    applyFilters({
      account: values.account?.trim() || '',
      startTime: toApiDateTime(values.startTime),
      endTime: toApiDateTime(values.endTime),
    });
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
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadFile(file);
      userForm.setFieldValue('avatar', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入头像地址',
      });
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadState({
        uploading: false,
        message: errorMessage,
      });
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleUserSubmit(values) {
    if (userModalMode === 'create') {
      if (!values.account?.trim() || !values.password || !values.confirmPassword) {
        message.error('请填写用户名和密码');
        return;
      }

      if (values.password !== values.confirmPassword) {
        message.error('两次输入密码不一致');
        return;
      }
    }

    if (values.phone && !/^1[0-9]{10}$/.test(values.phone)) {
      message.error('手机号格式不正确');
      return;
    }

    setSubmitting(true);
    try {
      if (userModalMode === 'create') {
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

      message.success(userModalMode === 'create' ? '用户创建成功' : '用户信息已更新');
      setUserModalOpen(false);
      if (userModalMode === 'create') {
        applyFilters((current) => ({
          ...current,
          pageNum: 1,
        }));
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || (userModalMode === 'create' ? '用户创建失败' : '用户更新失败'));
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
    () => [
      { title: '用户名', dataIndex: 'account', render: (value) => value || '-' },
      {
        title: '头像',
        dataIndex: 'avatar',
        render: (value, record) =>
          value && value !== 'string' ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.account || 'avatar'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      { title: '手机号', dataIndex: 'phone', render: (value) => value || '无' },
      { title: '邮箱', dataIndex: 'email', render: (value) => value || '无' },
      { title: '姓名', dataIndex: 'name', render: (value) => value || '无' },
      { title: '性别', dataIndex: 'sex', render: (value) => (value === 1 ? '男' : value === 2 ? '女' : '未知') },
      { title: '角色', dataIndex: 'roleName', render: (_, user) => user.roleName || user.roleid || user.roleId || '-' },
      { title: '创建时间', dataIndex: 'createtime', render: (value) => value || '-' },
      {
        title: '状态',
        dataIndex: 'status',
        render: (value) => {
          const status = getStatusMeta(value);
          return <Tag color={status.color}>{status.text}</Tag>;
        },
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, user) => (
          <Space size="small" wrap>
            <Button type="link" onClick={() => openEditModal(user)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => handleStatusChange(user)}
              disabled={submitting || actionSubmitting}
              style={{ paddingInline: 0 }}
            >
              {user.status === 1 ? '禁用' : user.status === 2 ? '启用' : '恢复'}
            </Button>
            <Button type="link" onClick={() => openPasswordModal(user)} style={{ paddingInline: 0 }}>
              改密
            </Button>
            <Popconfirm
              title={`确认删除用户 ${user.account || user.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(user)}
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
            用户管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版用户管理模块，保留查询、分页、创建、编辑、改密、状态切换和头像上传能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form form={searchForm} layout="vertical" initialValues={{ account: '', startTime: undefined, endTime: undefined }} onFinish={handleSearch}>
          <div className="toolbar-grid">
            <Form.Item label="用户名" name="account">
              <Input placeholder="输入用户名" />
            </Form.Item>
            <Form.Item label="开始时间" name="startTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="结束时间" name="endTime">
              <DatePicker showTime style={{ width: '100%' }} />
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
                  添加用户
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

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

      <Modal
        title={userModalMode === 'create' ? '新增用户' : '编辑用户'}
        open={userModalOpen}
        onCancel={closeUserModal}
        onOk={() => userForm.submit()}
        okText={userModalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={800}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          {userModalMode === 'create' ? '创建后台用户并分配角色。' : '更新用户基础资料与状态。'}
        </Typography.Paragraph>
        <Form form={userForm} layout="vertical" initialValues={EMPTY_CREATE_FORM} onFinish={handleUserSubmit}>
          <div className="form-grid">
            {userModalMode === 'create' ? (
              <>
                <Form.Item label="用户名" name="account" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item label="状态" name="status">
                  <Select
                    options={[
                      { value: '1', label: '启用' },
                      { value: '2', label: '冻结' },
                      { value: '3', label: '删除' },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
                <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入密码' }]}>
                  <Input.Password placeholder="请再次输入密码" />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label="用户 ID" name="id">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="手机号" name="phone">
                  <Input placeholder="请输入手机号" />
                </Form.Item>
                <Form.Item label="邮箱" name="email">
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
                <Form.Item label="姓名" name="name">
                  <Input placeholder="请输入姓名" />
                </Form.Item>
                <Form.Item label="性别" name="sex">
                  <Select
                    allowClear
                    placeholder="未知"
                    options={[
                      { value: '1', label: '男' },
                      { value: '2', label: '女' },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="状态" name="status">
                  <Select
                    options={[
                      { value: '1', label: '正常' },
                      { value: '2', label: '冻结' },
                      { value: '3', label: '已删除' },
                    ]}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item label="角色" name="roleid">
              <Select
                allowClear
                placeholder="请选择角色"
                loading={rolesLoading}
                options={roles.map((role) => ({
                  value: String(role.id),
                  label: role.name,
                }))}
              />
            </Form.Item>

            <Form.Item label="头像地址" name="avatar" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>

            <Form.Item label="上传头像" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleAvatarUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传头像
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持直接上传图片文件'}
                </Typography.Text>
                {avatarValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={avatarValue}
                    alt="头像预览"
                  />
                ) : null}
              </Space>
            </Form.Item>

            {userModalMode === 'create' ? (
              <>
                <Form.Item label="邮箱" name="email">
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
                <Form.Item label="手机号" name="phone">
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              </>
            ) : null}
          </div>
        </Form>
      </Modal>

      <Modal
        title="修改密码"
        open={passwordModalOpen}
        onCancel={closePasswordModal}
        onOk={() => passwordForm.submit()}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          为当前选中用户设置新的登录密码。
        </Typography.Paragraph>
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
          <Form.Item label="用户 ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="新密码" name="password" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入新密码' }]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
