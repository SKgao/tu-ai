import React, { useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createMenu, listMenus, removeMenu, updateMenu } from '@/app/services/menus';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createMenuColumns } from './configs/tableColumns';

const EMPTY_FORM = {
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

const INITIAL_FILTERS = {
  menuName: '',
};

const INITIAL_QUERY = {
  menuName: '',
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

function normalizeMenuFormValues(menu) {
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
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const {
    query,
    data: menus,
    totalCount,
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
    onError: (errorMessage) => message.error(errorMessage || '菜单列表加载失败'),
  });

  function openCreateModal() {
    setModalMode('create');
    modalForm.setFieldsValue(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(menu) {
    setModalMode('edit');
    modalForm.setFieldsValue(normalizeMenuFormValues(menu));
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  function handleSearch(values) {
    applyFilters({
      menuName: values.menuName?.trim() || '',
    });
  }

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleSubmit(values) {
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
      if (modalMode === 'create') {
        await createMenu(payload);
      } else {
        await updateMenu({
          ...payload,
          id: Number(values.id),
          status: Number(values.status),
        });
      }

      message.success(modalMode === 'create' ? '菜单创建成功' : '菜单更新成功');
      setModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '菜单提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(menu) {
    setActionSubmitting(true);
    try {
      await removeMenu(menu.id);
      message.success('菜单已删除');
      const nextPage = menus.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
      if (nextPage === query.pageNum) {
        await reload().catch(() => {});
      } else {
        setPageNum(nextPage);
      }
    } catch (error) {
      message.error(error?.message || '菜单删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createMenuColumns({
        onEdit: openEditModal,
        onDelete: handleDelete,
        submitting: submitting || actionSubmitting,
      }),
    [actionSubmitting, submitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            菜单管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页作为 antd 化的页面抽象 demo：列表请求、筛选、分页和弹窗表单都直接对齐官方组件。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form form={searchForm} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={handleSearch}>
          <div className="toolbar-grid toolbar-grid--compact">
            <Form.Item label="菜单名" name="menuName">
              <Input allowClear placeholder="输入菜单名" />
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
                  添加菜单
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

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
        <Table
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

      <Modal
        title={modalMode === 'create' ? '新增菜单' : '编辑菜单'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => modalForm.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={800}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          {modalMode === 'create' ? '新增权限菜单或按钮/接口定义。' : '统一修改菜单字段。'}
        </Typography.Paragraph>
        <Form form={modalForm} layout="vertical" initialValues={EMPTY_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            <Form.Item
              label="菜单名称"
              name="menuName"
              rules={[{ required: true, message: '请输入菜单名称' }]}
            >
              <Input placeholder="请输入菜单名称" />
            </Form.Item>
            <Form.Item
              label="父级 ID"
              name="parentId"
              rules={[{ required: true, message: '请输入父级 ID' }]}
            >
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="一级菜单传 0" />
            </Form.Item>
            <Form.Item
              label="排序字段"
              name="sortValue"
              rules={[{ required: true, message: '请输入排序字段' }]}
            >
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入排序数字" />
            </Form.Item>
            <Form.Item label="作用" name="menuScope" rules={[{ required: true, message: '请选择作用' }]}>
              <Select options={MENU_SCOPE_OPTIONS} />
            </Form.Item>
            <Form.Item label="路径" name="path" rules={[{ required: true, message: '请输入路径' }]}>
              <Input placeholder="请输入路径" />
            </Form.Item>
            <Form.Item label="图标" name="icon" rules={[{ required: true, message: '请输入图标标识' }]}>
              <Input placeholder="请输入 icon 类名" />
            </Form.Item>
            <Form.Item label="接口地址" name="url" className="form-field--full">
              <Input placeholder="请输入接口地址" />
            </Form.Item>
            {modalMode === 'edit' ? (
              <Form.Item label="状态" name="status">
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            ) : null}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
