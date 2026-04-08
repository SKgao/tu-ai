import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useShallow } from 'zustand/react/shallow';
import {
  changeActivityStatus,
  createActivity,
  listActivities,
  removeActivity,
  uploadAsset,
  updateActivity,
} from '@/app/services/activities';
import { FileUploadField } from '@/app/components/FileUploadField';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { PageHero } from '@/app/components/PageHero';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createActivityColumns } from './configs/tableColumns';
import {
  selectActivityFormOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';
import { AppModal } from '@/app/components/AppModal';

const EMPTY_ACTIVITY_FORM = {
  id: '',
  title: '',
  content: '',
  icon: '',
  activeMoney: '',
  status: '1',
  itemId: '',
  activeExpireDays: '',
  beginAt: '',
  endAt: '',
  url: '',
};

const INITIAL_FILTERS = {
  startTime: '',
  endTime: '',
  id: '',
};

const INITIAL_QUERY = {
  ...INITIAL_FILTERS,
  pageNum: 1,
  pageSize: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

function fromApiDateTime(value) {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : '';
}

function ActivityModal({
  mode,
  form,
  levelOptions,
  uploadState,
  submitting,
  onClose,
  onChange,
  onUpload,
  onSubmit,
}) {
  const isPurchaseActivity = String(form.status) === '1';

  return (
    <AppModal
      title={mode === 'create' ? '新增活动' : '编辑活动'}
      description="维护活动标题、时间、金额、参与商品和链接信息。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>活动标题</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="请输入活动标题"
            />
          </label>
          <label className="form-field">
            <span>活动类型</span>
            <select
              value={form.status}
              onChange={(event) => onChange('status', event.target.value)}
              disabled={mode === 'edit'}
            >
              <option value="1">购买活动</option>
              <option value="2">分享活动</option>
            </select>
          </label>
          <label className="form-field">
            <span>活动开始时间</span>
            <input
              type="datetime-local"
              value={form.beginAt}
              onChange={(event) => onChange('beginAt', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>活动结束时间</span>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(event) => onChange('endAt', event.target.value)}
            />
          </label>
          {mode === 'edit' ? (
            <label className="form-field">
              <span>活动持续时间</span>
              <input
                value={form.activeExpireDays}
                onChange={(event) => onChange('activeExpireDays', event.target.value)}
                placeholder="请输入活动持续天数"
              />
            </label>
          ) : null}
          {isPurchaseActivity ? (
            <>
              <label className="form-field">
                <span>参与活动商品</span>
                <select
                  value={form.itemId}
                  onChange={(event) => onChange('itemId', event.target.value)}
                >
                  <option value="">请选择会员等级</option>
                  {levelOptions.map((item) => (
                    <option key={item.userLevel} value={String(item.userLevel)}>
                      {item.levelName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>活动价格</span>
                <input
                  value={form.activeMoney}
                  onChange={(event) => onChange('activeMoney', event.target.value)}
                  placeholder="请输入活动价格，单位元"
                />
              </label>
            </>
          ) : null}
          <label className="form-field form-field--full">
            <span>活动内容</span>
            <textarea
              className="app-textarea"
              rows={4}
              value={form.content}
              onChange={(event) => onChange('content', event.target.value)}
              placeholder="请输入活动内容"
            />
          </label>
          <FileUploadField
            label="活动图片地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            uploadHint="支持上传活动封面"
            previewAlt="活动图片"
            fullWidth
          />
          <label className="form-field form-field--full">
            <span>活动链接</span>
            <input
              value={form.url}
              onChange={(event) => onChange('url', event.target.value)}
              placeholder="请输入活动链接"
            />
          </label>
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function ActivityManagementPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const { uploadState, upload, resetUploadState } = useFileUpload({
    uploadRequest: uploadAsset,
  });
  const {
    isOpen: modalOpen,
    mode: modalMode,
    form: activityForm,
    updateForm: updateActivityForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_ACTIVITY_FORM }),
    editState: (activity) => ({
      id: String(activity.id),
      title: activity.title || '',
      content: activity.content || '',
      icon: activity.icon || '',
      activeMoney:
        activity.activeMoney !== undefined && activity.activeMoney !== null
          ? (Number(activity.activeMoney) / 100).toFixed(2)
          : '',
      status: String(activity.status ?? '1'),
      itemId: activity.itemId !== undefined && activity.itemId !== null ? String(activity.itemId) : '',
      activeExpireDays:
        activity.activeExpireDays !== undefined && activity.activeExpireDays !== null
          ? String(activity.activeExpireDays)
          : '',
      beginAt: fromApiDateTime(activity.beginAt),
      endAt: fromApiDateTime(activity.endAt),
      url: activity.url || '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
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
  const {
    query,
    data: activities,
    totalCount,
    totalPages,
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
    onError: (message) => showError(message || '活动列表加载失败'),
  });

  const columns = useMemo(
    () =>
      createActivityColumns({
        onEdit: openEditModal,
        onToggleStatus: handleChangeStatus,
        onDelete: handleDelete,
        submitting: modalSubmitting || actionSubmitting,
      }),
    [actionSubmitting, modalSubmitting],
  );

  useEffect(() => {
    ensureActivityFilterOptions().catch((error) => {
      showError(error?.message || '活动筛选项加载失败');
    });
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入图片地址',
        onSuccess: (url) => {
          updateActivityForm('icon', url);
        },
      });
    } catch {}
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!activityForm.title.trim() || !activityForm.beginAt || !activityForm.endAt) {
      showError('请填写活动标题并选择开始/结束时间');
      return;
    }

    const beginAt = dayjs(activityForm.beginAt);
    const endAt = dayjs(activityForm.endAt);

    if (!beginAt.isValid() || !endAt.isValid()) {
      showError('活动时间格式不正确');
      return;
    }

    if (beginAt.isAfter(endAt)) {
      showError('活动开始时间不能大于结束时间');
      return;
    }

    const isPurchaseActivity = String(activityForm.status) === '1';

    if (isPurchaseActivity && !activityForm.itemId) {
      showError('购买活动必须选择参与活动商品');
      return;
    }

    if (isPurchaseActivity && activityForm.activeMoney && Number.isNaN(Number(activityForm.activeMoney))) {
      showError('活动价格必须为数字');
      return;
    }

    if (activityForm.activeExpireDays && !/^\d+$/.test(activityForm.activeExpireDays)) {
      showError('活动持续时间必须为数字');
      return;
    }

    const diffDays = Math.floor(endAt.diff(beginAt, 'day', true));
    const payload = {
      title: activityForm.title.trim(),
      content: activityForm.content.trim(),
      icon: activityForm.icon.trim(),
      url: activityForm.url.trim(),
      status: Number(activityForm.status),
      beginAt: toApiDateTime(activityForm.beginAt),
      endAt: toApiDateTime(activityForm.endAt),
      activeExpireDays:
        modalMode === 'create'
          ? diffDays
          : activityForm.activeExpireDays
            ? Number(activityForm.activeExpireDays)
            : undefined,
      itemId: isPurchaseActivity && activityForm.itemId ? Number(activityForm.itemId) : undefined,
      activeMoney:
        isPurchaseActivity && activityForm.activeMoney !== ''
          ? Math.round(Number(activityForm.activeMoney) * 100)
          : undefined,
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createActivity(payload);
          return;
        }

        await updateActivity({
          ...payload,
          id: Number(activityForm.id),
        });
      },
      successMessage: modalMode === 'create' ? '活动创建成功' : '活动更新成功',
      errorMessage: '活动提交失败',
      close: closeModal,
      afterSuccess: async () => {
        await reload().catch(() => {});
        await refreshActivityFilterOptions().catch(() => {});
      },
    });
  }

  async function handleDelete(activity) {
    await runAction({
      confirmText: `确认删除活动 ${activity.title || activity.id} 吗？`,
      action: () => removeActivity(activity.id),
      successMessage: '活动已删除',
      errorMessage: '活动删除失败',
      afterSuccess: async () => {
        await reload().catch(() => {});
        await refreshActivityFilterOptions().catch(() => {});
      },
    });
  }

  async function handleChangeStatus(activity, status) {
    await runAction({
      action: () =>
        changeActivityStatus({
          id: Number(activity.id),
          status: Number(status),
        }),
      successMessage: '活动状态更新成功',
      errorMessage: '活动状态更新失败',
      afterSuccess: async () => {
        await reload().catch(() => {});
        await refreshActivityFilterOptions().catch(() => {});
      },
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="活动管理"
        copy="这一页对应旧版 `activity` 模块，保留活动列表、筛选、增改删和状态切换能力。"
      />

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--books">
          <label className="form-field">
            <span>活动开始时间</span>
            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(event) => updateFilter('startTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>活动结束时间</span>
            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(event) => updateFilter('endTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>活动筛选</span>
            <select value={filters.id} onChange={(event) => updateFilter('id', event.target.value)}>
              <option value="">全部</option>
              {activityOptions.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <div className="toolbar-actions">
            <button
              type="button"
              className="app-button app-button--primary"
              onClick={() =>
                applyFilters({
                  startTime: toApiDateTime(filters.startTime),
                  endTime: toApiDateTime(filters.endTime),
                  id: filters.id,
                })
              }
            >
              搜索
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={openCreateModal}>
              添加活动
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => reload().catch(() => {})}
              disabled={loading}
            >
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>
      </section>

      <PageTableCard
        title="活动列表"
        totalCount={totalCount}
        columns={columns}
        data={activities}
        rowKey="id"
        loading={loading}
        minWidth={1260}
        pagination={{
          pageNum: query.pageNum,
          pageSize: query.pageSize,
          totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: setPageNum,
          onPageSizeChange: setPageSize,
        }}
      />

      {modalOpen ? (
        <ActivityModal
          mode={modalMode}
          form={activityForm}
          levelOptions={memberLevels}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateActivityForm}
          onUpload={handleUpload}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
