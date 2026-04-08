import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  DatePicker,
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
  createUnit,
  listBooks,
  listUnits,
  lockUnit,
  removeUnit,
  updateUnit,
  uploadAsset,
} from '@/app/services/units';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { toApiDateTime } from '@/app/lib/dateTime';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_UNIT_FORM = {
  id: undefined,
  text: '',
  icon: '',
  textBookId: undefined,
  sort: undefined,
};

function normalizeUnitFormValues(unit) {
  if (!unit) {
    return { ...EMPTY_UNIT_FORM };
  }

  return {
    id: Number(unit.id),
    text: unit.text || '',
    icon: unit.icon || '',
    textBookId: unit.textBookId ? String(unit.textBookId) : undefined,
    sort: unit.sort !== undefined && unit.sort !== null ? Number(unit.sort) : undefined,
  };
}

export function UnitManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const initialTextbookId = searchParams.get('textbookId') || searchParams.get('textBookId') || '';
  const [books, setBooks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const iconValue = Form.useWatch('icon', modalForm);
  const {
    query,
    data: units,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      startTime: '',
      endTime: '',
      textBookId: initialTextbookId,
      pageNum: 1,
      pageSize: 10,
    },
    request: listUnits,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '单元列表加载失败'),
  });

  const bookMap = useMemo(
    () => new Map(books.map((item) => [String(item.id), item.name])),
    [books],
  );

  useEffect(() => {
    async function loadBookOptions() {
      try {
        const data = await listBooks({
          pageNum: 1,
          pageSize: 1000,
        });
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(error?.message || '教材列表加载失败');
      }
    }

    loadBookOptions();
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
    modalForm.setFieldsValue({
      ...EMPTY_UNIT_FORM,
      textBookId: searchForm.getFieldValue('textBookId') || initialTextbookId || undefined,
    });
    setModalOpen(true);
  }

  function openEditModal(unit) {
    setModalMode('edit');
    resetUploadState();
    modalForm.setFieldsValue(normalizeUnitFormValues(unit));
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
      startTime: toApiDateTime(values.startTime),
      endTime: toApiDateTime(values.endTime),
      textBookId: values.textBookId || '',
    });
  }

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      startTime: '',
      endTime: '',
      textBookId: initialTextbookId,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      modalForm.setFieldValue('icon', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入封面地址',
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
    if (!values.text?.trim() || !values.textBookId) {
      message.error('请填写单元名称并选择教材');
      return;
    }

    const payload = {
      text: values.text.trim(),
      icon: values.icon?.trim() || '',
      textBookId: Number(values.textBookId),
      sort: values.sort ?? undefined,
    };

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createUnit(payload);
      } else {
        await updateUnit({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(modalMode === 'create' ? '单元创建成功' : '单元更新成功');
      setModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '单元提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(unit) {
    setActionSubmitting(true);
    try {
      await removeUnit(unit.id);
      message.success('单元已删除');
      if (units.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '单元删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleLock(unit) {
    setActionSubmitting(true);
    try {
      await lockUnit({
        unitId: unit.id,
        canLock: unit.canLock === 1 ? 2 : 1,
      });
      message.success(unit.canLock === 1 ? '单元已锁定' : '单元已解锁');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '单元锁定状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: '单元名', dataIndex: 'text', render: (value) => value || '-' },
      {
        title: '封面图',
        dataIndex: 'icon',
        render: (value, record) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.text || 'unit'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '教材',
        dataIndex: 'textBookName',
        render: (_, record) => record.textBookName || bookMap.get(String(record.textBookId)) || record.textBookId || '-',
      },
      { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
      {
        title: '锁定状态',
        dataIndex: 'canLock',
        render: (value) => <Tag color={value === 1 ? 'success' : 'warning'}>{value === 1 ? '已解锁' : '已锁定'}</Tag>,
      },
      { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
      {
        title: '详情',
        key: 'details',
        render: (_, unit) =>
          unit.id ? (
            <Link
              to={`/parts?unitId=${unit.id}&textBookId=${unit.textBookId || query.textBookId || ''}`}
              className="ant-btn ant-btn-link"
            >
              查看 Part
            </Link>
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, unit) => (
          <Space size="small" wrap>
            <Button type="link" onClick={() => openEditModal(unit)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => handleToggleLock(unit)}
              disabled={submitting || actionSubmitting}
              style={{ paddingInline: 0 }}
            >
              {unit.canLock === 1 ? '锁定' : '解锁'}
            </Button>
            <Popconfirm
              title={`确认删除单元 ${unit.text || unit.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(unit)}
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
    [actionSubmitting, bookMap, query.textBookId, submitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            单元管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版单元管理模块，保留教材筛选、分页、增改删、封面上传和锁定能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form
          form={searchForm}
          layout="vertical"
          initialValues={{
            startTime: undefined,
            endTime: undefined,
            textBookId: initialTextbookId || undefined,
          }}
          onFinish={handleSearch}
        >
          <div className="toolbar-grid toolbar-grid--units">
            <Form.Item label="开始时间" name="startTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="结束时间" name="endTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="教材" name="textBookId">
              <Select
                allowClear
                placeholder="全部"
                options={books.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
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
                  添加单元
                </Button>
                <Button onClick={() => navigate('/books')}>返回教材</Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card title="单元列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={units}
          loading={loading}
          scroll={{ x: 1180 }}
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
        title={modalMode === 'create' ? '新增单元' : '编辑单元'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => modalForm.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={700}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护单元名称、封面、教材归属和排序字段。
        </Typography.Paragraph>
        <Form form={modalForm} layout="vertical" initialValues={EMPTY_UNIT_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {modalMode === 'edit' ? (
              <Form.Item label="单元 ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item label="单元名称" name="text" rules={[{ required: true, message: '请输入单元名称' }]}>
              <Input placeholder="请输入单元名称" />
            </Form.Item>
            <Form.Item label="教材" name="textBookId" rules={[{ required: true, message: '请选择教材' }]}>
              <Select
                placeholder="请选择教材"
                options={books.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="排序字段" name="sort">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
            </Form.Item>
            <Form.Item label="封面图地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传封面" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传单元封面
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传单元封面'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="单元封面"
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
