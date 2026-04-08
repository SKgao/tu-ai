import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import { FileUploadField } from '@/app/components/FileUploadField';
import {
  createSpecialCourse,
  downSpecialCourse,
  listBoughtSpecialCourses,
  listSpecialCourses,
  listBooks,
  removeSpecialCourse,
  uploadAsset,
  updateSpecialCourse,
  upSpecialCourse,
} from '@/app/services/special-courses';
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
import { createSpecialCourseColumns } from './configs/tableColumns';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';

const EMPTY_FORM = {
  textbookId: '',
  textbookName: '',
  teacher: '',
  saleBeginAt: '',
  saleEndAt: '',
  type: '1',
  beginAt: '',
  endAt: '',
  orgAmt: '',
  amt: '',
  num: '',
  chatNo: '',
  iconDetail: '',
  iconTicket: '',
  status: '1',
};

const INITIAL_FILTERS = {
  startTime: '',
  endTime: '',
};

const INITIAL_QUERY = {
  ...INITIAL_FILTERS,
  pageNum: 1,
  pageSize: 20,
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

function fromApiDateTime(value) {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : '';
}

function buildPayload(form, { allowTextbookIdEdit }) {
  const payload = {
    textbookName: form.textbookName.trim(),
    teacher: form.teacher.trim(),
    saleBeginAt: toApiDateTime(form.saleBeginAt),
    saleEndAt: toApiDateTime(form.saleEndAt),
    type: Number(form.type),
    orgAmt: Math.round(Number(form.orgAmt) * 100),
    amt: Math.round(Number(form.amt) * 100),
    num: Number(form.num),
    chatNo: form.chatNo.trim(),
    iconDetail: form.iconDetail.trim(),
    iconTicket: form.iconTicket.trim(),
    status: Number(form.status),
  };

  if (allowTextbookIdEdit) {
    payload.textbookId = Number(form.textbookId);
  }

  if (Number(form.type) === 1) {
    payload.beginAt = toApiDateTime(form.beginAt);
    payload.endAt = toApiDateTime(form.endAt);
  } else {
    payload.beginAt = '';
    payload.endAt = '';
  }

  return payload;
}

function validateForm(form) {
  if (
    !form.textbookId ||
    !form.textbookName.trim() ||
    !form.teacher.trim() ||
    !form.saleBeginAt ||
    !form.saleEndAt ||
    form.orgAmt === '' ||
    form.amt === '' ||
    form.num === ''
  ) {
    return '请完整填写课程、教师、预售时间、金额和数量';
  }

  if (Number.isNaN(Number(form.orgAmt)) || Number.isNaN(Number(form.amt))) {
    return '金额必须为数字';
  }

  if (!/^\d+$/.test(String(form.num))) {
    return '课程数量必须为整数';
  }

  const saleBeginAt = dayjs(form.saleBeginAt);
  const saleEndAt = dayjs(form.saleEndAt);

  if (!saleBeginAt.isValid() || !saleEndAt.isValid()) {
    return '预售时间格式不正确';
  }

  if (saleBeginAt.isAfter(saleEndAt)) {
    return '预售开始时间不能大于预售结束时间';
  }

  if (Number(form.type) === 1) {
    if (!form.beginAt || !form.endAt) {
      return '统一开课模式必须填写开课和结课时间';
    }

    const beginAt = dayjs(form.beginAt);
    const endAt = dayjs(form.endAt);

    if (!beginAt.isValid() || !endAt.isValid()) {
      return '开课时间格式不正确';
    }

    if (beginAt.isAfter(endAt)) {
      return '开课时间不能大于结课时间';
    }
  }

  return '';
}

function SpecialCourseModal({
  mode,
  form,
  books,
  detailUploadState,
  ticketUploadState,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}) {
  const isEdit = mode === 'edit';

  return (
    <AppModal
      title={isEdit ? '编辑精品课程' : '新增精品课程'}
      description="保留旧版 `specialCourse` 的课程配置、上下架和已购课程查看能力。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
            <label className="form-field">
              <span>课程 ID</span>
              <select
                value={form.textbookId}
                onChange={(event) => onChange('textbookId', event.target.value)}
                disabled={isEdit}
              >
                <option value="">请选择课程</option>
                {books.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>课程名称</span>
              <input
                value={form.textbookName}
                onChange={(event) => onChange('textbookName', event.target.value)}
                placeholder="请输入课程名称"
              />
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
              <span>预售开始时间</span>
              <input
                type="datetime-local"
                value={form.saleBeginAt}
                onChange={(event) => onChange('saleBeginAt', event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>预售结束时间</span>
              <input
                type="datetime-local"
                value={form.saleEndAt}
                onChange={(event) => onChange('saleEndAt', event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>开课方式</span>
              <select value={form.type} onChange={(event) => onChange('type', event.target.value)}>
                <option value="1">统一开课</option>
                <option value="2">购买生效</option>
              </select>
            </label>
            {Number(form.type) === 1 ? (
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
            <FileUploadField
              label="详情图片"
              value={form.iconDetail}
              uploadState={detailUploadState}
              onValueChange={(value) => onChange('iconDetail', value)}
              onUpload={(file) => onUpload('iconDetail', file)}
              accept="image/*"
              uploadHint="支持上传图片"
              previewAlt="详情图片"
            />
            <FileUploadField
              label="优惠券图"
              value={form.iconTicket}
              uploadState={ticketUploadState}
              onValueChange={(value) => onChange('iconTicket', value)}
              onUpload={(file) => onUpload('iconTicket', file)}
              accept="image/*"
              uploadHint="支持上传图片"
              previewAlt="优惠券图"
            />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function SpecialCourseManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const detailUploader = useFileUpload({
    uploadRequest: uploadAsset,
  });
  const ticketUploader = useFileUpload({
    uploadRequest: uploadAsset,
  });
  const { uploadState: detailUploadState, upload: uploadDetailAsset, resetUploadState: resetDetailUploadState } = detailUploader;
  const { uploadState: ticketUploadState, upload: uploadTicketAsset, resetUploadState: resetTicketUploadState } = ticketUploader;
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
  });
  const refreshCourseOptions = useMemberCommerceOptionsStore((state) => state.refreshCourseOptions);
  const {
    isOpen: modalOpen,
    mode: modalMode,
    form,
    updateForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_FORM }),
    editState: (course) => ({
      textbookId: String(course.textbookId || ''),
      textbookName: course.textbookName || '',
      teacher: course.teacher || '',
      saleBeginAt: fromApiDateTime(course.saleBeginAt),
      saleEndAt: fromApiDateTime(course.saleEndAt),
      type: String(course.type ?? '1'),
      beginAt: fromApiDateTime(course.beginAt),
      endAt: fromApiDateTime(course.endAt),
      orgAmt:
        course.orgAmt !== undefined && course.orgAmt !== null
          ? (Number(course.orgAmt) / 100).toFixed(2)
          : '',
      amt: course.amt !== undefined && course.amt !== null ? (Number(course.amt) / 100).toFixed(2) : '',
      num: course.num !== undefined && course.num !== null ? String(course.num) : '',
      chatNo: course.chatNo || '',
      iconDetail: course.iconDetail || '',
      iconTicket: course.iconTicket || '',
      status: String(course.status ?? '1'),
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
  const {
    query,
    data: courses,
    totalCount,
    totalPages,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) => {
      if (userId) {
        const data = await listBoughtSpecialCourses(userId);
        const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        return {
          data: items,
          totalCount: typeof data?.totalCount === 'number' ? data.totalCount : items.length,
        };
      }

      return listSpecialCourses(currentQuery);
    },
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (message) => showError(message || '精品课程列表加载失败'),
  });

  const columns = useMemo(
    () =>
      createSpecialCourseColumns({
        onEdit: openEditModal,
        onToggleStatus: handleStatusChange,
        onDelete: handleDelete,
        submitting: modalSubmitting || actionSubmitting,
      }),
    [actionSubmitting, modalSubmitting],
  );

  useEffect(() => {
    async function loadBooksData() {
      try {
        const data = await listBooks({
          pageNum: 1,
          pageSize: 1000,
        });
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        showError(error?.message || '课程教材列表加载失败');
      }
    }

    loadBooksData();
  }, []);

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

  async function handleSubmit(event) {
    event.preventDefault();

    const errorMessage = validateForm(form);
    if (errorMessage) {
      showError(errorMessage);
      return;
    }

    await submitModal({
      action: async () => {
        const payload = buildPayload(form, {
          allowTextbookIdEdit: modalMode === 'create',
        });

        if (modalMode === 'create') {
          await createSpecialCourse(payload);
          return;
        }

        await updateSpecialCourse({
          ...payload,
          textbookId: Number(form.textbookId),
        });
      },
      successMessage: modalMode === 'create' ? '精品课程创建成功' : '精品课程更新成功',
      errorMessage: '精品课程提交失败',
      close: closeModal,
      afterSuccess: async () => {
        await reload().catch(() => {});
        await refreshCourseOptions().catch(() => {});
      },
    });
  }

  async function handleDelete(course) {
    await runAction({
      confirmText: `确认删除精品课程 ${course.textbookName || course.textbookId} 吗？`,
      action: () => removeSpecialCourse(course.textbookId),
      successMessage: '精品课程已删除',
      errorMessage: '精品课程删除失败',
      afterSuccess: async () => {
        await reload().catch(() => {});
        await refreshCourseOptions().catch(() => {});
      },
    });
  }

  async function handleStatusChange(course) {
    await runAction({
      action: () =>
        Number(course.status) === 1
          ? downSpecialCourse(course.textbookId)
          : upSpecialCourse(course.textbookId),
      successMessage: '课程状态更新成功',
      errorMessage: '课程状态更新失败',
      afterSuccess: async () => {
        await reload().catch(() => {});
        await refreshCourseOptions().catch(() => {});
      },
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="精品课程"
        copy="对应旧版 `specialCourse`。保留课程配置、预售时间、上下架，以及按用户查看已买课程。"
      />

      <FeedbackBanner feedback={feedback} />

      {!userId ? (
        <section className="surface-card">
          <div className="toolbar-grid toolbar-grid--books">
            <label className="form-field">
              <span>预售开始时间</span>
              <input
                type="datetime-local"
                value={filters.startTime}
                onChange={(event) => setFilters((current) => ({ ...current, startTime: event.target.value }))}
              />
            </label>
            <label className="form-field">
              <span>预售结束时间</span>
              <input
                type="datetime-local"
                value={filters.endTime}
                onChange={(event) => setFilters((current) => ({ ...current, endTime: event.target.value }))}
              />
            </label>
            <div className="toolbar-actions">
              <button
                type="button"
                className="app-button app-button--primary"
                onClick={() =>
                  applyFilters({
                    startTime: toApiDateTime(filters.startTime),
                    endTime: toApiDateTime(filters.endTime),
                  })
                }
              >
                搜索
              </button>
              <button type="button" className="app-button app-button--ghost" onClick={openCreateModal}>
                添加精品课程
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
      ) : (
        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">已买课程视图</h3>
              <p className="section-meta">当前用户 ID: {userId}</p>
            </div>
            <div className="toolbar-actions">
              <button type="button" className="app-button app-button--ghost" onClick={() => navigate(-1)}>
                返回上一页
              </button>
              <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
                添加精品课程
              </button>
            </div>
          </div>
        </section>
      )}

      <PageTableCard
        title="课程列表"
        totalCount={totalCount}
        columns={columns}
        data={courses}
        rowKey={(row) => `${row.textbookId}-${row.id || row.textbookName || ''}`}
        loading={loading}
        minWidth={1680}
        pagination={
          !userId
            ? {
                pageNum: query.pageNum,
                pageSize: query.pageSize,
                totalPages,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                onPageChange: setPageNum,
                onPageSizeChange: setPageSize,
              }
            : null
        }
      />

      {modalOpen ? (
        <SpecialCourseModal
          mode={modalMode}
          form={form}
          books={books}
          detailUploadState={detailUploadState}
          ticketUploadState={ticketUploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}
    </div>
  );
}
