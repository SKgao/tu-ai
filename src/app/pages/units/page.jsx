import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { FileUploadField } from '@/app/components/FileUploadField';
import { ModalActions } from '@/app/components/ModalActions';
import {
  createUnit,
  listBooks,
  listUnits,
  lockUnit,
  removeUnit,
  updateUnit,
  uploadAsset,
} from '@/app/services/units';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';

const EMPTY_UNIT_FORM = {
  id: '',
  text: '',
  icon: '',
  textBookId: '',
  sort: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function toApiDateTime(value) {
  return value ? `${value.replace('T', ' ')}:00` : '';
}

function UnitModal({
  mode,
  form,
  books,
  uploadState,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}) {
  return (
    <AppModal
      title={mode === 'create' ? '新增单元' : '编辑单元'}
      description="维护单元名称、封面、教材归属和排序字段。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>单元名称</span>
            <input
              value={form.text}
              onChange={(event) => onChange('text', event.target.value)}
              placeholder="请输入单元名称"
            />
          </label>
          <label className="form-field">
            <span>教材</span>
            <select
              value={form.textBookId}
              onChange={(event) => onChange('textBookId', event.target.value)}
            >
              <option value="">请选择教材</option>
              {books.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>排序字段</span>
            <input
              value={form.sort}
              onChange={(event) => onChange('sort', event.target.value)}
              placeholder="可选，数字"
            />
          </label>
          <FileUploadField
            label="封面图地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            uploadHint="支持上传单元封面"
            previewAlt="单元封面"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function UnitManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTextbookId = searchParams.get('textbookId') || searchParams.get('textBookId') || '';
  const [filters, setFilters] = useState({
    startTime: '',
    endTime: '',
    textBookId: initialTextbookId,
  });
  const [query, setQuery] = useState({
    startTime: '',
    endTime: '',
    textBookId: initialTextbookId,
    pageNum: 1,
    pageSize: 10,
  });
  const [units, setUnits] = useState([]);
  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { uploadState, upload, resetUploadState } = useFileUpload({
    uploadRequest: uploadAsset,
  });
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
    form: unitForm,
    updateForm: updateUnitForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_UNIT_FORM,
      textBookId: filters.textBookId || '',
    }),
    editState: (unit) => ({
      id: String(unit.id),
      text: unit.text || '',
      icon: unit.icon || '',
      textBookId: String(unit.textBookId || ''),
      sort: unit.sort !== undefined && unit.sort !== null ? String(unit.sort) : '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });

  const bookMap = useMemo(
    () => new Map(books.map((item) => [String(item.id), item.name])),
    [books],
  );

  async function loadBooks() {
    try {
      const data = await listBooks({
        pageNum: 1,
        pageSize: 1000,
      });
      setBooks(data?.data || []);
    } catch (error) {
      showError(error?.message || '教材列表加载失败');
    }
  }

  async function loadUnits(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listUnits(nextQuery);
      setUnits(data?.data || []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      showError(error?.message || '单元列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    loadUnits(query);
  }, [query.pageNum, query.pageSize, query.textBookId, query.startTime, query.endTime]);

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入封面地址',
        onSuccess: (url) => {
          updateUnitForm('icon', url);
        },
      });
    } catch {}
  }

  function handleSearch(event) {
    event.preventDefault();
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        pageNum: 1,
        textBookId: filters.textBookId,
        startTime: toApiDateTime(filters.startTime),
        endTime: toApiDateTime(filters.endTime),
      }));
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!unitForm.text.trim() || !unitForm.textBookId) {
      showError('请填写单元名称并选择教材');
      return;
    }

    if (unitForm.sort && !/^\d+$/.test(unitForm.sort)) {
      showError('排序字段必须为数字');
      return;
    }

    const payload = {
      text: unitForm.text.trim(),
      icon: unitForm.icon.trim(),
      textBookId: Number(unitForm.textBookId),
      sort: unitForm.sort ? Number(unitForm.sort) : undefined,
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createUnit(payload);
          return;
        }

        await updateUnit({
          ...payload,
          id: Number(unitForm.id),
        });
      },
      successMessage: modalMode === 'create' ? '单元创建成功' : '单元更新成功',
      errorMessage: '单元提交失败',
      close: closeModal,
      afterSuccess: () => loadUnits(),
    });
  }

  async function handleDelete(unit) {
    await runAction({
      confirmText: `确认删除单元 ${unit.text || unit.id} 吗？`,
      action: () => removeUnit(unit.id),
      successMessage: '单元已删除',
      errorMessage: '单元删除失败',
      afterSuccess: async () => {
        const nextPage =
          units.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });
        if (nextPage === query.pageNum) {
          await loadUnits();
        }
      },
    });
  }

  async function handleToggleLock(unit) {
    await runAction({
      action: () =>
        lockUnit({
          unitId: unit.id,
          canLock: unit.canLock === 1 ? 2 : 1,
        }),
      successMessage: unit.canLock === 1 ? '单元已锁定' : '单元已解锁',
      errorMessage: '单元锁定状态更新失败',
      afterSuccess: () => loadUnits(),
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">单元管理</h2>
          <p className="page-copy">
            这一页对应旧版单元管理模块，保留教材筛选、分页、增改删、封面上传和锁定能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <form className="toolbar-grid toolbar-grid--units" onSubmit={handleSearch}>
          <label className="form-field">
            <span>开始时间</span>
            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(event) =>
                setFilters((current) => ({ ...current, startTime: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>结束时间</span>
            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(event) =>
                setFilters((current) => ({ ...current, endTime: event.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>教材</span>
            <select
              value={filters.textBookId}
              onChange={(event) =>
                setFilters((current) => ({ ...current, textBookId: event.target.value }))
              }
            >
              <option value="">全部</option>
              {books.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="toolbar-actions">
            <button type="submit" className="app-button app-button--primary">
              搜索
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={openCreateModal}>
              添加单元
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => navigate('/books')}
            >
              返回教材
            </button>
          </div>
        </form>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">单元列表</h3>
            <p className="section-meta">共 {totalCount} 条记录</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadUnits()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>单元名</th>
                <th>封面图</th>
                <th>教材</th>
                <th>排序</th>
                <th>锁定状态</th>
                <th>创建时间</th>
                <th>详情</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    数据加载中...
                  </td>
                </tr>
              ) : null}
              {!loading && !units.length ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? units.map((unit) => (
                    <tr key={unit.id}>
                      <td>{unit.text || '-'}</td>
                      <td>
                        {unit.icon ? (
                          <a href={unit.icon} target="_blank" rel="noreferrer" className="avatar-link">
                            <img src={unit.icon} alt={unit.text || 'unit'} className="avatar-thumb" />
                          </a>
                        ) : (
                          <span className="table-muted">无</span>
                        )}
                      </td>
                      <td>{unit.textBookName || bookMap.get(String(unit.textBookId)) || unit.textBookId || '-'}</td>
                      <td>{unit.sort ?? '-'}</td>
                      <td>
                        <span className={unit.canLock === 1 ? 'status-pill status-pill--success' : 'status-pill status-pill--warning'}>
                          {unit.canLock === 1 ? '已解锁' : '已锁定'}
                        </span>
                      </td>
                      <td>{unit.createdAt || '-'}</td>
                      <td>
                        <div className="table-actions">
                          {unit.id ? (
                            <Link
                              to={`/parts?unitId=${unit.id}&textBookId=${unit.textBookId || query.textBookId || ''}`}
                              className="text-button"
                            >
                              查看 part
                            </Link>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="text-button" onClick={() => openEditModal(unit)}>
                            编辑
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => handleToggleLock(unit)}
                            disabled={modalSubmitting || actionSubmitting}
                          >
                            {unit.canLock === 1 ? '锁定' : '解锁'}
                          </button>
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDelete(unit)}
                            disabled={modalSubmitting || actionSubmitting}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="section-meta">
            第 {query.pageNum} / {totalPages} 页
          </div>
          <div className="pagination-controls">
            <select
              value={query.pageSize}
              onChange={(event) => {
                const pageSize = Number(event.target.value);
                startTransition(() => {
                  setQuery((current) => ({
                    ...current,
                    pageNum: 1,
                    pageSize,
                  }));
                });
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  每页 {size} 条
                </option>
              ))}
            </select>
            <button
              type="button"
              className="app-button app-button--ghost"
              disabled={query.pageNum <= 1 || loading}
              onClick={() => {
                startTransition(() => {
                  setQuery((current) => ({
                    ...current,
                    pageNum: current.pageNum - 1,
                  }));
                });
              }}
            >
              上一页
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              disabled={query.pageNum >= totalPages || loading}
              onClick={() => {
                startTransition(() => {
                  setQuery((current) => ({
                    ...current,
                    pageNum: current.pageNum + 1,
                  }));
                });
              }}
            >
              下一页
            </button>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <UnitModal
          mode={modalMode}
          form={unitForm}
          books={books}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateUnitForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}
    </div>
  );
}
