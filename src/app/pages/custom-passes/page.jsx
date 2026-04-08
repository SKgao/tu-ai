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
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import {
  addSingleSubject,
  createCustomPass,
  listCustomPasses,
  listSubjects,
  removeCustomPass,
  updateCustomPass,
  uploadAsset,
} from '@/app/services/custom-passes';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_PASS_FORM = {
  id: undefined,
  textbookId: undefined,
  title: '',
  tmpTitle: '',
  icon: '',
  sort: undefined,
};

const EMPTY_TOPIC_FORM = {
  customsPassId: undefined,
  sourceIds: '',
  sort: undefined,
  showIndex: '',
  icon: '',
  audio: '',
  sceneGraph: '',
  sentenceAudio: '',
  subject: undefined,
};

function normalizePassFormValues(pass, textbookId) {
  if (!pass) {
    return {
      ...EMPTY_PASS_FORM,
      textbookId: textbookId ? Number(textbookId) : undefined,
    };
  }

  return {
    id: Number(pass.id),
    textbookId: textbookId ? Number(textbookId) : undefined,
    title: pass.title || '',
    tmpTitle: pass.tmpTitle || '',
    icon: pass.icon || '',
    sort: pass.sort !== undefined && pass.sort !== null ? Number(pass.sort) : undefined,
  };
}

export function CustomPassManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passForm] = Form.useForm();
  const [topicForm] = Form.useForm();
  const textbookId = searchParams.get('textbookId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [subjects, setSubjects] = useState([]);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passModalMode, setPassModalMode] = useState('create');
  const [topicOpen, setTopicOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const passIconValue = Form.useWatch('icon', passForm);
  const {
    query,
    data: passList,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      textbookId,
      pageNum: 1,
      pageSize: 10,
    },
    enabled: Boolean(textbookId),
    request: listCustomPasses,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '小关卡列表加载失败'),
  });

  useEffect(() => {
    async function loadSubjectTypes() {
      try {
        const data = await listSubjects();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error?.message || '题型列表加载失败');
      }
    }

    if (partsId) {
      loadSubjectTypes();
    }
  }, [partsId]);

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateModal() {
    setPassModalMode('create');
    resetUploadState();
    passForm.setFieldsValue(normalizePassFormValues(null, textbookId));
    setPassModalOpen(true);
  }

  function openEditModal(pass) {
    setPassModalMode('edit');
    resetUploadState();
    passForm.setFieldsValue(normalizePassFormValues(pass, textbookId));
    setPassModalOpen(true);
  }

  async function handleUpload({ file, onError, onSuccess }, field = 'icon', target = 'pass') {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      if (target === 'topic') {
        topicForm.setFieldValue(field, url);
      } else {
        passForm.setFieldValue('icon', url);
      }

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

  async function handlePassSubmit(values) {
    if (values.textbookId === undefined || values.id === undefined || !values.title?.trim() || !values.tmpTitle?.trim()) {
      message.error('请填写教材 ID、小关卡 ID、标题和过渡标题');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        textbookId: Number(values.textbookId),
        id: Number(values.id),
        title: values.title.trim(),
        tmpTitle: values.tmpTitle.trim(),
        icon: values.icon?.trim() || '',
        sort: values.sort ?? undefined,
      };

      if (passModalMode === 'create') {
        await createCustomPass(payload);
      } else {
        await updateCustomPass(payload);
      }

      message.success(passModalMode === 'create' ? '小关卡创建成功' : '小关卡更新成功');
      setPassModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '小关卡提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(pass) {
    setActionSubmitting(true);
    try {
      await removeCustomPass({
        id: pass.id,
        textbookId,
      });
      message.success('小关卡已删除');
      if (passList.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '小关卡删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleTopicSubmit(values) {
    if (!values.customsPassId || !values.sourceIds?.trim()) {
      message.error('请先选择小关卡并填写题目内容');
      return;
    }

    setSubmitting(true);
    try {
      await addSingleSubject({
        customsPassId: Number(values.customsPassId),
        partId: partsId ? Number(partsId) : undefined,
        sessionId: sessionId ? Number(sessionId) : undefined,
        sourceIds: values.sourceIds.trim(),
        sort: values.sort ?? undefined,
        showIndex: values.showIndex ? values.showIndex.split(/\s+/g) : undefined,
        icon: values.icon || '',
        audio: values.audio || '',
        sentenceAudio: values.sentenceAudio || '',
        sceneGraph: values.sceneGraph || '',
        subject: values.subject ? Number(values.subject) : undefined,
      });
      message.success('题目添加成功');
      setTopicOpen(false);
    } catch (error) {
      message.error(error?.message || '题目添加失败');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: '小关卡 ID', dataIndex: 'id' },
      { title: '标题', dataIndex: 'title', render: (value) => value || '-' },
      { title: '过渡标题', dataIndex: 'tmpTitle', render: (value) => value || '-' },
      {
        title: '图片',
        dataIndex: 'icon',
        render: (value, pass) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={pass.title || 'custom-pass'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
      { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
      {
        title: '详情',
        key: 'details',
        render: (_, pass) =>
          pass.id ? (
            <Link
              to={`/subjects?customsPassId=${pass.id}&partsId=${partsId}&sessionId=${sessionId}`}
              className="ant-btn ant-btn-link"
            >
              查看题目
            </Link>
          ) : (
            <Typography.Text type="secondary">无可用题目</Typography.Text>
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
              title={`确认删除小关卡 ${pass.title || pass.id} 吗？`}
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
    [actionSubmitting, partsId, sessionId, submitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            小关卡管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 customPass 管理模块，保留小关卡维护，并在 `partsId` 存在时保留单题录入入口。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">
            当前教材 ID: {textbookId || '-'}，大关卡 ID: {sessionId || '-'}，Part ID: {partsId || '-'}
          </Typography.Text>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              添加小关卡
            </Button>
            {partsId ? (
              <Button type="primary" ghost onClick={() => {
                topicForm.setFieldsValue({ ...EMPTY_TOPIC_FORM });
                resetUploadState();
                setTopicOpen(true);
              }}>
                添加题目
              </Button>
            ) : null}
            <Button onClick={() => navigate(partsId ? `/parts?textBookId=${textbookId}&unitId=` : '/passes')}>
              返回上一层
            </Button>
            <Button onClick={() => reload().catch(() => {})} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="小关卡列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={passList}
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
        title={passModalMode === 'create' ? '新增小关卡' : '编辑小关卡'}
        open={passModalOpen}
        onCancel={() => setPassModalOpen(false)}
        onOk={() => passForm.submit()}
        okText={passModalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={720}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护小关卡标题、过渡标题、图片与教材归属。
        </Typography.Paragraph>
        <Form form={passForm} layout="vertical" initialValues={EMPTY_PASS_FORM} onFinish={handlePassSubmit}>
          <div className="form-grid">
            <Form.Item label="教材 ID" name="textbookId" rules={[{ required: true, message: '请输入教材 ID' }]}>
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入教材 ID" />
            </Form.Item>
            <Form.Item label="小关卡 ID" name="id" rules={[{ required: true, message: '请输入小关卡 ID' }]}>
              <InputNumber
                precision={0}
                style={{ width: '100%' }}
                placeholder="请输入小关卡 ID"
                disabled={passModalMode === 'edit'}
              />
            </Form.Item>
            <Form.Item label="小关卡标题" name="title" rules={[{ required: true, message: '请输入小关卡标题' }]}>
              <Input placeholder="请输入小关卡标题" />
            </Form.Item>
            <Form.Item label="过渡标题" name="tmpTitle" rules={[{ required: true, message: '请输入过渡标题' }]}>
              <Input placeholder="请输入过渡标题" />
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
                  customRequest={(options) => handleUpload(options)}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传小关卡图片
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传小关卡图片'}
                </Typography.Text>
                {passIconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={passIconValue}
                    alt="小关卡图片"
                  />
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="添加题目"
        open={topicOpen}
        onCancel={() => setTopicOpen(false)}
        onOk={() => topicForm.submit()}
        okText="创建"
        cancelText="取消"
        confirmLoading={submitting}
        width={820}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          这是旧版 `AddProject` 的轻量迁移版，保留最常用的单题录入能力。
        </Typography.Paragraph>
        <Form form={topicForm} layout="vertical" initialValues={EMPTY_TOPIC_FORM} onFinish={handleTopicSubmit}>
          <div className="form-grid">
            <Form.Item label="小关卡" name="customsPassId" rules={[{ required: true, message: '请选择小关卡' }]}>
              <Select
                placeholder="请选择小关卡"
                options={passList.map((item) => ({
                  value: String(item.id),
                  label: item.title,
                }))}
              />
            </Form.Item>
            <Form.Item label="题型" name="subject">
              <Select
                allowClear
                placeholder="请选择题型"
                options={subjects.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="题目内容" name="sourceIds" className="form-field--full" rules={[{ required: true, message: '请输入题目内容' }]}>
              <Input placeholder="请输入题目内容" />
            </Form.Item>
            <Form.Item label="题目顺序" name="sort">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入题目顺序" />
            </Form.Item>
            <Form.Item label="挖空规则" name="showIndex">
              <Input placeholder="数字之间用空格分隔" />
            </Form.Item>
            {[
              { field: 'icon', label: '题目图片', accept: 'image/*' },
              { field: 'audio', label: '题目音频', accept: 'audio/*' },
              { field: 'sentenceAudio', label: '句子音频', accept: 'audio/*' },
              { field: 'sceneGraph', label: '场景图片', accept: 'image/*' },
            ].map((item) => (
              <Form.Item key={item.field} label={item.label} className="form-field--full">
                <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                  <Form.Item name={item.field} noStyle>
                    <Input placeholder={`可直接粘贴${item.label} URL`} />
                  </Form.Item>
                  <Upload
                    accept={item.accept}
                    maxCount={1}
                    showUploadList={false}
                    customRequest={(options) => handleUpload(options, item.field, 'topic')}
                    disabled={uploadState.uploading}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                      上传{item.label}
                    </Button>
                  </Upload>
                </Space>
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
