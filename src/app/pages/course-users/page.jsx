import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCourseUser, listCourseUsers } from '@/app/services/course-users';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createCourseUserColumns } from './configs/tableColumns';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const EMPTY_FORM = {
  realName: '',
  mobile: '',
  sex: '1',
  payAmt: '',
  textbookId: '',
};

const INITIAL_FILTERS = {
  textbookId: '',
  tutuNumber: '',
  mobile: '',
  realName: '',
  sex: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function CourseUserModal({ form, books, submitting, onClose, onChange, onSubmit }) {
  return (
    <AppModal
      title="开通精品课程"
      description="补齐旧版 `courseUser` 里的开通课程能力。"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>用户名</span>
            <input
              value={form.realName}
              onChange={(event) => onChange('realName', event.target.value)}
              placeholder="请输入用户名"
            />
          </label>
          <label className="form-field">
            <span>手机号</span>
            <input
              value={form.mobile}
              onChange={(event) => onChange('mobile', event.target.value)}
              placeholder="请输入手机号"
            />
          </label>
          <label className="form-field">
            <span>性别</span>
            <select value={form.sex} onChange={(event) => onChange('sex', event.target.value)}>
              <option value="1">男</option>
              <option value="2">女</option>
            </select>
          </label>
          <label className="form-field">
            <span>付款金额</span>
            <input
              value={form.payAmt}
              onChange={(event) => onChange('payAmt', event.target.value)}
              placeholder="请输入付款金额，单位元"
            />
          </label>
          <label className="form-field form-field--full">
            <span>精品课程</span>
            <select
              value={form.textbookId}
              onChange={(event) => onChange('textbookId', event.target.value)}
            >
              <option value="">请选择精品课程</option>
              {books.map((item) => (
                <option key={item.textbookId} value={String(item.textbookId)}>
                  {item.textbookName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function CourseUserManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeTutuNumber = searchParams.get('tutuNumber') || '';
  const [filters, setFilters] = useState({
    ...INITIAL_FILTERS,
    tutuNumber: routeTutuNumber,
  });
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const books = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const columns = useMemo(() => createCourseUserColumns(), []);
  const {
    isOpen: modalOpen,
    form,
    updateForm,
    openCreate: openCreateModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_FORM }),
  });
  const {
    query,
    data: users,
    totalCount,
    totalPages,
    loading,
    applyFilters,
    patchQuery,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      pageNum: 1,
      pageSize: 10,
      textbookId: '',
      tutuNumber: routeTutuNumber,
      mobile: '',
      realName: '',
      sex: '',
    },
    request: listCourseUsers,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (message) => showError(message || '已买课程列表加载失败'),
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      tutuNumber: routeTutuNumber,
    }));
    patchQuery({
      tutuNumber: routeTutuNumber,
      pageNum: 1,
    });
  }, [routeTutuNumber]);

  useEffect(() => {
    ensureCourseOptions().catch((error) => {
      showError(error?.message || '精品课程列表加载失败');
    });
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearch() {
    applyFilters({
      textbookId: filters.textbookId,
      tutuNumber: filters.tutuNumber.trim(),
      mobile: filters.mobile.trim(),
      realName: filters.realName.trim(),
      sex: filters.sex,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.realName.trim() || !/^[1][0-9]{10}$/.test(form.mobile) || !form.payAmt || !form.textbookId) {
      showError('请填写用户名、合法手机号、付款金额并选择精品课程');
      return;
    }

    if (Number.isNaN(Number(form.payAmt))) {
      showError('付款金额必须为数字');
      return;
    }

    await submitModal({
      action: () =>
        createCourseUser({
          realName: form.realName.trim(),
          mobile: form.mobile.trim(),
          sex: Number(form.sex),
          payAmt: Math.round(Number(form.payAmt) * 100),
          textbookId: Number(form.textbookId),
        }),
      successMessage: '精品课程开通成功',
      errorMessage: '精品课程开通失败',
      close: closeModal,
      afterSuccess: async () => {
        await reload().catch(() => {});
      },
    });
  }

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">已买课程</h2>
          <p className="page-copy">
            这一页对应旧版 `courseUser` 模块，展示精品课程购买用户并支持手动开通课程。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--books">
          <label className="form-field">
            <span>精品课程</span>
            <select
              value={filters.textbookId}
              onChange={(event) => updateFilter('textbookId', event.target.value)}
            >
              <option value="">全部</option>
              {books.map((item) => (
                <option key={item.textbookId} value={String(item.textbookId)}>
                  {item.textbookName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>图图号</span>
            <input
              value={filters.tutuNumber}
              onChange={(event) => updateFilter('tutuNumber', event.target.value)}
              placeholder="输入图图号"
            />
          </label>
          <label className="form-field">
            <span>手机号</span>
            <input
              value={filters.mobile}
              onChange={(event) => updateFilter('mobile', event.target.value)}
              placeholder="输入手机号"
            />
          </label>
          <label className="form-field">
            <span>用户名</span>
            <input
              value={filters.realName}
              onChange={(event) => updateFilter('realName', event.target.value)}
              placeholder="输入用户名"
            />
          </label>
          <label className="form-field">
            <span>性别</span>
            <select value={filters.sex} onChange={(event) => updateFilter('sex', event.target.value)}>
              <option value="">全部</option>
              <option value="1">男</option>
              <option value="2">女</option>
            </select>
          </label>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={handleSearch}>
              搜索
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={openCreateModal}>
              开通精品课程
            </button>
            {routeTutuNumber ? (
              <button type="button" className="app-button app-button--ghost" onClick={() => navigate(-1)}>
                返回上一层
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <PageTableCard
        title="已买课程列表"
        totalCount={totalCount}
        columns={columns}
        data={users}
        rowKey={(row, index) => `${row.tutuNumber || 'course-user'}-${index}`}
        loading={loading}
        minWidth={1120}
        headerActions={
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => reload().catch(() => {})}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        }
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
        <CourseUserModal
          form={form}
          books={books}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
