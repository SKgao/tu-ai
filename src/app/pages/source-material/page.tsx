import { useState } from 'react';
import type { Key } from 'react';
import { App, Button, Card, Form, Table, Typography } from 'antd';
import type { FormProps, UploadFile, UploadProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
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
import { ImportSourceMaterialModal } from './components/ImportSourceMaterialModal';
import { SourceMaterialModal } from './components/SourceMaterialModal';
import { SourceMaterialSearchForm } from './components/SourceMaterialSearchForm';
import { createSourceMaterialColumns } from './configs/tableColumns';
import {
  EMPTY_MATERIAL_FORM,
  PAGE_SIZE_OPTIONS,
  buildSourceMaterialSearchFilters,
  getFileBaseName,
  normalizeMaterialFormValues,
} from './utils/forms';
import type {
  ImportSourceMaterialFormValues,
  SourceMaterialBookListResult,
  SourceMaterialBookOption,
  SourceMaterialFormValues,
  SourceMaterialListResult,
  SourceMaterialQuery,
  SourceMaterialRecord,
  SourceMaterialSearchValues,
} from './types';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];
type UploadField = 'icon' | 'audio';
type UploadRequestFile = UploadRequestOptions['file'];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getUploadFileName(file: UploadRequestFile): string {
  return typeof file === 'object' && file !== null && 'name' in file && typeof file.name === 'string' && file.name
    ? file.name
    : '文件';
}

function getImportFileName(file: UploadFile): string | undefined {
  return file.name || file.originFileObj?.name;
}

function isNonEmptyString(value: string | undefined): value is string {
  return Boolean(value);
}

function getImportFileNames(files: UploadFile[] = []): string[] {
  return files.map(getImportFileName).filter(isNonEmptyString);
}

export function SourceMaterialManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<SourceMaterialSearchValues>();
  const [materialForm] = Form.useForm<SourceMaterialFormValues>();
  const [importForm] = Form.useForm<ImportSourceMaterialFormValues>();
  const [books, setBooks] = useState<SourceMaterialBookOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Key[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const materialModal = useFormModal<SourceMaterialRecord>({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      materialForm.setFieldsValue({ ...EMPTY_MATERIAL_FORM });
    },
    onOpenEdit: (item) => {
      resetUploadState();
      materialForm.setFieldsValue(normalizeMaterialFormValues(item));
    },
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
  } = useRemoteTable<SourceMaterialQuery, SourceMaterialListResult, SourceMaterialRecord>({
    initialQuery: {
      startTime: '',
      endTime: '',
      text: '',
      openLike: '',
      pageNum: 1,
      pageSize: 10,
    },
    request: async (currentQuery) =>
      (await listSourceMaterials(currentQuery)) as SourceMaterialListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '素材列表加载失败'),
  });

  useMountEffect(() => {
    async function loadBookOptions() {
      try {
        const data = (await listBooks({
          pageNum: 1,
          pageSize: 100,
        })) as SourceMaterialBookListResult;
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(getErrorMessage(error, '教材列表加载失败'));
      }
    }

    return loadBookOptions();
  });

  async function handleUpload(options: UploadRequestOptions, field: UploadField): Promise<void> {
    const { file, onError, onSuccess } = options;
    const fileName = getUploadFileName(file);

    setUploading(fileName);

    try {
      if (!(file instanceof Blob)) {
        throw new Error('上传文件无效');
      }

      const url = await uploadAsset(file);
      const current = materialForm.getFieldsValue();
      const next: SourceMaterialFormValues = { ...current };
      next[field] = url;

      if (!String(next.text || '').trim()) {
        if (field === 'icon') {
          next.text = getFileBaseName(fileName);
        } else if (field === 'audio' && !current.icon) {
          next.text = getFileBaseName(fileName).replace(/[^a-zA-Z]/g, '').toLowerCase();
        }
      }

      materialForm.setFieldsValue(next);
      setUploadSuccess(`${fileName} 上传成功`);
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = getErrorMessage(error, '上传失败');
      const uploadError = error instanceof Error ? error : new Error(errorMessage);
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError);
    }
  }

  const handleSubmit: FormProps<SourceMaterialFormValues>['onFinish'] = async (values) => {
    if (materialModal.mode === 'create' && !values.textbookId) {
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
      if (materialModal.mode === 'create') {
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

      message.success(materialModal.mode === 'create' ? '素材创建成功' : '素材更新成功');
      materialModal.setOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(getErrorMessage(error, '素材提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(item: SourceMaterialRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeSourceMaterial(Number(item.id));
      message.success('素材已删除');
      if (materials.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(getErrorMessage(error, '素材删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchDelete(): Promise<void> {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchRemoveSourceMaterials(selectedIds.map((id) => Number(id)));
      message.success('批量删除成功');
      await reload().catch(() => {});
      setSelectedIds([]);
    } catch (error) {
      message.error(getErrorMessage(error, '批量删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchDownload(): Promise<void> {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchDownloadSourceMaterialAudio(selectedIds.map((id) => Number(id)));
      message.success('批量下载请求已提交');
    } catch (error) {
      message.error(getErrorMessage(error, '批量下载失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchSync(): Promise<void> {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchSyncSourceMaterials(selectedIds.map((id) => Number(id)));
      message.success('批量同步成功');
      await reload().catch(() => {});
    } catch (error) {
      message.error(getErrorMessage(error, '批量同步失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const handleImport: FormProps<ImportSourceMaterialFormValues>['onFinish'] = async (values) => {
    if (!values.textbookId) {
      message.error('请选择教材');
      return;
    }

    setSubmitting(true);
    try {
      const result = await importSubjectSources({
        textbookId: Number(values.textbookId),
        audioArray: getImportFileNames(values.audioArray),
        imageArray: getImportFileNames(values.imageArray),
        sentensArray: getImportFileNames(values.sentensArray),
      });
      setImportResult(result || '');
      message.success('素材导入请求已提交');
      setImportOpen(false);
    } catch (error) {
      message.error(getErrorMessage(error, '素材导入失败'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = createSourceMaterialColumns({
    onEdit: materialModal.openEdit,
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="素材管理"
        description="这一页对应旧版 `sourceMaterial` 模块，保留查询、增改删、批量操作和素材导入能力。"
      />

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

      <PageToolbarCard>
        <SourceMaterialSearchForm
          form={searchForm}
          totalCount={totalCount}
          selectedCount={selectedIds.length}
          submitting={submitting}
          actionSubmitting={actionSubmitting}
          loading={loading}
          importForm={importForm}
          onSearch={(values) => applyFilters(buildSourceMaterialSearchFilters(values))}
          onCreate={materialModal.openCreate}
          onOpenImport={() => setImportOpen(true)}
          onBatchDelete={handleBatchDelete}
          onBatchDownload={handleBatchDownload}
          onBatchSync={handleBatchSync}
        />
      </PageToolbarCard>

      <Card title="素材列表" extra={<Typography.Text type="secondary">支持内容、图标、音频和释义维护</Typography.Text>}>
        <Table<SourceMaterialRecord>
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

      <SourceMaterialModal
        open={materialModal.open}
        mode={materialModal.mode}
        form={materialForm}
        books={books}
        submitting={submitting}
        uploadState={uploadState}
        onCancel={materialModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />

      <ImportSourceMaterialModal
        open={importOpen}
        form={importForm}
        books={books}
        submitting={submitting}
        onCancel={() => setImportOpen(false)}
        onSubmit={handleImport}
      />
    </div>
  );
}
