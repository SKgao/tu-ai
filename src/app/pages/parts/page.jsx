import React, { useMemo, useState } from 'react';
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
  Tag,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  createPart,
  listParts,
  removePart,
  updatePart,
  uploadAsset,
} from '@/app/services/parts';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_PART_FORM = {
  id: undefined,
  title: '',
  icon: '',
  unitsId: undefined,
  tips: '',
  sort: undefined,
  canLock: '1',
};

function normalizePartFormValues(part, unitId) {
  if (!part) {
    return {
      ...EMPTY_PART_FORM,
      unitsId: unitId ? Number(unitId) : undefined,
    };
  }

  return {
    id: Number(part.id),
    title: part.title || '',
    icon: part.icon || '',
    unitsId: part.unitsId !== undefined && part.unitsId !== null ? Number(part.unitsId) : undefined,
    tips: part.tips || '',
    sort: part.sort !== undefined && part.sort !== null ? Number(part.sort) : undefined,
    canLock: String(part.canLock ?? 1),
  };
}

export function PartManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const unitId = searchParams.get('unitId') || '';
  const textBookId = searchParams.get('textBookId') || '';
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
    data: parts,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      unitId,
      pageNum: 1,
      pageSize: 10,
    },
    request: listParts,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || 'Part 列表加载失败'),
  });

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateModal() {
    setModalMode('create');
    resetUploadState();
    form.setFieldsValue(normalizePartFormValues(null, unitId));
    setModalOpen(true);
  }

  function openEditModal(part) {
    setModalMode('edit');
    resetUploadState();
    form.setFieldsValue(normalizePartFormValues(part, unitId));
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
    if (!values.title?.trim() || values.unitsId === undefined) {
      message.error('请填写 Part 名称并输入单元 ID');
      return;
    }

    const payload = {
      title: values.title.trim(),
      icon: values.icon?.trim() || '',
      unitsId: Number(values.unitsId),
      tips: values.tips?.trim() || '',
      sort: values.sort ?? undefined,
    };

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createPart(payload);
      } else {
        await updatePart({
          ...payload,
          id: Number(values.id),
          canLock: values.canLock ? Number(values.canLock) : undefined,
        });
      }

      message.success(modalMode === 'create' ? 'Part 创建成功' : 'Part 更新成功');
      setModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || 'Part 提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(part) {
    setActionSubmitting(true);
    try {
      await removePart(part.id);
      message.success('Part 已删除');
      if (parts.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || 'Part 删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleLock(part) {
    setActionSubmitting(true);
    try {
      await updatePart({
        id: part.id,
        canLock: part.canLock === 1 ? 2 : 1,
      });
      message.success(part.canLock === 1 ? 'Part 已锁定' : 'Part 已解锁');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || 'Part 锁定状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: 'Part 名称', dataIndex: 'title', render: (value) => value || '-' },
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
              alt={record.title || 'part'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      { title: '描述', dataIndex: 'tips', render: (value) => value || '无' },
      { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
      {
        title: '锁定状态',
        dataIndex: 'canLock',
        render: (value) => <Tag color={value === 1 ? 'success' : 'warning'}>{value === 1 ? '已解锁' : '已锁定'}</Tag>,
      },
      {
        title: '详情',
        key: 'details',
        render: (_, part) =>
          part.id ? (
            <Link to={`/passes?partsId=${part.id}&textbookId=${textBookId}`} className="ant-btn ant-btn-link">
              查看关卡
            </Link>
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, part) => (
          <Space size="small" wrap>
            <Button type="link" onClick={() => openEditModal(part)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => handleToggleLock(part)}
              disabled={submitting || actionSubmitting}
              style={{ paddingInline: 0 }}
            >
              {part.canLock === 1 ? '锁定' : '解锁'}
            </Button>
            <Popconfirm
              title={`确认删除 Part ${part.title || part.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(part)}
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
    [actionSubmitting, submitting, textBookId],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Part 管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 part 管理模块，保留分页、增改删、图片上传和锁定能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">
            当前单元 ID: {query.unitId || '-'}，教材 ID: {textBookId || '-'}
          </Typography.Text>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              添加 Part
            </Button>
            <Button onClick={() => navigate(textBookId ? `/units?textbookId=${textBookId}` : '/units')}>
              返回单元
            </Button>
            <Button onClick={() => reload().catch(() => {})} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="Part 列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={parts}
          loading={loading}
          scroll={{ x: 1080 }}
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
        title={modalMode === 'create' ? '新增 Part' : '编辑 Part'}
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
          维护 part 名称、图片、描述、排序和锁定状态。
        </Typography.Paragraph>
        <Form form={form} layout="vertical" initialValues={EMPTY_PART_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {modalMode === 'edit' ? (
              <Form.Item label="Part ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item label="Part 名称" name="title" rules={[{ required: true, message: '请输入 Part 名称' }]}>
              <Input placeholder="请输入 Part 名称" />
            </Form.Item>
            <Form.Item label="单元 ID" name="unitsId" rules={[{ required: true, message: '请输入单元 ID' }]}>
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入单元 ID" />
            </Form.Item>
            <Form.Item label="排序字段" name="sort">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
            </Form.Item>
            {modalMode === 'edit' ? (
              <Form.Item label="锁定状态" name="canLock">
                <Select
                  options={[
                    { value: '1', label: '已解锁' },
                    { value: '2', label: '已锁定' },
                  ]}
                />
              </Form.Item>
            ) : null}
            <Form.Item label="Part 描述" name="tips" className="form-field--full">
              <Input.TextArea rows={4} placeholder="请输入 Part 描述" />
            </Form.Item>
            <Form.Item label="图片地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传图片" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传 Part 图片
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传 Part 图片'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="Part 图片"
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
