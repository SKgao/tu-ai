import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  createPass,
  listPasses,
  listSubjects,
  removePass,
  updatePass,
  uploadAsset,
} from '@/app/services/passes';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_PASS_FORM = {
  id: undefined,
  title: '',
  icon: '',
  partsId: undefined,
  sort: undefined,
  subject: undefined,
};

function normalizePassFormValues(pass, partsId) {
  if (!pass) {
    return {
      ...EMPTY_PASS_FORM,
      partsId: partsId ? Number(partsId) : undefined,
    };
  }

  return {
    id: Number(pass.id),
    title: pass.title || '',
    icon: pass.icon || '',
    partsId: pass.partsId !== undefined && pass.partsId !== null ? Number(pass.partsId) : undefined,
    sort: pass.sort !== undefined && pass.sort !== null ? Number(pass.sort) : undefined,
    subject: pass.subject !== undefined && pass.subject !== null ? String(pass.subject) : undefined,
  };
}

export function PassManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const partsId = searchParams.get('partsId') || '';
  const textbookId = searchParams.get('textbookId') || '';
  const [subjects, setSubjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const iconValue = Form.useWatch('icon', form);
  const {
    query,
    data: passes,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      partsId,
      pageNum: 1,
      pageSize: 10,
    },
    request: listPasses,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '关卡列表加载失败'),
  });

  useEffect(() => {
    async function loadSubjectOptions() {
      try {
        const data = await listSubjects();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error?.message || '题型列表加载失败');
      }
    }

    loadSubjectOptions();
  }, []);

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateModal() {
    setModalMode('create');
    resetUploadState();
    form.setFieldsValue(normalizePassFormValues(null, partsId));
    setModalOpen(true);
  }

  function openEditModal(pass) {
    setModalMode('edit');
    resetUploadState();
    form.setFieldsValue(normalizePassFormValues(pass, partsId));
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入图片地址',
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

  async function handleSubmit(values) {
    if (!values.title?.trim() || values.partsId === undefined || !values.subject) {
      message.error('请填写关卡标题、Part ID 并选择题型');
      return;
    }

    const payload = {
      title: values.title.trim(),
      icon: values.icon?.trim() || '',
      partsId: Number(values.partsId),
      sort: values.sort ?? undefined,
      subject: Number(values.subject),
    };

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createPass(payload);
      } else {
        await updatePass({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(modalMode === 'create' ? '关卡创建成功' : '关卡更新成功');
      setModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '关卡提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(pass) {
    setActionSubmitting(true);
    try {
      await removePass(pass.id);
      message.success('关卡已删除');
      if (passes.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '关卡删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: '关卡标题', dataIndex: 'title', render: (value) => value || '-' },
      {
        title: '图片',
        dataIndex: 'icon',
        render: (value, record) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.title || 'pass'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      { title: '闯关人数', dataIndex: 'customerNumber', render: (value) => value ?? '-' },
      { title: '关卡顺序', dataIndex: 'sort', render: (value) => value ?? '-' },
      { title: '平均分', dataIndex: 'totalScore', render: (value) => value ?? '-' },
      { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
      {
        title: '详情',
        key: 'details',
        render: (_, pass) =>
          pass.id ? (
            <Link to={`/subjects?customsPassId=${pass.id}`} className="ant-btn ant-btn-link">
              查看题目
            </Link>
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, pass) => (
          <Space size="small" wrap>
            <Button type="link" onClick={() => openEditModal(pass)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Popconfirm
              title={`确认删除关卡 ${pass.title || pass.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(pass)}
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
            关卡管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版关卡管理模块，保留分页、增改删、图片上传和题型选择能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">
            当前 Part ID: {query.partsId || '-'}，教材 ID: {textbookId || '-'}
          </Typography.Text>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              添加关卡
            </Button>
            <Button onClick={() => navigate(textbookId ? `/parts?textBookId=${textbookId}&unitId=` : '/parts')}>
              返回 Part
            </Button>
            <Button onClick={() => reload().catch(() => {})} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="关卡列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={passes}
          loading={loading}
          scroll={{ x: 1120 }}
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
        title={modalMode === 'create' ? '新增关卡' : '编辑关卡'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={700}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护关卡标题、图片、归属 part、排序和题型。
        </Typography.Paragraph>
        <Form form={form} layout="vertical" initialValues={EMPTY_PASS_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {modalMode === 'edit' ? (
              <Form.Item label="关卡 ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item label="关卡标题" name="title" rules={[{ required: true, message: '请输入关卡标题' }]}>
              <Input placeholder="请输入关卡标题" />
            </Form.Item>
            <Form.Item label="Part ID" name="partsId" rules={[{ required: true, message: '请输入 Part ID' }]}>
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入 Part ID" />
            </Form.Item>
            <Form.Item label="关卡顺序" name="sort">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入关卡顺序" />
            </Form.Item>
            <Form.Item label="题型" name="subject" rules={[{ required: true, message: '请选择题型' }]}>
              <Select
                placeholder="请选择题型"
                options={subjects.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="关卡图片地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传关卡图片" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传关卡图片
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传关卡图片'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="关卡图片"
                  />
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
