import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import {
  createCourseBagActivity,
  listCourseBagActivities,
  removeCourseBagActivity,
  uploadAsset,
  updateCourseBagActivity,
} from '@/app/services/course-bag-activities';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { PageHero } from '@/app/components/PageHero';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { createCourseBagActivityColumns } from './configs/tableColumns';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const EMPTY_CREATE_FORM = {
  id: '',
  textbookId: '',
  saleBeginAt: '',
  presaleDays: '',
  teacher: '',
  status: '1',
  type: '1',
  beginAt: '',
  courseDays: '',
  orgAmt: '',
  amt: '',
  num: '',
  chatNo: '',
  iconDetail: '',
  iconTicket: '',
};

function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

function fromApiDateTime(value) {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : '';
}

function ActivityImageField({ label, value, uploadState, onChange, onUpload }) {
  return (
    <div className="form-field">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="可直接粘贴图片 URL"
      />
      <div className="upload-row">
        <input
          type="file"
          accept="image/*"
          disabled={uploadState.uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
            event.target.value = '';
          }}
        />
        <div className="upload-state">
          {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传图片'}
        </div>
      </div>
      {value ? (
        <div className="avatar-preview">
          <img src={value} alt={label} className="avatar-preview__image" />
        </div>
      ) : null}
    </div>
  );
}

function CourseBagActivityModal({
  mode,
  courseOptions,
  form,
  detailUploadState,
  ticketUploadState,
  submitting,
  onClose,
  onChange,
  onUpload,
  onSubmit,
}) {
  const isCreate = mode === 'create';

  return (
    <AppModal
      title={isCreate ? '新增课程活动' : '编辑课程活动'}
      description="对齐旧版 `courseBag/activity` 的活动配置字段和课程挂接能力。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
            <label className="form-field">
              <span>活动 ID</span>
              <input
                value={form.id}
                onChange={(event) => onChange('id', event.target.value)}
                placeholder="请输入活动 ID"
                disabled={!isCreate}
              />
            </label>
            <label className="form-field">
              <span>课程</span>
              {isCreate ? (
                <select
                  value={form.textbookId}
                  onChange={(event) => onChange('textbookId', event.target.value)}
                >
                  <option value="">请选择课程</option>
                  {courseOptions.map((item) => (
                    <option key={item.textbookId} value={String(item.textbookId)}>
                      {item.textbookName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.textbookName}
                  onChange={(event) => onChange('textbookName', event.target.value)}
                  placeholder="请输入课程名称"
                />
              )}
            </label>
            <label className="form-field">
              <span>辅导老师</span>
              <input
                value={form.teacher}
                onChange={(event) => onChange('teacher', event.target.value)}
                placeholder="请输入辅导老师"
              />
            </label>
            <label className="form-field">
              <span>课程状态</span>
              <select value={form.status} onChange={(event) => onChange('status', event.target.value)}>
                <option value="1">正常</option>
                <option value="2">下架</option>
              </select>
            </label>
            <label className="form-field">
              <span>开课方式</span>
              <select value={form.type} onChange={(event) => onChange('type', event.target.value)}>
                <option value="1">统一开课</option>
                <option value="2">购买生效</option>
                <option value="3">闯关解锁</option>
              </select>
            </label>
            <label className="form-field">
              <span>预售开始时间</span>
              <input
                type="datetime-local"
                value={form.saleBeginAt}
                onChange={(event) => onChange('saleBeginAt', event.target.value)}
              />
            </label>
            {isCreate ? (
              <label className="form-field">
                <span>预售持续天数</span>
                <input
                  value={form.presaleDays}
                  onChange={(event) => onChange('presaleDays', event.target.value)}
                  placeholder="请输入持续天数"
                />
              </label>
            ) : (
              <label className="form-field">
                <span>预售结束时间</span>
                <input
                  type="datetime-local"
                  value={form.saleEndAt}
                  onChange={(event) => onChange('saleEndAt', event.target.value)}
                />
              </label>
            )}
            {Number(form.type) === 1 ? (
              isCreate ? (
                <>
                  <label className="form-field">
                    <span>开课时间</span>
                    <input
                      type="datetime-local"
                      value={form.beginAt}
                      onChange={(event) => onChange('beginAt', event.target.value)}
                    />
                  </label>
                  <label className="form-field">
                    <span>开课持续天数</span>
                    <input
                      value={form.courseDays}
                      onChange={(event) => onChange('courseDays', event.target.value)}
                      placeholder="请输入持续天数"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="form-field">
                    <span>开课时间</span>
                    <input
                      type="datetime-local"
                      value={form.beginAt}
                      onChange={(event) => onChange('beginAt', event.target.value)}
                    />
                  </label>
                  <label className="form-field">
                    <span>结课时间</span>
                    <input
                      type="datetime-local"
                      value={form.endAt}
                      onChange={(event) => onChange('endAt', event.target.value)}
                    />
                  </label>
                </>
              )
            ) : null}
            <label className="form-field">
              <span>原始金额</span>
              <input
                value={form.orgAmt}
                onChange={(event) => onChange('orgAmt', event.target.value)}
                placeholder="单位元"
              />
            </label>
            <label className="form-field">
              <span>实际金额</span>
              <input
                value={form.amt}
                onChange={(event) => onChange('amt', event.target.value)}
                placeholder="单位元"
              />
            </label>
            <label className="form-field">
              <span>课程数量</span>
              <input
                value={form.num}
                onChange={(event) => onChange('num', event.target.value)}
                placeholder="请输入课程数量"
              />
            </label>
            <label className="form-field">
              <span>微信号</span>
              <input
                value={form.chatNo}
                onChange={(event) => onChange('chatNo', event.target.value)}
                placeholder="可选"
              />
            </label>
            <ActivityImageField
              label="详情图"
              value={form.iconDetail}
              uploadState={detailUploadState}
              onChange={(value) => onChange('iconDetail', value)}
              onUpload={(file) => onUpload('iconDetail', file)}
            />
            <ActivityImageField
              label="优惠券图"
              value={form.iconTicket}
              uploadState={ticketUploadState}
              onChange={(value) => onChange('iconTicket', value)}
              onUpload={(file) => onUpload('iconTicket', file)}
            />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function CourseBagActivityManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id') || '';
  const courseName = searchParams.get('courseName') || '';
  const [activities, setActivities] = useState([]);
  const courseOptions = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const [loading, setLoading] = useState(true);
  const { feedback, showError, showSuccess } = useFeedbackState();
  const detailUploader = useFileUpload({
    uploadRequest: uploadAsset,
  });
  const ticketUploader = useFileUpload({
    uploadRequest: uploadAsset,
  });
  const { uploadState: detailUploadState, upload: uploadDetailAsset, resetUploadState: resetDetailUploadState } = detailUploader;
  const { uploadState: ticketUploadState, upload: uploadTicketAsset, resetUploadState: resetTicketUploadState } = ticketUploader;
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
  });
  const {
    isOpen: modalOpen,
    mode: modalMode,
    form,
    updateForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_CREATE_FORM }),
    editState: (activity) => ({
      id: String(activity.id || ''),
      textbookId: String(activity.textbookId || ''),
      textbookName: activity.textbookName || '',
      saleBeginAt: fromApiDateTime(activity.saleBeginAt),
      saleEndAt: fromApiDateTime(activity.saleEndAt),
      teacher: activity.teacher || '',
      status: String(activity.status ?? '1'),
      type: String(activity.type ?? '1'),
      beginAt: fromApiDateTime(activity.beginAt),
      endAt: fromApiDateTime(activity.endAt),
      orgAmt:
        activity.orgAmt !== undefined && activity.orgAmt !== null
          ? (Number(activity.orgAmt) / 100).toFixed(2)
          : '',
      amt:
        activity.amt !== undefined && activity.amt !== null
          ? (Number(activity.amt) / 100).toFixed(2)
          : '',
      num: activity.num !== undefined && activity.num !== null ? String(activity.num) : '',
      chatNo: activity.chatNo || '',
      iconDetail: activity.iconDetail || '',
      iconTicket: activity.iconTicket || '',
      presaleDays: '',
      courseDays: '',
    }),
    onOpenCreate: () => {
      resetDetailUploadState();
      resetTicketUploadState();
    },
    onOpenEdit: () => {
      resetDetailUploadState();
      resetTicketUploadState();
    },
  });

  const columns = useMemo(
    () =>
      createCourseBagActivityColumns({
        onEdit: openEditModal,
        onDelete: handleDelete,
        submitting: modalSubmitting || actionSubmitting,
      }),
    [actionSubmitting, modalSubmitting],
  );

  async function loadActivities() {
    if (!courseId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listCourseBagActivities(courseId);
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '课程活动列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ensureCourseOptions().catch((error) => {
      showError(error?.message || '课程选项加载失败');
    });
  }, []);

  useEffect(() => {
    loadActivities();
  }, [courseId]);

  async function handleUpload(field, file) {
    const uploadFile = field === 'iconDetail' ? uploadDetailAsset : uploadTicketAsset;

    try {
      await uploadFile(file, {
        successMessage: '上传成功，已自动写入地址',
        onSuccess: (url) => {
          updateForm(field, url);
        },
      });
    } catch {}
  }

  function validateCreateForm(currentForm) {
    if (
      !currentForm.id ||
      !currentForm.textbookId ||
      !currentForm.saleBeginAt ||
      !currentForm.presaleDays ||
      !currentForm.teacher.trim() ||
      currentForm.orgAmt === '' ||
      currentForm.amt === '' ||
      currentForm.num === ''
    ) {
      return '请完整填写活动 ID、课程、预售时间、教师、金额和数量';
    }

    if (!/^\d+$/.test(currentForm.id) || !/^\d+$/.test(currentForm.textbookId)) {
      return '活动 ID 和课程 ID 必须为整数';
    }

    if (!/^\d+$/.test(currentForm.presaleDays)) {
      return '预售持续天数必须为整数';
    }

    if (Number(currentForm.type) === 1) {
      if (!currentForm.beginAt || !currentForm.courseDays) {
        return '统一开课模式必须填写开课时间和持续天数';
      }

      if (!/^\d+$/.test(currentForm.courseDays)) {
        return '开课持续天数必须为整数';
      }
    }

    if (Number.isNaN(Number(currentForm.orgAmt)) || Number.isNaN(Number(currentForm.amt))) {
      return '金额必须为数字';
    }

    if (!/^\d+$/.test(currentForm.num)) {
      return '课程数量必须为整数';
    }

    return '';
  }

  function validateEditForm(currentForm) {
    if (
      !currentForm.id ||
      !currentForm.saleBeginAt ||
      !currentForm.saleEndAt ||
      !currentForm.teacher.trim() ||
      currentForm.orgAmt === '' ||
      currentForm.amt === '' ||
      currentForm.num === ''
    ) {
      return '请完整填写活动时间、教师、金额和数量';
    }

    if (Number.isNaN(Number(currentForm.orgAmt)) || Number.isNaN(Number(currentForm.amt))) {
      return '金额必须为数字';
    }

    if (!/^\d+$/.test(currentForm.num)) {
      return '课程数量必须为整数';
    }

    const saleBeginAt = dayjs(currentForm.saleBeginAt);
    const saleEndAt = dayjs(currentForm.saleEndAt);

    if (!saleBeginAt.isValid() || !saleEndAt.isValid()) {
      return '预售时间格式不正确';
    }

    if (saleBeginAt.isAfter(saleEndAt)) {
      return '预售开始时间不能大于预售结束时间';
    }

    if (Number(currentForm.type) === 1) {
      if (!currentForm.beginAt || !currentForm.endAt) {
        return '统一开课模式必须填写开课和结课时间';
      }

      const beginAt = dayjs(currentForm.beginAt);
      const endAt = dayjs(currentForm.endAt);

      if (!beginAt.isValid() || !endAt.isValid()) {
        return '开课时间格式不正确';
      }

      if (beginAt.isAfter(endAt)) {
        return '开课时间不能大于结课时间';
      }
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errorMessage = modalMode === 'create' ? validateCreateForm(form) : validateEditForm(form);

    if (errorMessage) {
      showError(errorMessage);
      return;
    }

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          const saleBeginAt = dayjs(form.saleBeginAt);
          const saleEndAt = saleBeginAt.add(Number(form.presaleDays), 'day');
          const payload = {
            id: Number(form.id),
            textbookId: Number(form.textbookId),
            saleBeginAt: toApiDateTime(form.saleBeginAt),
            saleEndAt: saleEndAt.format('YYYY-MM-DD HH:mm:ss'),
            teacher: form.teacher.trim(),
            status: Number(form.status),
            type: Number(form.type),
            orgAmt: Math.round(Number(form.orgAmt) * 100),
            amt: Math.round(Number(form.amt) * 100),
            num: Number(form.num),
            chatNo: form.chatNo.trim(),
            iconDetail: form.iconDetail.trim(),
            iconTicket: form.iconTicket.trim(),
          };

          if (Number(form.type) === 1) {
            const beginAt = dayjs(form.beginAt);
            payload.beginAt = toApiDateTime(form.beginAt);
            payload.endAt = beginAt.add(Number(form.courseDays), 'day').format('YYYY-MM-DD HH:mm:ss');
          } else {
            payload.beginAt = '';
            payload.endAt = '';
          }

          await createCourseBagActivity(payload);
          return;
        }

        const payload = {
          id: Number(form.id),
          textbookName: form.textbookName.trim(),
          teacher: form.teacher.trim(),
          saleBeginAt: toApiDateTime(form.saleBeginAt),
          saleEndAt: toApiDateTime(form.saleEndAt),
          status: Number(form.status),
          type: Number(form.type),
          orgAmt: Math.round(Number(form.orgAmt) * 100),
          amt: Math.round(Number(form.amt) * 100),
          num: Number(form.num),
          chatNo: form.chatNo.trim(),
          iconDetail: form.iconDetail.trim(),
          iconTicket: form.iconTicket.trim(),
        };

        if (Number(form.type) === 1) {
          payload.beginAt = toApiDateTime(form.beginAt);
          payload.endAt = toApiDateTime(form.endAt);
        } else {
          payload.beginAt = '';
          payload.endAt = '';
        }

        await updateCourseBagActivity(payload);
      },
      successMessage: modalMode === 'create' ? '课程活动创建成功' : '课程活动更新成功',
      errorMessage: '课程活动提交失败',
      close: closeModal,
      afterSuccess: loadActivities,
    });
  }

  async function handleDelete(activity) {
    await runAction({
      confirmText: `确认删除课程活动 ${activity.id} 吗？`,
      action: () => removeCourseBagActivity(activity.id),
      successMessage: '课程活动已删除',
      errorMessage: '课程活动删除失败',
      afterSuccess: loadActivities,
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="课程包活动"
        copy="对应旧版 `courseBag/activity`，保留活动新增、编辑、删除，以及课程活动时间与金额配置。"
      />

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">{courseName || '未指定课程'}</h3>
            <p className="section-meta">当前课程 ID: {courseId || '-'}</p>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--ghost" onClick={() => navigate(-1)}>
              返回上一页
            </button>
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加课程活动
            </button>
          </div>
        </div>
      </section>

      <PageTableCard
        title="活动列表"
        totalCount={activities.length}
        columns={columns}
        data={activities}
        rowKey="id"
        loading={loading}
        minWidth={1680}
      />

      {modalOpen ? (
        <CourseBagActivityModal
          mode={modalMode}
          courseOptions={courseOptions}
          form={form}
          detailUploadState={detailUploadState}
          ticketUploadState={ticketUploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateForm}
          onUpload={handleUpload}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
