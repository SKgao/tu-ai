import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Card, Form, Table, Typography } from 'antd';
import type { FormInstance, FormProps, UploadProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import {
  createUnit,
  listBooks,
  listUnits,
  lockUnit,
  removeUnit,
  updateUnit,
  uploadAsset,
} from '@/app/services/units';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import { UnitModal } from './components/UnitModal';
import { UnitSearchForm } from './components/UnitSearchForm';
import { createUnitColumns } from './configs/tableColumns';
import {
  EMPTY_UNIT_FORM,
  PAGE_SIZE_OPTIONS,
  buildUnitSearchFilters,
  normalizeUnitFormValues,
} from './utils/forms';
import type {
  UnitBookListResult,
  UnitBookOption,
  UnitFormValues,
  UnitListResult,
  UnitQuery,
  UnitRecord,
  UnitSearchValues,
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

function getSelectedTextbookId(form: FormInstance<UnitSearchValues>): string | undefined {
  const value = form.getFieldValue('textBookId');
  return typeof value === 'string' && value ? value : undefined;
}

export function UnitManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm<UnitSearchValues>();
  const [modalForm] = Form.useForm<UnitFormValues>();
  const initialTextbookId = searchParams.get('textbookId') || searchParams.get('textBookId') || '';
  const [books, setBooks] = useState<UnitBookOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const unitModal = useFormModal<UnitRecord>({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      modalForm.setFieldsValue({
        ...EMPTY_UNIT_FORM,
        textBookId: getSelectedTextbookId(searchForm) || initialTextbookId || undefined,
      });
    },
    onOpenEdit: (unit) => {
      resetUploadState();
      modalForm.setFieldsValue(normalizeUnitFormValues(unit));
    },
  });
  const watchedIcon = Form.useWatch('icon', modalForm);
  const iconValue = typeof watchedIcon === 'string' ? watchedIcon : undefined;
  const {
    query,
    data: units,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<UnitQuery, UnitListResult, UnitRecord>({
    initialQuery: {
      startTime: '',
      endTime: '',
      textBookId: initialTextbookId,
      pageNum: 1,
      pageSize: 10,
    },
    request: async (currentQuery) => (await listUnits(currentQuery)) as UnitListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '单元列表加载失败'),
  });

  const bookMap = useMemo(
    () => new Map(books.map((item) => [String(item.id), item.name])),
    [books],
  );

  useMountEffect(() => {
    async function loadBookOptions() {
      try {
        const data = (await listBooks({
          pageNum: 1,
          pageSize: 1000,
        })) as UnitBookListResult;
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(getErrorMessage(error, '教材列表加载失败'));
      }
    }

    return loadBookOptions();
  });

  const handleSearch: FormProps<UnitSearchValues>['onFinish'] = (values) => {
    applyFilters(buildUnitSearchFilters(values));
  };

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

  async function handleUpload(options: UploadRequestOptions): Promise<void> {
    const { file, onError, onSuccess } = options;
    const fileName = getUploadFileName(file);

    setUploading(fileName);

    try {
      if (!(file instanceof Blob)) {
        throw new Error('上传文件无效');
      }

      const url = await uploadAsset(file);
      modalForm.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入封面地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = getErrorMessage(error, '上传失败');
      const uploadError = error instanceof Error ? error : new Error(errorMessage);
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError);
    }
  }

  const handleSubmit: FormProps<UnitFormValues>['onFinish'] = async (values) => {
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
      if (unitModal.mode === 'create') {
        await createUnit(payload);
      } else {
        await updateUnit({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(unitModal.mode === 'create' ? '单元创建成功' : '单元更新成功');
      unitModal.setOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(getErrorMessage(error, '单元提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(unit: UnitRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeUnit(Number(unit.id));
      message.success('单元已删除');
      if (units.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(getErrorMessage(error, '单元删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleLock(unit: UnitRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await lockUnit({
        unitId: Number(unit.id),
        canLock: Number(unit.canLock) === 1 ? 2 : 1,
      });
      message.success(Number(unit.canLock) === 1 ? '单元已锁定' : '单元已解锁');
      await reload().catch(() => {});
    } catch (error) {
      message.error(getErrorMessage(error, '单元锁定状态更新失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createUnitColumns({
    bookMap,
    textbookId: query.textBookId,
    onEdit: unitModal.openEdit,
    onToggleLock: handleToggleLock,
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="单元管理"
        description="这一页对应旧版单元管理模块，保留教材筛选、分页、增改删、封面上传和锁定能力。"
      />

      <PageToolbarCard>
        <UnitSearchForm
          form={searchForm}
          loading={loading}
          books={books}
          initialTextbookId={initialTextbookId}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={unitModal.openCreate}
          onBack={() => navigate('/books')}
        />
      </PageToolbarCard>

      <Card title="单元列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table<UnitRecord>
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

      <UnitModal
        open={unitModal.open}
        mode={unitModal.mode}
        form={modalForm}
        books={books}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={unitModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
