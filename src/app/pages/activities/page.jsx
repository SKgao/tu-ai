import React, { useEffect, useMemo, useState } from 'react';
import { App, Card, Form, Space, Table, Typography } from 'antd';
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

export function ActivityManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const activityModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      modalForm.setFieldsValue({
        title: '',
        content: '',
        icon: '',
        activeMoney: undefined,
        status: '1',
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
  const { activityOptions, memberLevels } = useMemberCommerceOptionsStore(
    useShallow(selectActivityFormOptions),
  );
  const ensureActivityFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureActivityFilterOptions,
  );
  const refreshActivityFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.refreshActivityFilterOptions,
  );
  const iconValue = Form.useWatch('icon', modalForm);
  const activityType = Form.useWatch('status', modalForm) || '1';
  const {
    query,
    data: activities,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: listActivities,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '活动列表加载失败'),
  });

  useEffect(() => {
    ensureActivityFilterOptions().catch((error) => {
      message.error(error?.message || '活动筛选项加载失败');
    });
  }, [ensureActivityFilterOptions, message]);

  function handleSearch(values) {
    applyFilters(buildActivitySearchFilters(values));
  }

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      modalForm.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入图片地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
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
    } catch (error) {
      message.error(error?.message || '活动提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(activity) {
    setActionSubmitting(true);
    try {
      await removeActivity(activity.id);
      message.success('活动已删除');
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '活动删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleChangeStatus(activity, status) {
    setActionSubmitting(true);
    try {
      await changeActivityStatus({
        id: Number(activity.id),
        status: Number(status),
      });
      message.success('活动状态更新成功');
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '活动状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createActivityColumns({
        onEdit: activityModal.openEdit,
        onToggleStatus: handleChangeStatus,
        onDelete: handleDelete,
        submitting: submitting || actionSubmitting,
      }),
    [actionSubmitting, activityModal.openEdit, submitting],
  );

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
          onRefresh={() => reload().catch(() => {})}
        />
      </PageToolbarCard>

      <Card
        title="活动列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table
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
