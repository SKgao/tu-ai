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
  Tag,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  bindCustomPassToSession,
  changeSessionCustomSort,
  changeSessionStatus,
  createSession,
  listCustomPasses,
  listSessionCustomPasses,
  listSessions,
  removeSession,
  unbindSessionCustomPass,
  updateSession,
  uploadAsset,
} from '@/app/services/sessions';

const EMPTY_SESSION_FORM = {
  id: undefined,
  textbookId: undefined,
  title: '',
  icon: '',
  sort: undefined,
};

function normalizeSessionFormValues(session, textbookId) {
  if (!session) {
    return {
      ...EMPTY_SESSION_FORM,
      textbookId: textbookId ? Number(textbookId) : undefined,
    };
  }

  return {
    id: Number(session.id),
    textbookId: textbookId ? Number(textbookId) : undefined,
    title: session.title || '',
    icon: session.icon || '',
    sort: session.sort !== undefined && session.sort !== null ? Number(session.sort) : undefined,
  };
}

export function SessionManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const textbookId = searchParams.get('textbookId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [filterTextbookId, setFilterTextbookId] = useState(textbookId);
  const [sessions, setSessions] = useState([]);
  const [availableCustomPasses, setAvailableCustomPasses] = useState([]);
  const [boundCustomPasses, setBoundCustomPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [boundModalOpen, setBoundModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState({ id: '', title: '' });
  const [bindSelections, setBindSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const iconValue = Form.useWatch('icon', form);

  async function loadSessions(currentTextbookId = filterTextbookId) {
    if (!currentTextbookId) {
      setSessions([]);
      setAvailableCustomPasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sessionData, customPassData] = await Promise.all([
        listSessions(Number(currentTextbookId)),
        listCustomPasses({
          textbookId: Number(currentTextbookId),
          pageNum: 1,
          pageSize: 1000,
        }),
      ]);
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setAvailableCustomPasses(Array.isArray(customPassData?.data) ? customPassData.data : []);
    } catch (error) {
      message.error(error?.message || '大关卡列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [filterTextbookId]);

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateModal() {
    setModalMode('create');
    resetUploadState();
    form.setFieldsValue(normalizeSessionFormValues(null, filterTextbookId));
    setModalOpen(true);
  }

  function openEditModal(session) {
    setModalMode('edit');
    resetUploadState();
    form.setFieldsValue(normalizeSessionFormValues(session, filterTextbookId));
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
        message: '上传成功',
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
    if (values.textbookId === undefined || values.id === undefined || !values.title?.trim()) {
      message.error('请填写教材 ID、大关卡 ID 和标题');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        textbookId: Number(values.textbookId),
        id: Number(values.id),
        title: values.title.trim(),
        icon: values.icon?.trim() || '',
        sort: values.sort ?? undefined,
      };

      if (modalMode === 'create') {
        await createSession(payload);
      } else {
        await updateSession(payload);
      }

      message.success(modalMode === 'create' ? '大关卡创建成功' : '大关卡更新成功');
      setModalOpen(false);
      await loadSessions();
    } catch (error) {
      message.error(error?.message || '大关卡提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(session) {
    setActionSubmitting(true);
    try {
      await removeSession(session.id);
      message.success('大关卡已删除');
      await loadSessions();
    } catch (error) {
      message.error(error?.message || '大关卡删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleStatus(session) {
    setActionSubmitting(true);
    try {
      await changeSessionStatus({
        id: Number(session.id),
        status: session.status === 1 ? 2 : 1,
      });
      message.success(session.status === 1 ? '大关卡已禁用' : '大关卡已启用');
      await loadSessions();
    } catch (error) {
      message.error(error?.message || '大关卡状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function openBoundModal(session) {
    setSelectedSession({
      id: session.id,
      title: session.title,
    });
    setBoundModalOpen(true);

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(session.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '已绑定小关卡加载失败');
      setBoundCustomPasses([]);
    }
  }

  async function reloadBoundModal() {
    if (!selectedSession.id) {
      return;
    }

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(selectedSession.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '已绑定小关卡加载失败');
      setBoundCustomPasses([]);
    }
  }

  async function handleBindCustomPass(session) {
    const targetId = bindSelections[session.id];
    if (!targetId) {
      message.error('请先选择要绑定的小关卡');
      return;
    }

    setActionSubmitting(true);
    try {
      await bindCustomPassToSession({
        textbookId: Number(filterTextbookId),
        sessionId: Number(session.id),
        customPassId: Number(targetId),
      });
      message.success('小关卡绑定成功');
      setBindSelections((current) => ({
        ...current,
        [session.id]: '',
      }));
      await loadSessions();
    } catch (error) {
      message.error(error?.message || '小关卡绑定失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleUnbind(item) {
    setActionSubmitting(true);
    try {
      await unbindSessionCustomPass(item.id);
      message.success('小关卡已解绑');
      await Promise.all([loadSessions(), reloadBoundModal()]);
    } catch (error) {
      message.error(error?.message || '解绑失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBoundSortChange(item, value) {
    if (value === undefined || value === null || value === '') {
      return;
    }

    setActionSubmitting(true);
    try {
      await changeSessionCustomSort({
        id: Number(item.id),
        sort: Number(value),
      });
      message.success('小关卡排序已更新');
      await reloadBoundModal();
    } catch (error) {
      message.error(error?.message || '排序更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id' },
      { title: '标题', dataIndex: 'title', render: (value) => value || '-' },
      {
        title: '图标',
        dataIndex: 'icon',
        render: (value, record) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.title || 'session'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (value) => <Tag color={value === 1 ? 'success' : 'warning'}>{value === 1 ? '启用' : '禁用'}</Tag>,
      },
      { title: '顺序', dataIndex: 'sort', render: (value) => value ?? '-' },
      {
        title: '绑定小关卡',
        key: 'binding',
        render: (_, session) => (
          <Space size="small" wrap>
            <Select
              value={bindSelections[session.id] || undefined}
              placeholder="绑定小关卡"
              style={{ minWidth: 180 }}
              options={availableCustomPasses.map((item) => ({
                value: String(item.id),
                label: item.title,
              }))}
              onChange={(value) =>
                setBindSelections((current) => ({
                  ...current,
                  [session.id]: value,
                }))
              }
            />
            <Button onClick={() => handleBindCustomPass(session)} disabled={submitting || actionSubmitting}>
              绑定
            </Button>
            <Button type="link" onClick={() => openBoundModal(session)} style={{ paddingInline: 0 }}>
              已绑定小关卡
            </Button>
          </Space>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, session) => (
          <Space size="small" wrap>
            {partsId ? (
              <Link
                to={`/custom-passes?textbookId=${filterTextbookId}&sessionId=${session.id}&partsId=${partsId}`}
                className="ant-btn ant-btn-link"
              >
                查看小关卡
              </Link>
            ) : null}
            <Button type="link" onClick={() => openEditModal(session)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => handleToggleStatus(session)}
              disabled={submitting || actionSubmitting}
              style={{ paddingInline: 0 }}
            >
              {session.status === 1 ? '禁用' : '启用'}
            </Button>
            <Popconfirm
              title={`确认删除大关卡 ${session.title || session.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(session)}
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
    [actionSubmitting, availableCustomPasses, bindSelections, filterTextbookId, partsId, submitting],
  );

  const boundColumns = useMemo(
    () => [
      { title: '小关卡标题', dataIndex: 'customTitle', render: (_, item) => item.customTitle || item.title || '-' },
      {
        title: '图片',
        dataIndex: 'icon',
        render: (value, item) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={item.customTitle || 'custom-pass'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '排序',
        dataIndex: 'sort',
        render: (value, item) => (
          <InputNumber
            min={0}
            defaultValue={value ?? undefined}
            onBlur={(event) => handleBoundSortChange(item, event.target.value)}
          />
        ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, item) => (
          <Popconfirm
            title={`确认解绑小关卡 ${item.customTitle || item.title || item.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => handleUnbind(item)}
            disabled={actionSubmitting}
          >
            <Button type="link" danger disabled={actionSubmitting} style={{ paddingInline: 0 }}>
              解绑
            </Button>
          </Popconfirm>
        ),
      },
    ],
    [actionSubmitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            大关卡管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 session 管理模块，保留大关卡维护、状态切换，以及与小关卡的绑定关系。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--compact">
          <Form.Item label="教材 ID" style={{ marginBottom: 0 }}>
            <Input
              value={filterTextbookId}
              onChange={(event) => setFilterTextbookId(event.target.value)}
              placeholder="输入教材 ID"
            />
          </Form.Item>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              添加大关卡
            </Button>
            <Button onClick={() => navigate('/books')}>返回教材</Button>
            <Button onClick={() => loadSessions()} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      <Card
        title="大关卡列表"
        extra={<Typography.Text type="secondary">当前教材 ID: {filterTextbookId || '-'}，共 {sessions.length} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sessions}
          loading={loading}
          scroll={{ x: 1460 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增大关卡' : '编辑大关卡'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={720}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护大关卡的教材归属、标题、图片与顺序。
        </Typography.Paragraph>
        <Form form={form} layout="vertical" initialValues={EMPTY_SESSION_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            <Form.Item label="教材 ID" name="textbookId" rules={[{ required: true, message: '请输入教材 ID' }]}>
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入教材 ID" />
            </Form.Item>
            <Form.Item label="大关卡 ID" name="id" rules={[{ required: true, message: '请输入大关卡 ID' }]}>
              <InputNumber
                precision={0}
                style={{ width: '100%' }}
                placeholder="请输入大关卡 ID"
                disabled={modalMode === 'edit'}
              />
            </Form.Item>
            <Form.Item label="大关卡标题" name="title" rules={[{ required: true, message: '请输入大关卡标题' }]}>
              <Input placeholder="请输入大关卡标题" />
            </Form.Item>
            <Form.Item label="排序字段" name="sort">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
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
                    上传大关卡图片
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传大关卡图片'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="大关卡图片"
                  />
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={selectedSession.title ? `${selectedSession.title} 已绑定小关卡` : '已绑定小关卡'}
        open={boundModalOpen}
        onCancel={() => setBoundModalOpen(false)}
        footer={null}
        width={760}
      >
        <Typography.Paragraph type="secondary">
          这里保留旧版“查看已绑定小关卡”的能力，并支持解绑与排序。
        </Typography.Paragraph>
        <Table
          rowKey="id"
          columns={boundColumns}
          dataSource={boundCustomPasses}
          pagination={false}
          locale={{ emptyText: '暂无已绑定小关卡' }}
        />
      </Modal>
    </div>
  );
}
