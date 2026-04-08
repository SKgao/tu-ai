import React, { useEffect, useMemo, useState } from 'react';
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
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { toApiDateTime } from '@/app/lib/dateTime';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import {
  batchDownloadSourceMaterialAudio,
  batchRemoveSourceMaterials,
  batchSyncSourceMaterials,
  createSourceMaterial,
  importSubjectSources,
  listBooks,
  listSourceMaterials,
  removeSourceMaterial,
  updateSourceMaterial,
  uploadAsset,
} from '@/app/services/source-material';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const IS_PRODUCTION_API = false;

const EMPTY_MATERIAL_FORM = {
  id: undefined,
  textbookId: undefined,
  text: '',
  icon: '',
  audio: '',
  translation: '',
  explainsArray: '',
};

const EMPTY_IMPORT_FORM = {
  textbookId: undefined,
  audioArray: [],
  imageArray: [],
  sentensArray: [],
};

function getFileBaseName(fileName) {
  const name = String(fileName || '').trim();
  const index = name.lastIndexOf('.');
  if (index <= 0) {
    return name;
  }
  return name.slice(0, index);
}

function normalizeMaterialFormValues(item) {
  if (!item) {
    return { ...EMPTY_MATERIAL_FORM };
  }

  return {
    id: Number(item.id),
    textbookId: item.textbookId ? String(item.textbookId) : undefined,
    text: item.text || '',
    icon: item.icon || '',
    audio: item.audio || '',
    translation: item.translation || '',
    explainsArray: item.explainsArray || '',
  };
}

export function SourceMaterialManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [materialForm] = Form.useForm();
  const [importForm] = Form.useForm();
  const [books, setBooks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialModalMode, setMaterialModalMode] = useState('create');
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const {
    query,
    data: materials,
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
      text: '',
      openLike: '',
      pageNum: 1,
      pageSize: 10,
    },
    request: listSourceMaterials,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '素材列表加载失败'),
  });

  useEffect(() => {
    async function loadBookOptions() {
      try {
        const data = await listBooks({
          pageNum: 1,
          pageSize: 100,
        });
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(error?.message || '教材列表加载失败');
      }
    }

    loadBookOptions();
  }, []);

  async function handleUpload({ file, onError, onSuccess }, field) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      const current = materialForm.getFieldsValue();
      const next = {
        ...current,
        [field]: url,
      };

      if (!String(next.text || '').trim()) {
        if (field === 'icon') {
          next.text = getFileBaseName(file.name);
        } else if (field === 'audio' && !current.icon) {
          next.text = getFileBaseName(file.name).replace(/[^a-zA-Z]/g, '').toLowerCase();
        }
      }

      materialForm.setFieldsValue(next);
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

  function openCreateModal() {
    setMaterialModalMode('create');
    setUploadState({
      uploading: false,
      message: '',
    });
    materialForm.setFieldsValue({ ...EMPTY_MATERIAL_FORM });
    setMaterialModalOpen(true);
  }

  function openEditModal(item) {
    setMaterialModalMode('edit');
    setUploadState({
      uploading: false,
      message: '',
    });
    materialForm.setFieldsValue(normalizeMaterialFormValues(item));
    setMaterialModalOpen(true);
  }

  async function handleSubmit(values) {
    if (materialModalMode === 'create' && !values.textbookId) {
      message.error('请选择教材');
      return;
    }

    if (!values.text?.trim()) {
      message.error('请填写素材内容');
      return;
    }

    const payload = {
      text: values.text.trim(),
      icon: values.icon?.trim() || '',
      audio: values.audio?.trim() || '',
      translation: values.translation?.trim() || '',
      explainsArray: values.explainsArray?.trim() || '',
    };

    setSubmitting(true);
    try {
      if (materialModalMode === 'create') {
        await createSourceMaterial({
          ...payload,
          textbookId: Number(values.textbookId),
        });
      } else {
        await updateSourceMaterial({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(materialModalMode === 'create' ? '素材创建成功' : '素材更新成功');
      setMaterialModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '素材提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    setActionSubmitting(true);
    try {
      await removeSourceMaterial(item.id);
      message.success('素材已删除');
      if (materials.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '素材删除失败');
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
      await batchRemoveSourceMaterials(selectedIds);
      message.success('批量删除成功');
      await reload().catch(() => {});
      setSelectedIds([]);
    } catch (error) {
      message.error(error?.message || '批量删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchDownload() {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchDownloadSourceMaterialAudio(selectedIds);
      message.success('批量下载请求已提交');
    } catch (error) {
      message.error(error?.message || '批量下载失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchSync() {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchSyncSourceMaterials(selectedIds);
      message.success('批量同步成功');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '批量同步失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleImport(values) {
    if (!values.textbookId) {
      message.error('请选择教材');
      return;
    }

    setSubmitting(true);
    try {
      const result = await importSubjectSources({
        textbookId: Number(values.textbookId),
        audioArray: (values.audioArray || []).map((file) => file.name || file.originFileObj?.name).filter(Boolean),
        imageArray: (values.imageArray || []).map((file) => file.name || file.originFileObj?.name).filter(Boolean),
        sentensArray: (values.sentensArray || []).map((file) => file.name || file.originFileObj?.name).filter(Boolean),
      });
      setImportResult(result || '');
      message.success('素材导入请求已提交');
      setImportOpen(false);
    } catch (error) {
      message.error(error?.message || '素材导入失败');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      { title: '素材内容', dataIndex: 'text', render: (value) => value || '-' },
      {
        title: '素材图标',
        dataIndex: 'icon',
        render: (value, item) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={item.text || 'source'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '素材音频',
        dataIndex: 'audio',
        render: (value) =>
          value ? <audio controls src={value} className="subject-audio" /> : <Typography.Text type="secondary">无</Typography.Text>,
      },
      { title: '单次释义', dataIndex: 'translation', render: (value) => value || '[]' },
      { title: '多次释义', dataIndex: 'explainsArray', render: (value) => value || '[]' },
      { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
      {
        title: '操作',
        key: 'actions',
        render: (_, item) => (
          <Space size="small" wrap>
            <Button type="link" onClick={() => openEditModal(item)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Popconfirm
              title={`确认删除素材 ${item.text || item.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(item)}
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
            素材管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `sourceMaterial` 模块，保留查询、增改删、批量操作和素材导入能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      {importResult ? (
        <Card
          title="最近一次导入结果"
          extra={<Button onClick={() => setImportResult('')}>清空</Button>}
        >
          <Typography.Paragraph type="secondary">
            后端返回的是 HTML 文本，这里做只读展示。
          </Typography.Paragraph>
          <div className="html-result-card" dangerouslySetInnerHTML={{ __html: importResult }} />
        </Card>
      ) : null}

      <Card>
        <Form
          form={searchForm}
          layout="vertical"
          initialValues={{
            startTime: undefined,
            endTime: undefined,
            text: '',
            fuzzySearch: true,
          }}
          onFinish={(values) =>
            applyFilters({
              startTime: toApiDateTime(values.startTime),
              endTime: toApiDateTime(values.endTime),
              text: values.text?.trim() || '',
              openLike: values.fuzzySearch ? '' : 1,
            })
          }
        >
          <div className="toolbar-grid">
            <Form.Item label="开始时间" name="startTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="结束时间" name="endTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="素材内容" name="text">
              <Input placeholder="请输入素材内容" />
            </Form.Item>
            <Form.Item label="搜索模式" name="fuzzySearch">
              <Select
                options={[
                  { value: true, label: '模糊搜索' },
                  { value: false, label: '精确搜索' },
                ]}
              />
            </Form.Item>
          </div>
          <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
            <Typography.Text type="secondary">
              当前共 {totalCount} 条素材，已选 {selectedIds.length} 条
            </Typography.Text>
            <Space wrap>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button type="primary" ghost icon={<PlusOutlined />} onClick={openCreateModal}>
                添加素材
              </Button>
              <Button onClick={() => {
                importForm.setFieldsValue({ ...EMPTY_IMPORT_FORM });
                setImportOpen(true);
              }}>
                导入素材
              </Button>
              <Button danger onClick={handleBatchDelete} disabled={!selectedIds.length || submitting || actionSubmitting}>
                批量删除
              </Button>
              <Button onClick={handleBatchDownload} disabled={!selectedIds.length || submitting || actionSubmitting}>
                批量下载音频
              </Button>
              {!IS_PRODUCTION_API ? (
                <Button onClick={handleBatchSync} disabled={!selectedIds.length || submitting || actionSubmitting}>
                  批量同步
                </Button>
              ) : null}
            </Space>
          </div>
        </Form>
      </Card>

      <Card title="素材列表" extra={<Typography.Text type="secondary">支持内容、图标、音频和释义维护</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={materials}
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectedIds,
            onChange: (nextKeys) => setSelectedIds(nextKeys),
          }}
          scroll={{ x: 1260 }}
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
        title={materialModalMode === 'create' ? '新增素材' : '编辑素材'}
        open={materialModalOpen}
        onCancel={() => setMaterialModalOpen(false)}
        onOk={() => materialForm.submit()}
        okText={materialModalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={840}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护素材文本、图标、音频和释义信息。
        </Typography.Paragraph>
        <Form form={materialForm} layout="vertical" initialValues={EMPTY_MATERIAL_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {materialModalMode === 'edit' ? (
              <Form.Item label="素材 ID" name="id">
                <Input disabled />
              </Form.Item>
            ) : null}
            <Form.Item label="教材" name="textbookId" rules={[{ required: materialModalMode === 'create', message: '请选择教材' }]}>
              <Select
                placeholder="请选择教材"
                disabled={materialModalMode === 'edit'}
                options={books.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="素材内容" name="text" rules={[{ required: true, message: '请输入素材内容' }]}>
              <Input placeholder="请输入素材内容" />
            </Form.Item>
            <Form.Item label="素材图标地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="素材音频地址" name="audio" className="form-field--full">
              <Input placeholder="可直接粘贴音频 URL" />
            </Form.Item>
            <Form.Item label="单次释义" name="translation" className="form-field--full">
              <Input placeholder="请输入单次释义，例如 [dog]" />
            </Form.Item>
            <Form.Item label="多次释义" name="explainsArray" className="form-field--full">
              <Input.TextArea rows={4} placeholder='请输入多次释义，例如 ["dog","hound"]' />
            </Form.Item>
            {[
              { field: 'icon', label: '上传图片', accept: 'image/*' },
              { field: 'audio', label: '上传音频', accept: 'audio/*' },
            ].map((item) => (
              <Form.Item key={item.field} label={item.label} className="form-field--full">
                <Upload
                  accept={item.accept}
                  maxCount={1}
                  showUploadList={false}
                  customRequest={(options) => handleUpload(options, item.field)}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    {item.label}
                  </Button>
                </Upload>
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>

      <Modal
        title="导入素材"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={() => importForm.submit()}
        okText="开始导入"
        cancelText="取消"
        confirmLoading={submitting}
        width={720}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          兼容旧页的目录导入思路，当前提交文件名数组给后端处理。
        </Typography.Paragraph>
        <Form form={importForm} layout="vertical" initialValues={EMPTY_IMPORT_FORM} onFinish={handleImport}>
          <div className="form-grid">
            <Form.Item label="教材" name="textbookId" className="form-field--full" rules={[{ required: true, message: '请选择教材' }]}>
              <Select
                placeholder="请选择教材"
                options={books.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            {[
              { field: 'audioArray', label: '单词音频' },
              { field: 'imageArray', label: '图片素材' },
              { field: 'sentensArray', label: '句子音频' },
            ].map((item) => (
              <Form.Item key={item.field} label={item.label} name={item.field} valuePropName="fileList" getValueFromEvent={(event) => event?.fileList || []}>
                <Upload beforeUpload={() => false} multiple>
                  <Button>{`选择${item.label}`}</Button>
                </Upload>
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
