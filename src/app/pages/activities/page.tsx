import { useState } from 'react';
import { App, Card, Form, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useShallow } from 'zustand/react/shallow';
import {
  changeActivityStatus,
  createActivity,
  listActivities,
  removeActivity,
  uploadAsset,
  updateActivity,
} from '@/app/services/activities';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createActivityColumns } from './configs/tableColumns';
import { ActivityModal } from './components/ActivityModal';
import { ActivitySearchForm } from './components/ActivitySearchForm';
import {
  buildActivityPayload,
  buildActivitySearchFilters,
  INITIAL_QUERY,
  PAGE_SIZE_OPTIONS,
  normalizeActivityFormValues,
  validateActivityForm,
} from './utils/forms';
import {
  selectActivityFormOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';
import type {
  ActivityFormValues,
  ActivityListResult,
  ActivityOptionRecord,
  ActivityQuery,
  ActivityRecord,
  ActivitySearchValues,
  MemberLevelOption,
} from './types';
import type { FormProps, UploadProps } from 'antd';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getUploadFileName(file: unknown): string {
  return typeof file === 'object' && file && 'name' in file && typeof file.name === 'string' ? file.name : '文件';
}

export function ActivityManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm<ActivitySearchValues>();
  const [modalForm] = Form.useForm<ActivityFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const activityModal = useFormModal<ActivityRecord>({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      modalForm.setFieldsValue({
        title: '',
        content: '',
        icon: '',
        activeMoney: undefined,
        activityType: '1',
        itemId: undefined,
        activeExpireDays: undefined,
        beginAt: undefined,
        endAt: undefined,
        url: '',
      });
    },
    onOpenEdit: (activity) => {
      resetUploadState();
      modalForm.setFieldsValue(normalizeActivityFormValues(activity));
    },
  });
  const formOptions = useMemberCommerceOptionsStore(
    useShallow(selectActivityFormOptions),
  );
  const activityOptions = formOptions.activityOptions as ActivityOptionRecord[];
  const memberLevels = formOptions.memberLevels as MemberLevelOption[];
  const ensureActivityFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureActivityFilterOptions,
  );
  const refreshActivityFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.refreshActivityFilterOptions,
  );
  const iconValue = Form.useWatch('icon', modalForm) as string | undefined;
  const activityType = (Form.useWatch('activityType', modalForm) as string | undefined) || '1';
  const {
    query,
    data: activities,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<ActivityQuery, ActivityListResult, ActivityRecord>({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) => (await listActivities(currentQuery)) as ActivityListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '活动列表加载失败'),
  });

  useMountEffect(() => {
    return ensureActivityFilterOptions().catch((error) => {
      message.error(getErrorMessage(error, '活动筛选项加载失败'));
    });
  });

  const handleSearch: FormProps<ActivitySearchValues>['onFinish'] = (values) => {
    applyFilters(buildActivitySearchFilters(values));
  };

  function handleReset(): void {
    searchForm.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
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
      setUploadSuccess('上传成功，已自动写入图片地址');
      onSuccess?.({ url });
    } catch (uploadError) {
      const errorMessage = getErrorMessage(uploadError, '上传失败');
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError as Error);
    }
  }

  const handleSubmit: FormProps<ActivityFormValues>['onFinish'] = async (values) => {
    const errorMessage = validateActivityForm(values);
    if (errorMessage) {
      message.error(errorMessage);
      return;
    }

    const payload = buildActivityPayload(values, activityModal.mode);

    setSubmitting(true);
    try {
      if (activityModal.mode === 'create') {
        await createActivity(payload);
      } else {
        await updateActivity({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(activityModal.mode === 'create' ? '活动创建成功' : '活动更新成功');
      activityModal.setOpen(false);
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '活动提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(activity: ActivityRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeActivity(Number(activity.id));
      message.success('活动已删除');
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '活动删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleChangeStatus(activity: ActivityRecord, status: number): Promise<void> {
    setActionSubmitting(true);
    try {
      await changeActivityStatus({
        id: Number(activity.id),
        status: Number(status),
      });
      message.success('活动状态更新成功');
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '活动状态更新失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createActivityColumns({
    onEdit: activityModal.openEdit,
    onToggleStatus: handleChangeStatus,
    onDelete: handleDelete,
    submitting: submitting || actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="活动管理"
        description="这一页对应旧版 `activity` 模块，先按新版 antd 组件重构筛选、列表、增改删和状态切换。"
      />

      <PageToolbarCard>
        <ActivitySearchForm
          form={searchForm}
          loading={loading}
          activityOptions={activityOptions}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={activityModal.openCreate}
          onRefresh={() => void reload().catch(() => {})}
        />
      </PageToolbarCard>

      <Card
        title="活动列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table<ActivityRecord>
          rowKey="id"
          columns={columns}
          dataSource={activities}
          loading={loading}
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

      <ActivityModal
        open={activityModal.open}
        mode={activityModal.mode}
        form={modalForm}
        activityType={activityType}
        memberLevels={memberLevels}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={activityModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
