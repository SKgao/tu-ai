import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  DatePicker,
  Descriptions,
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
import { toApiDateTime } from '@/app/lib/dateTime';
import {
  addSingleSubject,
  batchRemoveSubjectRecords,
  createSubjectScenePic,
  getSubjectRecordDetail,
  listSubjectRecords,
  listSubjects,
  removeSubjectRecord,
  removeSubjectScenePic,
  updateSubjectRecord,
  updateSubjectScenePic,
  uploadAsset,
} from '@/app/services/subjects';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_SUBJECT_FORM = {
  id: undefined,
  customsPassId: undefined,
  customsPassName: '',
  sourceIds: '',
  sort: undefined,
  showIndex: '',
  subject: undefined,
  icon: '',
  audio: '',
  sentenceAudio: '',
  sceneGraph: '',
  originalSceneGraph: '',
};

function isScenePassId(value) {
  return String(value) === '2' || String(value) === '8';
}

function buildSearch(searchParams, updates = {}, removals = []) {
  const nextSearch = new URLSearchParams(searchParams);
  removals.forEach((key) => nextSearch.delete(key));
  Object.entries(updates).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      nextSearch.delete(key);
      return;
    }
    nextSearch.set(key, String(value));
  });
  const result = nextSearch.toString();
  return result ? `?${result}` : '';
}

function normalizeFormValues(record, routeCustomsPassId) {
  if (!record) {
    return {
      ...EMPTY_SUBJECT_FORM,
      customsPassId: routeCustomsPassId || undefined,
    };
  }

  return {
    ...EMPTY_SUBJECT_FORM,
    id: Number(record.id),
    customsPassId: String(record.customsPassId || routeCustomsPassId || ''),
    customsPassName: record.customsPassName || '',
    sourceIds: record.sourceIds || '',
    sort: record.sort !== undefined && record.sort !== null ? Number(record.sort) : undefined,
    sceneGraph: record.sceneGraph && record.sceneGraph !== 'null' ? String(record.sceneGraph) : '',
    originalSceneGraph: record.sceneGraph && record.sceneGraph !== 'null' ? String(record.sceneGraph) : '',
  };
}

export function SubjectsManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const routeCustomsPassId = searchParams.get('customsPassId') || '';
  const partsId = searchParams.get('partsId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const textbookId = searchParams.get('textBookId') || searchParams.get('textbookId') || '';
  const topicId = searchParams.get('topicId') || '';
  const isDetailMode = searchParams.get('detpage') === '1' || Boolean(topicId);
  const [query, setQuery] = useState({
    startTime: '',
    endTime: '',
    customsPassId: routeCustomsPassId,
    customsPassName: '',
    sourceIds: '',
    pageNum: 1,
    pageSize: 10,
  });
  const [records, setRecords] = useState([]);
  const [detailRecord, setDetailRecord] = useState(null);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const currentCustomsPassId = Form.useWatch('customsPassId', modalForm);

  const enableSceneColumn = useMemo(() => {
    if (isScenePassId(routeCustomsPassId) || isScenePassId(currentCustomsPassId) || isScenePassId(detailRecord?.customsPassId)) {
      return true;
    }

    return records.some((item) => isScenePassId(item.customsPassId));
  }, [currentCustomsPassId, detailRecord?.customsPassId, records, routeCustomsPassId]);

  const detailResources = Array.isArray(detailRecord?.sourceVOS) ? detailRecord.sourceVOS : [];

  useEffect(() => {
    searchForm.setFieldsValue({
      startTime: undefined,
      endTime: undefined,
      customsPassName: '',
      sourceIds: '',
    });
    setQuery((current) => ({
      ...current,
      customsPassId: routeCustomsPassId,
      pageNum: 1,
    }));
    setSelectedIds([]);
  }, [routeCustomsPassId]);

  useEffect(() => {
    async function loadSubjectTypes() {
      try {
        const data = await listSubjects();
        setSubjectTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error?.message || '题型列表加载失败');
      }
    }

    loadSubjectTypes();
  }, []);

  useEffect(() => {
    if (isDetailMode) {
      return;
    }

    async function loadRecords() {
      setLoading(true);
      try {
        const data = await listSubjectRecords(query);
        setRecords(Array.isArray(data?.data) ? data.data : []);
        setTotalCount(data?.totalCount || 0);
        setSelectedIds([]);
      } catch (error) {
        message.error(error?.message || '题目列表加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [isDetailMode, query]);

  useEffect(() => {
    if (!isDetailMode || !topicId) {
      setDetailRecord(null);
      return;
    }

    async function loadDetail() {
      setLoading(true);
      try {
        const data = await getSubjectRecordDetail(topicId);
        setDetailRecord(data);
      } catch (error) {
        message.error(error?.message || '题目详情加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [isDetailMode, topicId]);

  function openCreateModal() {
    setModalMode('create');
    setUploadState({
      uploading: false,
      message: '',
    });
    modalForm.setFieldsValue(normalizeFormValues(null, routeCustomsPassId));
    setModalOpen(true);
  }

  function openEditModal(record) {
    setModalMode('edit');
    setUploadState({
      uploading: false,
      message: '',
    });
    modalForm.setFieldsValue(normalizeFormValues(record, routeCustomsPassId));
    setModalOpen(true);
  }

  async function handleUpload({ file, onError, onSuccess }, field) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      modalForm.setFieldValue(field, url);
      setUploadState({
        uploading: false,
        message: `${file.name} 上传成功`,
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

  async function reloadCurrentPage() {
    if (isDetailMode && topicId) {
      const data = await getSubjectRecordDetail(topicId);
      setDetailRecord(data);
      return;
    }

    const data = await listSubjectRecords(query);
    setRecords(Array.isArray(data?.data) ? data.data : []);
    setTotalCount(data?.totalCount || 0);
    setSelectedIds([]);
  }

  async function syncSceneGraph(subjectId, nextSceneGraph, previousSceneGraph) {
    const current = previousSceneGraph && previousSceneGraph !== 'null' ? previousSceneGraph : '';
    const next = nextSceneGraph && nextSceneGraph !== 'null' ? nextSceneGraph : '';

    if (current === next) {
      return;
    }

    if (!next && current) {
      await removeSubjectScenePic(subjectId);
      return;
    }

    if (!next) {
      return;
    }

    if (current) {
      await updateSubjectScenePic({ id: subjectId, scenePic: next });
      return;
    }

    await createSubjectScenePic({ id: subjectId, scenePic: next });
  }

  async function handleSubmit(values) {
    if (!values.customsPassId || !values.sourceIds?.trim()) {
      message.error('请填写关卡 ID 和题目内容');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await addSingleSubject({
          customsPassId: Number(values.customsPassId),
          partId: partsId ? Number(partsId) : undefined,
          sessionId: sessionId ? Number(sessionId) : undefined,
          sourceIds: values.sourceIds.trim(),
          sort: values.sort ?? undefined,
          showIndex: values.showIndex ? values.showIndex.trim().split(/\s+/g) : undefined,
          subject: values.subject ? Number(values.subject) : undefined,
          icon: values.icon?.trim() || '',
          audio: values.audio?.trim() || '',
          sentenceAudio: values.sentenceAudio?.trim() || '',
          sceneGraph: values.sceneGraph?.trim() || '',
        });
      } else {
        await updateSubjectRecord({
          id: Number(values.id),
          customsPassId: Number(values.customsPassId),
          customsPassName: values.customsPassName?.trim() || '',
          sourceIds: values.sourceIds.trim(),
          sort: values.sort ?? undefined,
        });

        if (isScenePassId(values.customsPassId)) {
          await syncSceneGraph(Number(values.id), values.sceneGraph?.trim() || '', values.originalSceneGraph);
        }
      }

      message.success(modalMode === 'create' ? '题目创建成功' : '题目更新成功');
      setModalOpen(false);
      await reloadCurrentPage();
    } catch (error) {
      message.error(error?.message || '题目提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(record) {
    setActionSubmitting(true);
    try {
      await removeSubjectRecord(record.id);
      message.success('题目已删除');
      if (isDetailMode) {
        navigate(`/subjects${buildSearch(searchParams, {}, ['topicId', 'detpage'])}`, { replace: true });
      } else if (records.length === 1 && query.pageNum > 1) {
        setQuery((current) => ({
          ...current,
          pageNum: current.pageNum - 1,
        }));
      } else {
        await reloadCurrentPage();
      }
    } catch (error) {
      message.error(error?.message || '题目删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchDelete() {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchRemoveSubjectRecords(selectedIds);
      message.success('批量删除成功');
      await reloadCurrentPage();
    } catch (error) {
      message.error(error?.message || '批量删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(() => {
    const base = [
      { title: '单元名称', dataIndex: 'unitsName', render: (value) => value || '-' },
      { title: 'Part 描述', dataIndex: 'partsTips', render: (value) => value || '-' },
      { title: 'Part 标题', dataIndex: 'partsTitle', render: (value) => value || '-' },
      { title: '关卡名称', dataIndex: 'customsPassName', render: (value) => value || '-' },
      { title: '题目内容', dataIndex: 'sourceIds', render: (value) => value || '-' },
      { title: '题目顺序', dataIndex: 'sort', render: (value) => value ?? '-' },
    ];

    if (enableSceneColumn) {
      base.push({
        title: '场景图',
        dataIndex: 'sceneGraph',
        render: (value, record) =>
          value && value !== 'null' ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.customsPassName || 'scene'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      });
    }

    base.push({
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => openEditModal(record)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() =>
              navigate(
                `/subjects${buildSearch(searchParams, {
                  topicId: record.id,
                  detpage: 1,
                })}`,
              )
            }
            style={{ paddingInline: 0 }}
          >
            查看详情
          </Button>
          <Popconfirm
            title={`确认删除题目 ${record.sourceIds || record.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
            disabled={submitting || actionSubmitting}
          >
            <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    });

    return base;
  }, [actionSubmitting, enableSceneColumn, navigate, searchParams, submitting]);

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {isDetailMode ? '题目详情' : '题目管理'}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {isDetailMode
              ? '这一页对应旧版题目详情视图，保留资源预览、编辑和删除能力。'
              : '这一页对应旧版 subjects 模块，保留查询、单题录入、增改删和场景图能力。'}
          </Typography.Paragraph>
        </Space>
      </Card>

      {!isDetailMode ? (
        <>
          <Card>
            <Form
              form={searchForm}
              layout="vertical"
              initialValues={{
                startTime: undefined,
                endTime: undefined,
                customsPassName: '',
                sourceIds: '',
              }}
              onFinish={(values) =>
                setQuery((current) => ({
                  ...current,
                  startTime: toApiDateTime(values.startTime),
                  endTime: toApiDateTime(values.endTime),
                  customsPassId: routeCustomsPassId.trim(),
                  customsPassName: values.customsPassName?.trim() || '',
                  sourceIds: values.sourceIds?.trim() || '',
                  pageNum: 1,
                }))
              }
            >
              <div className="toolbar-grid">
                <Form.Item label="开始时间" name="startTime">
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="结束时间" name="endTime">
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="关卡名称" name="customsPassName">
                  <Input placeholder="请输入关卡名称" />
                </Form.Item>
                <Form.Item label="题目内容" name="sourceIds">
                  <Input placeholder="请输入题目内容" />
                </Form.Item>
              </div>
              <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
                <Typography.Text type="secondary">
                  当前关卡 ID: {routeCustomsPassId || '-'}，教材 ID: {textbookId || '-'}，Part ID: {partsId || '-'}，大关卡 ID: {sessionId || '-'}
                </Typography.Text>
                <Space wrap>
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                  <Button type="primary" ghost icon={<PlusOutlined />} onClick={openCreateModal}>
                    添加题目
                  </Button>
                  <Button danger onClick={handleBatchDelete} disabled={!selectedIds.length || submitting || actionSubmitting}>
                    批量删除
                  </Button>
                  <Button onClick={() => navigate(-1)}>返回上一层</Button>
                </Space>
              </div>
            </Form>
          </Card>

          <Card title="题目列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录，已选 {selectedIds.length} 条</Typography.Text>}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={records}
              loading={loading}
              rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: (nextKeys) => setSelectedIds(nextKeys),
              }}
              scroll={{ x: enableSceneColumn ? 1380 : 1280 }}
              pagination={buildAntdTablePagination({
                query,
                totalCount,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                setPageNum: (pageNum) => setQuery((current) => ({ ...current, pageNum })),
                setPageSize: (pageSize) => setQuery((current) => ({ ...current, pageNum: 1, pageSize })),
              })}
            />
          </Card>
        </>
      ) : (
        <Card
          title="题目详情"
          extra={
            <Space wrap>
              <Button onClick={() => navigate(`/subjects${buildSearch(searchParams, {}, ['topicId', 'detpage'])}`)}>
                返回列表
              </Button>
              {detailRecord ? (
                <Button type="primary" onClick={() => openEditModal(detailRecord)}>
                  编辑题目
                </Button>
              ) : null}
            </Space>
          }
        >
          {loading ? <Typography.Text type="secondary">数据加载中...</Typography.Text> : null}
          {!loading && !detailRecord ? <Typography.Text type="secondary">未找到题目详情</Typography.Text> : null}
          {!loading && detailRecord ? (
            <Space orientation="vertical" size={20} style={{ width: '100%' }}>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Topic ID">{detailRecord.id || topicId || '-'}</Descriptions.Item>
                <Descriptions.Item label="关卡 ID">{detailRecord.customsPassId ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="关卡名称">{detailRecord.customsPassName || '-'}</Descriptions.Item>
                <Descriptions.Item label="题目顺序">{detailRecord.sort ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{detailRecord.createdAt || '-'}</Descriptions.Item>
                <Descriptions.Item label="题目内容" span={2}>
                  {detailRecord.sourceIds || '-'}
                </Descriptions.Item>
              </Descriptions>

              {detailRecord.sceneGraph && detailRecord.sceneGraph !== 'null' ? (
                <div>
                  <Typography.Title level={5}>场景图</Typography.Title>
                  <Image width={160} src={detailRecord.sceneGraph} alt={detailRecord.customsPassName || 'scene'} />
                </div>
              ) : null}

              <Space wrap>
                <Button onClick={() => reloadCurrentPage()}>刷新详情</Button>
                <Button onClick={() => openEditModal(detailRecord)}>编辑</Button>
                <Popconfirm
                  title={`确认删除题目 ${detailRecord.sourceIds || detailRecord.id} 吗？`}
                  okText="确认"
                  cancelText="取消"
                  onConfirm={() => handleDelete(detailRecord)}
                  disabled={submitting || actionSubmitting}
                >
                  <Button danger disabled={submitting || actionSubmitting}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>

              <Table
                rowKey={(resource, index) => `${resource.id || resource.text || 'resource'}-${index}`}
                columns={[
                  { title: '资源文本', dataIndex: 'text', render: (value) => value || '-' },
                  {
                    title: '图片',
                    dataIndex: 'icon',
                    render: (value, resource) =>
                      value ? (
                        <Image
                          width={52}
                          height={52}
                          style={{ borderRadius: 16, objectFit: 'cover' }}
                          src={value}
                          alt={resource.text || 'resource'}
                        />
                      ) : (
                        <Typography.Text type="secondary">无</Typography.Text>
                      ),
                  },
                  {
                    title: '音频',
                    dataIndex: 'audio',
                    render: (value) =>
                      value ? <audio controls src={value} className="subject-audio" /> : <Typography.Text type="secondary">无</Typography.Text>,
                  },
                ]}
                dataSource={detailResources}
                pagination={false}
                locale={{ emptyText: '暂无资源明细' }}
              />
            </Space>
          ) : null}
        </Card>
      )}

      <Modal
        title={modalMode === 'create' ? '新增题目' : '编辑题目'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => modalForm.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={840}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          {modalMode === 'create' ? '保留新架构下最常用的单题录入能力。' : '维护题目内容、顺序、关卡名和场景图。'}
        </Typography.Paragraph>
        <Form form={modalForm} layout="vertical" initialValues={EMPTY_SUBJECT_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {modalMode === 'edit' ? (
              <Form.Item label="题目 ID" name="id">
                <Input disabled />
              </Form.Item>
            ) : null}
            <Form.Item label="关卡 ID" name="customsPassId" rules={[{ required: true, message: '请输入关卡 ID' }]}>
              <Input disabled={Boolean(routeCustomsPassId) || modalMode === 'edit'} placeholder="请输入关卡 ID" />
            </Form.Item>
            {modalMode === 'create' ? (
              <Form.Item label="题型" name="subject">
                <Select
                  allowClear
                  placeholder="可选"
                  options={subjectTypes.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                />
              </Form.Item>
            ) : (
              <Form.Item label="关卡名称" name="customsPassName">
                <Input placeholder="请输入关卡名称" />
              </Form.Item>
            )}
            <Form.Item label="题目内容" name="sourceIds" className="form-field--full" rules={[{ required: true, message: '请输入题目内容' }]}>
              <Input placeholder="请输入题目内容" />
            </Form.Item>
            <Form.Item label="题目顺序" name="sort">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入题目顺序" />
            </Form.Item>
            {modalMode === 'create' ? (
              <Form.Item label="挖空规则" name="showIndex">
                <Input placeholder="数字之间用空格分隔" />
              </Form.Item>
            ) : null}

            {modalMode === 'create' ? (
              <>
                <Form.Item label="题目图片地址" name="icon" className="form-field--full">
                  <Input placeholder="可直接粘贴图片 URL" />
                </Form.Item>
                <Form.Item label="题目音频地址" name="audio" className="form-field--full">
                  <Input placeholder="可直接粘贴音频 URL" />
                </Form.Item>
                <Form.Item label="句子音频地址" name="sentenceAudio" className="form-field--full">
                  <Input placeholder="可直接粘贴句子音频 URL" />
                </Form.Item>
              </>
            ) : null}

            {isScenePassId(currentCustomsPassId) ? (
              <>
                <Form.Item label="场景图地址" name="sceneGraph" className="form-field--full">
                  <Input placeholder="可直接粘贴场景图 URL" />
                </Form.Item>
                <Form.Item name="originalSceneGraph" hidden>
                  <Input />
                </Form.Item>
              </>
            ) : null}

            {[
              ...(modalMode === 'create'
                ? [
                    { field: 'icon', label: '题目图片', accept: 'image/*' },
                    { field: 'audio', label: '题目音频', accept: 'audio/*' },
                    { field: 'sentenceAudio', label: '句子音频', accept: 'audio/*' },
                  ]
                : []),
              ...(isScenePassId(currentCustomsPassId) ? [{ field: 'sceneGraph', label: '场景图', accept: 'image/*' }] : []),
            ].map((item) => (
              <Form.Item key={item.field} label={`上传${item.label}`} className="form-field--full">
                <Upload
                  accept={item.accept}
                  maxCount={1}
                  showUploadList={false}
                  customRequest={(options) => handleUpload(options, item.field)}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传{item.label}
                  </Button>
                </Upload>
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
