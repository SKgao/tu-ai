import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { FileUploadField } from '@/app/components/FileUploadField';
import { ModalActions } from '@/app/components/ModalActions';
import {
  createPass,
  listPasses,
  listSubjects,
  removePass,
  updatePass,
  uploadAsset,
} from '@/app/services/passes';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';

const EMPTY_PASS_FORM = {
  id: '',
  title: '',
  icon: '',
  partsId: '',
  sort: '',
  subject: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function PassModal({
  mode,
  form,
  subjects,
  uploadState,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}) {
  return (
    <AppModal
      title={mode === 'create' ? '新增关卡' : '编辑关卡'}
      description="维护关卡标题、图片、归属 part、排序和题型。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>关卡标题</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="请输入关卡标题"
            />
          </label>
          <label className="form-field">
            <span>Part ID</span>
            <input
              value={form.partsId}
              onChange={(event) => onChange('partsId', event.target.value)}
              placeholder="请输入 partsId"
            />
          </label>
          <label className="form-field">
            <span>关卡顺序</span>
            <input
              value={form.sort}
              onChange={(event) => onChange('sort', event.target.value)}
              placeholder="请输入关卡顺序"
            />
          </label>
          <label className="form-field">
            <span>题型</span>
            <select
              value={form.subject}
              onChange={(event) => onChange('subject', event.target.value)}
            >
              <option value="">请选择题型</option>
              {subjects.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <FileUploadField
            label="关卡图片地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            uploadHint="支持上传关卡图片"
            previewAlt="关卡图片"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function PassManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partsId = searchParams.get('partsId') || '';
  const textbookId = searchParams.get('textbookId') || '';
  const [query, setQuery] = useState({
    partsId,
    pageNum: 1,
    pageSize: 10,
  });
  const [passes, setPasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
    form: passForm,
    updateForm: updatePassForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_PASS_FORM,
      partsId,
    }),
    editState: (pass) => ({
      id: String(pass.id),
      title: pass.title || '',
      icon: pass.icon || '',
      partsId: String(pass.partsId || partsId || ''),
      sort: pass.sort !== undefined && pass.sort !== null ? String(pass.sort) : '',
      subject: pass.subject !== undefined && pass.subject !== null ? String(pass.subject) : '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / query.pageSize)),
    [totalCount, query.pageSize],
  );

  async function loadPasses(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listPasses(nextQuery);
      setPasses(data?.data || []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      showError(error?.message || '关卡列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubjects() {
    try {
      const data = await listSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '题型列表加载失败');
    }
  }

  useEffect(() => {
    loadPasses(query);
  }, [query.partsId, query.pageNum, query.pageSize]);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入图片地址',
        onSuccess: (url) => {
          updatePassForm('icon', url);
        },
      });
    } catch {}
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!passForm.title.trim() || !passForm.partsId || !passForm.subject) {
      showError('请填写关卡标题、part ID 并选择题型');
      return;
    }

    if (!/^\d+$/.test(passForm.partsId) || (passForm.sort && !/^\d+$/.test(passForm.sort))) {
      showError('part ID 和关卡顺序必须为数字');
      return;
    }

    const payload = {
      title: passForm.title.trim(),
      icon: passForm.icon.trim(),
      partsId: Number(passForm.partsId),
      sort: passForm.sort ? Number(passForm.sort) : undefined,
      subject: Number(passForm.subject),
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createPass(payload);
          return;
        }

        await updatePass({
          ...payload,
          id: Number(passForm.id),
        });
      },
      successMessage: modalMode === 'create' ? '关卡创建成功' : '关卡更新成功',
      errorMessage: '关卡提交失败',
      close: closeModal,
      afterSuccess: () => loadPasses(),
    });
  }

  async function handleDelete(pass) {
    await runAction({
      confirmText: `确认删除关卡 ${pass.title || pass.id} 吗？`,
      action: () => removePass(pass.id),
      successMessage: '关卡已删除',
      errorMessage: '关卡删除失败',
      afterSuccess: async () => {
        const nextPage =
          passes.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });
        if (nextPage === query.pageNum) {
          await loadPasses();
        }
      },
    });
  }

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">关卡管理</h2>
          <p className="page-copy">
            这一页对应旧版关卡管理模块，保留分页、增改删、图片上传和题型选择能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--compact">
          <div className="section-meta">
            当前 Part ID: {query.partsId || '-'}，教材 ID: {textbookId || '-'}
          </div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加关卡
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() =>
                navigate(textbookId ? `/parts?textBookId=${textbookId}&unitId=` : '/parts')
              }
            >
              返回 Part
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">关卡列表</h3>
            <p className="section-meta">共 {totalCount} 条记录</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadPasses()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>关卡标题</th>
                <th>图片</th>
                <th>闯关人数</th>
                <th>关卡顺序</th>
                <th>平均分</th>
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
              {!loading && !passes.length ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? passes.map((pass) => (
                    <tr key={pass.id}>
                      <td>{pass.title || '-'}</td>
                      <td>
                        {pass.icon ? (
                          <a href={pass.icon} target="_blank" rel="noreferrer" className="avatar-link">
                            <img src={pass.icon} alt={pass.title || 'pass'} className="avatar-thumb" />
                          </a>
                        ) : (
                          <span className="table-muted">无</span>
                        )}
                      </td>
                      <td>{pass.customerNumber ?? '-'}</td>
                      <td>{pass.sort ?? '-'}</td>
                      <td>{pass.totalScore ?? '-'}</td>
                      <td>{pass.createdAt || '-'}</td>
                      <td>
                        <div className="table-actions">
                          {pass.id ? (
                            <Link to={`/subjects?customsPassId=${pass.id}`} className="text-button">
                              查看题目
                            </Link>
                          ) : (
                            <span className="table-muted">无可用题目</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="text-button" onClick={() => openEditModal(pass)}>
                            编辑
                          </button>
                          {pass.id ? (
                            <Link to={`/subjects?customsPassId=${pass.id}`} className="text-button">
                              查看题目
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDelete(pass)}
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
        <PassModal
          mode={modalMode}
          form={passForm}
          subjects={subjects}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updatePassForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}
    </div>
  );
}
