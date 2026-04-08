import React, { startTransition, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { FileUploadField } from '@/app/components/FileUploadField';
import { ModalActions } from '@/app/components/ModalActions';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import {
  createBook,
  createGrade,
  createVersion,
  listBooks,
  listGrades,
  listVersions,
  lockBook,
  removeBook,
  removeGrade,
  removeVersion,
  updateBook,
  updateGrade,
  updateVersion,
  uploadAsset,
} from '@/app/services/books';

const BOOK_FORM_EMPTY = {
  id: '',
  name: '',
  icon: '',
  gradeId: '',
  bookVersionId: '',
  status: '',
};

const RESOURCE_FORM_EMPTY = {
  id: '',
  name: '',
  sortValue: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function toApiDateTime(value) {
  return value ? `${value.replace('T', ' ')}:00` : '';
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={active ? 'tab-chip tab-chip--active' : 'tab-chip'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function BookModal({
  mode,
  form,
  grades,
  versions,
  uploadState,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}) {
  return (
    <AppModal
      title={mode === 'create' ? '新增教材' : '编辑教材'}
      description="统一维护教材名称、封面、年级和教材版本。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>教材名称</span>
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder="请输入教材名称"
            />
          </label>
          <label className="form-field">
            <span>年级</span>
            <select value={form.gradeId} onChange={(event) => onChange('gradeId', event.target.value)}>
              <option value="">请选择年级</option>
              {grades.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.gradeName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>教材版本</span>
            <select
              value={form.bookVersionId}
              onChange={(event) => onChange('bookVersionId', event.target.value)}
            >
              <option value="">请选择教材版本</option>
              {versions.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {mode === 'edit' ? (
            <label className="form-field">
              <span>年级顺序</span>
              <input
                value={form.status}
                onChange={(event) => onChange('status', event.target.value)}
                placeholder="可选，数字"
              />
            </label>
          ) : null}
          <FileUploadField
            label="封面图地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            placeholder="可直接粘贴图片 URL，或使用下方文件上传"
            uploadHint="支持上传教材封面"
            previewAlt="教材封面"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

function ResourceModal({ title, label, form, submitting, onClose, onChange, onSubmit }) {
  return (
    <AppModal
      title={title}
      description="维护基础资源，供教材管理和后续业务页使用。"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>{label}</span>
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder={`请输入${label}`}
            />
          </label>
          <label className="form-field">
            <span>排序字段</span>
            <input
              value={form.sortValue}
              onChange={(event) => onChange('sortValue', event.target.value)}
              placeholder="可选，数字"
            />
          </label>
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function BookManagementPage() {
  const [activeTab, setActiveTab] = useState('book');
  const [filters, setFilters] = useState({
    startTime: '',
    endTime: '',
    gradeId: '',
    bookVersionId: '',
  });
  const [query, setQuery] = useState({
    startTime: '',
    endTime: '',
    gradeId: '',
    bookVersionId: '',
    pageNum: 1,
    pageSize: 10,
  });
  const [books, setBooks] = useState([]);
  const [grades, setGrades] = useState([]);
  const [versions, setVersions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resourceType, setResourceType] = useState('');
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
    isOpen: bookModalOpen,
    mode: bookModalMode,
    form: bookForm,
    updateForm: updateBookForm,
    openCreate: openCreateBookModal,
    openEdit: openEditBookModal,
    close: closeBookModal,
  } = useModalState({
    createState: () => ({ ...BOOK_FORM_EMPTY }),
    editState: (book) => ({
      id: String(book.id),
      name: book.name || '',
      icon: book.icon || '',
      gradeId: String(book.gradeId || ''),
      bookVersionId: String(book.bookVersionId || ''),
      status: String(book.status ?? ''),
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });
  const {
    isOpen: resourceModalOpen,
    form: resourceForm,
    updateForm: updateResourceForm,
    openCreate: openCreateResourceState,
    openEdit: openEditResourceState,
    close: closeResourceModal,
  } = useModalState({
    createState: () => ({ ...RESOURCE_FORM_EMPTY }),
    editState: ({ type, item }) => ({
      id: String(item.id),
      name: type === 'grade' ? item.gradeName || '' : item.name || '',
      sortValue: item.status !== undefined && item.status !== null ? String(item.status) : '',
    }),
    onClose: () => setResourceType(''),
  });

  async function loadGrades() {
    const data = await listGrades();
    setGrades(Array.isArray(data) ? data : []);
  }

  async function loadVersions() {
    const data = await listVersions();
    setVersions(Array.isArray(data) ? data : []);
  }

  async function loadBooks(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listBooks(nextQuery);
      setBooks(Array.isArray(data?.data) ? data.data : []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      showError(error?.message || '教材列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function refreshActiveTab() {
    setLoading(true);
    try {
      if (activeTab === 'book') {
        const [gradeData, versionData, bookData] = await Promise.all([
          listGrades(),
          listVersions(),
          listBooks(query),
        ]);
        setGrades(Array.isArray(gradeData) ? gradeData : []);
        setVersions(Array.isArray(versionData) ? versionData : []);
        setBooks(Array.isArray(bookData?.data) ? bookData.data : []);
        setTotalCount(bookData?.totalCount || 0);
        return;
      }

      if (activeTab === 'grade') {
        const data = await listGrades();
        setGrades(Array.isArray(data) ? data : []);
        return;
      }

      const data = await listVersions();
      setVersions(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '数据加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshActiveTab();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'book') {
      loadBooks(query);
    }
  }, [activeTab, query.bookVersionId, query.endTime, query.gradeId, query.pageNum, query.pageSize, query.startTime]);

  function openResourceModal(type, item = null) {
    setResourceType(type);
    if (item) {
      openEditResourceState({ type, item });
      return;
    }
    openCreateResourceState();
  }

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入封面地址',
        onSuccess: (url) => {
          updateBookForm('icon', url);
        },
      });
    } catch {}
  }

  function handleBookSearch(event) {
    event.preventDefault();
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        pageNum: 1,
        startTime: toApiDateTime(filters.startTime),
        endTime: toApiDateTime(filters.endTime),
        gradeId: filters.gradeId,
        bookVersionId: filters.bookVersionId,
      }));
    });
  }

  async function handleBookSubmit(event) {
    event.preventDefault();

    if (!bookForm.name.trim() || !bookForm.gradeId || !bookForm.bookVersionId) {
      showError('请填写教材名称并选择年级、教材版本');
      return;
    }

    const payload = {
      name: bookForm.name.trim(),
      icon: bookForm.icon.trim(),
      gradeId: Number(bookForm.gradeId),
      bookVersionId: Number(bookForm.bookVersionId),
    };

    await submitModal({
      action: async () => {
        if (bookModalMode === 'create') {
          await createBook(payload);
          return;
        }

        await updateBook({
          ...payload,
          id: Number(bookForm.id),
          status: bookForm.status !== '' ? Number(bookForm.status) : undefined,
        });
      },
      successMessage: bookModalMode === 'create' ? '教材创建成功' : '教材更新成功',
      errorMessage: '教材提交失败',
      close: closeBookModal,
      afterSuccess: () => loadBooks(),
    });
  }

  async function handleResourceSubmit(event) {
    event.preventDefault();

    if (!resourceForm.name.trim()) {
      showError(`请输入${resourceType === 'grade' ? '年级' : '教材版本'}名称`);
      return;
    }

    if (resourceForm.sortValue && !/^\d+$/.test(resourceForm.sortValue)) {
      showError('排序字段必须为数字');
      return;
    }

    await submitModal({
      action: async () => {
        if (resourceType === 'grade') {
          if (resourceForm.id) {
            await updateGrade({
              id: Number(resourceForm.id),
              gradeName: resourceForm.name.trim(),
              status: resourceForm.sortValue ? Number(resourceForm.sortValue) : undefined,
            });
          } else {
            await createGrade(resourceForm.name.trim());
          }
          await loadGrades();
          return;
        }

        if (resourceForm.id) {
          await updateVersion({
            id: Number(resourceForm.id),
            name: resourceForm.name.trim(),
          });
        } else {
          await createVersion(resourceForm.name.trim());
        }
        await loadVersions();
      },
      successMessage:
        resourceType === 'grade'
          ? resourceForm.id
            ? '年级更新成功'
            : '年级创建成功'
          : resourceForm.id
            ? '教材版本更新成功'
            : '教材版本创建成功',
      errorMessage: '资源提交失败',
      close: closeResourceModal,
    });
  }

  async function handleDeleteBook(book) {
    await runAction({
      confirmText: `确认删除教材 ${book.name || book.id} 吗？`,
      action: () => removeBook(book.id),
      successMessage: '教材已删除',
      errorMessage: '教材删除失败',
      afterSuccess: async () => {
        const nextPage = books.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });
        if (nextPage === query.pageNum) {
          await loadBooks();
        }
      },
    });
  }

  async function handleToggleBookLock(book) {
    await runAction({
      action: () =>
        lockBook({
          textbookId: book.id,
          canLock: book.canLock === 1 ? 2 : 1,
        }),
      successMessage: book.canLock === 1 ? '教材已锁定' : '教材已解锁',
      errorMessage: '教材锁定状态更新失败',
      afterSuccess: () => loadBooks(),
    });
  }

  async function handleDeleteResource(type, item) {
    const label = type === 'grade' ? item.gradeName || item.id : item.name || item.id;
    await runAction({
      confirmText: `确认删除 ${label} 吗？`,
      action: () => (type === 'grade' ? removeGrade(item.id) : removeVersion(item.id)),
      successMessage: type === 'grade' ? '年级已删除' : '教材版本已删除',
      errorMessage: '删除失败',
      afterSuccess: () => (type === 'grade' ? loadGrades() : loadVersions()),
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">教材管理</h2>
          <p className="page-copy">
            这一页整合了旧版的教材、年级、教材版本三个 tab，并保留封面上传、锁定和资源维护能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="tab-row">
          <TabButton active={activeTab === 'book'} onClick={() => setActiveTab('book')}>
            教材管理
          </TabButton>
          <TabButton active={activeTab === 'grade'} onClick={() => setActiveTab('grade')}>
            年级管理
          </TabButton>
          <TabButton active={activeTab === 'version'} onClick={() => setActiveTab('version')}>
            教材版本
          </TabButton>
        </div>

        {activeTab === 'book' ? (
          <form className="toolbar-grid toolbar-grid--books" onSubmit={handleBookSearch}>
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
              <span>年级</span>
              <select
                value={filters.gradeId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, gradeId: event.target.value }))
                }
              >
                <option value="">全部</option>
                {grades.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.gradeName}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>教材版本</span>
              <select
                value={filters.bookVersionId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, bookVersionId: event.target.value }))
                }
              >
                <option value="">全部</option>
                {versions.map((item) => (
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
              <button type="button" className="app-button app-button--ghost" onClick={openCreateBookModal}>
                添加教材
              </button>
            </div>
          </form>
        ) : (
          <div className="toolbar-grid toolbar-grid--compact">
            <div className="section-meta">
              {activeTab === 'grade'
                ? '维护年级基础数据，供教材和课程配置引用。'
                : '维护教材版本基础数据，供教材录入时选择。'}
            </div>
            <div className="toolbar-actions">
              <button
                type="button"
                className="app-button app-button--primary"
                onClick={() => openResourceModal(activeTab)}
              >
                {activeTab === 'grade' ? '添加年级' : '添加教材版本'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">
              {activeTab === 'book' ? '教材列表' : activeTab === 'grade' ? '年级列表' : '教材版本列表'}
            </h3>
            <p className="section-meta">
              {activeTab === 'book'
                ? `共 ${totalCount} 条教材记录`
                : activeTab === 'grade'
                  ? `共 ${grades.length} 个年级`
                  : `共 ${versions.length} 个教材版本`}
            </p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={refreshActiveTab}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          {activeTab === 'book' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>教材名</th>
                  <th>封面</th>
                  <th>年级</th>
                  <th>教材版本</th>
                  <th>创建时间</th>
                  <th>年级顺序</th>
                  <th>锁定状态</th>
                  <th>详情</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="table-empty">
                      数据加载中...
                    </td>
                  </tr>
                ) : null}
                {!loading && !books.length ? (
                  <tr>
                    <td colSpan="9" className="table-empty">
                      暂无数据
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? books.map((book) => (
                      <tr key={book.id}>
                        <td>{book.name || '-'}</td>
                        <td>
                          {book.icon ? (
                            <a href={book.icon} target="_blank" rel="noreferrer" className="avatar-link">
                              <img src={book.icon} alt={book.name || 'book'} className="avatar-thumb" />
                            </a>
                          ) : (
                            <span className="table-muted">无</span>
                          )}
                        </td>
                        <td>{book.gradeName || book.gradeId || '-'}</td>
                        <td>{book.bookVersionName || book.bookVersionId || '-'}</td>
                        <td>{book.createdAt || '-'}</td>
                        <td>{book.status ?? '-'}</td>
                        <td>
                          <span
                            className={
                              book.canLock === 1 ? 'status-pill status-pill--success' : 'status-pill status-pill--warning'
                            }
                          >
                            {book.canLock === 1 ? '已解锁' : '已锁定'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/units?textbookId=${book.id}`} className="text-button">
                              查看单元
                            </Link>
                            <Link to={`/sessions?textbookId=${book.id}`} className="text-button">
                              查看大关卡
                            </Link>
                            <Link to={`/custom-passes?textbookId=${book.id}`} className="text-button">
                              查看小关卡
                            </Link>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="text-button" onClick={() => openEditBookModal(book)}>
                              编辑
                            </button>
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => handleToggleBookLock(book)}
                              disabled={submitting}
                            >
                              {book.canLock === 1 ? '锁定' : '解锁'}
                            </button>
                            <button
                              type="button"
                              className="text-button text-button--danger"
                              onClick={() => handleDeleteBook(book)}
                              disabled={submitting}
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
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{activeTab === 'grade' ? '年级名称' : '教材版本名称'}</th>
                  <th>{activeTab === 'grade' ? '年级顺序' : '备注'}</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      数据加载中...
                    </td>
                  </tr>
                ) : null}
                {!loading && !(activeTab === 'grade' ? grades.length : versions.length) ? (
                  <tr>
                    <td colSpan="4" className="table-empty">
                      暂无数据
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? (activeTab === 'grade' ? grades : versions).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{activeTab === 'grade' ? item.gradeName || '-' : item.name || '-'}</td>
                        <td>{activeTab === 'grade' ? item.status ?? '-' : '版本资源'}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="text-button"
                              onClick={() => openResourceModal(activeTab, item)}
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              className="text-button text-button--danger"
                              onClick={() => handleDeleteResource(activeTab, item)}
                              disabled={submitting}
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
          )}
        </div>

        {activeTab === 'book' ? (
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
        ) : null}
      </section>

      {bookModalOpen ? (
        <BookModal
          mode={bookModalMode}
          form={bookForm}
          grades={grades}
          versions={versions}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeBookModal}
          onChange={updateBookForm}
          onSubmit={handleBookSubmit}
          onUpload={handleUpload}
        />
      ) : null}

      {resourceModalOpen ? (
        <ResourceModal
          title={
            resourceType === 'grade'
              ? resourceForm.id
                ? '编辑年级'
                : '新增年级'
              : resourceForm.id
                ? '编辑教材版本'
                : '新增教材版本'
          }
          label={resourceType === 'grade' ? '年级名称' : '教材版本名称'}
          form={resourceForm}
          submitting={modalSubmitting}
          onClose={closeResourceModal}
          onChange={updateResourceForm}
          onSubmit={handleResourceSubmit}
        />
      ) : null}
    </div>
  );
}
