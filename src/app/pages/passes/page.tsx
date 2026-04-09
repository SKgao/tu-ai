import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Card, Form, Table, Typography } from 'antd';
import type { FormProps, UploadProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import {
  createPass,
  listPasses,
  listSubjects,
  removePass,
  updatePass,
  uploadAsset,
} from '@/app/services/passes';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { PassModal } from './components/PassModal';
import { PassToolbar } from './components/PassToolbar';
import { createPassColumns } from './configs/tableColumns';
import { PAGE_SIZE_OPTIONS, normalizePassFormValues } from './utils/forms';
import type {
  PassFormValues,
  PassListResult,
  PassQuery,
  PassRecord,
  PassSubjectOption,
} from './types';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];
type UploadRequestFile = UploadRequestOptions['file'];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getUploadFileName(file: UploadRequestFile): string {
  return typeof file === 'object' && file !== null && 'name' in file && typeof file.name === 'string' && file.name
    ? file.name
    : '文件';
}

export function PassManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<PassFormValues>();
  const partsId = searchParams.get('partsId') || '';
  const textbookId = searchParams.get('textbookId') || '';
  const [subjects, setSubjects] = useState<PassSubjectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const passModal = useFormModal<PassRecord>({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue(normalizePassFormValues(null, partsId));
    },
    onOpenEdit: (pass) => {
      resetUploadState();
      form.setFieldsValue(normalizePassFormValues(pass, partsId));
    },
  });
  const watchedIcon = Form.useWatch('icon', form);
  const iconValue = typeof watchedIcon === 'string' ? watchedIcon : undefined;
  const {
    query,
    data: passes,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<PassQuery, PassListResult, PassRecord>({
    initialQuery: {
      partsId,
      pageNum: 1,
      pageSize: 10,
    },
    request: async (currentQuery) => (await listPasses(currentQuery)) as PassListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '关卡列表加载失败'),
  });

  useMountEffect(() => {
    async function loadSubjectOptions() {
      try {
        const data = await listSubjects();
        setSubjects(Array.isArray(data) ? (data as PassSubjectOption[]) : []);
      } catch (error) {
        message.error(getErrorMessage(error, '题型列表加载失败'));
      }
    }

    return loadSubjectOptions();
  });

  async function handleUpload(options: UploadRequestOptions): Promise<void> {
    const { file, onError, onSuccess } = options;
    const fileName = getUploadFileName(file);

    setUploading(fileName);

    try {
      if (!(file instanceof Blob)) {
        throw new Error('上传文件无效');
      }

      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入图片地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = getErrorMessage(error, '上传失败');
      const uploadError = error instanceof Error ? error : new Error(errorMessage);
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError);
    }
  }

  const handleSubmit: FormProps<PassFormValues>['onFinish'] = async (values) => {
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
      if (passModal.mode === 'create') {
        await createPass(payload);
      } else {
        await updatePass({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(passModal.mode === 'create' ? '关卡创建成功' : '关卡更新成功');
      passModal.setOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(getErrorMessage(error, '关卡提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(pass: PassRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removePass(Number(pass.id));
      message.success('关卡已删除');
      if (passes.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(getErrorMessage(error, '关卡删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  function handleRefresh(): void {
    void reload().catch(() => {});
  }

  const columns = createPassColumns({
    onEdit: passModal.openEdit,
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="关卡管理"
        description="这一页对应旧版关卡管理模块，保留分页、增改删、图片上传和题型选择能力。"
      />

      <PageToolbarCard>
        <PassToolbar
          partsId={query.partsId}
          textbookId={textbookId}
          loading={loading}
          onCreate={passModal.openCreate}
          onBack={() => navigate(textbookId ? `/parts?textBookId=${textbookId}&unitId=` : '/parts')}
          onRefresh={handleRefresh}
        />
      </PageToolbarCard>

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

      <PassModal
        open={passModal.open}
        mode={passModal.mode}
        form={form}
        subjects={subjects}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={passModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
