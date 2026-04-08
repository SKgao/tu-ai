import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { FileUploadField } from '@/app/components/FileUploadField';
import { ModalActions } from '@/app/components/ModalActions';
import {
  createPart,
  listParts,
  removePart,
  updatePart,
  uploadAsset,
} from '@/app/services/parts';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';

const EMPTY_PART_FORM = {
  id: '',
  title: '',
  icon: '',
  unitsId: '',
  tips: '',
  sort: '',
  canLock: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function PartModal({
  mode,
  form,
  uploadState,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}) {
  return (
    <AppModal
      title={mode === 'create' ? '新增 Part' : '编辑 Part'}
      description="维护 part 名称、图片、描述、排序和锁定状态。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Part 名称</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="请输入 part 名称"
            />
          </label>
          <label className="form-field">
            <span>单元 ID</span>
            <input
              value={form.unitsId}
              onChange={(event) => onChange('unitsId', event.target.value)}
              placeholder="请输入单元 ID"
            />
          </label>
          <label className="form-field">
            <span>排序字段</span>
            <input
              value={form.sort}
              onChange={(event) => onChange('sort', event.target.value)}
              placeholder="可选，数字"
            />
          </label>
          {mode === 'edit' ? (
            <label className="form-field">
              <span>锁定状态</span>
              <select
                value={form.canLock}
                onChange={(event) => onChange('canLock', event.target.value)}
              >
                <option value="1">已解锁</option>
                <option value="2">已锁定</option>
              </select>
            </label>
          ) : null}
          <label className="form-field form-field--full">
            <span>Part 描述</span>
            <textarea
              className="form-textarea"
              value={form.tips}
              onChange={(event) => onChange('tips', event.target.value)}
              placeholder="请输入 part 描述"
            />
          </label>
          <FileUploadField
            label="图片地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            uploadHint="支持上传 part 图片"
            previewAlt="part 图片"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function PartManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unitId') || '';
  const textBookId = searchParams.get('textBookId') || '';
  const [query, setQuery] = useState({
    unitId,
    pageNum: 1,
    pageSize: 10,
  });
  const [parts, setParts] = useState([]);
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
    form: partForm,
    updateForm: updatePartForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_PART_FORM,
      unitsId: unitId,
    }),
    editState: (part) => ({
      id: String(part.id),
      title: part.title || '',
      icon: part.icon || '',
      unitsId: String(part.unitsId || unitId || ''),
      tips: part.tips || '',
      sort: part.sort !== undefined && part.sort !== null ? String(part.sort) : '',
      canLock: String(part.canLock ?? 1),
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / query.pageSize)),
    [totalCount, query.pageSize],
  );

  async function loadParts(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listParts(nextQuery);
      setParts(data?.data || []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      showError(error?.message || 'Part 列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParts(query);
  }, [query.unitId, query.pageNum, query.pageSize]);

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入图片地址',
        onSuccess: (url) => {
          updatePartForm('icon', url);
        },
      });
    } catch {}
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!partForm.title.trim() || !partForm.unitsId) {
      showError('请填写 part 名称并输入单元 ID');
      return;
    }

    if (!/^\d+$/.test(partForm.unitsId)) {
      showError('单元 ID 必须为数字');
      return;
    }

    if (partForm.sort && !/^\d+$/.test(partForm.sort)) {
      showError('排序字段必须为数字');
      return;
    }

    const payload = {
      title: partForm.title.trim(),
      icon: partForm.icon.trim(),
      unitsId: Number(partForm.unitsId),
      tips: partForm.tips.trim(),
      sort: partForm.sort ? Number(partForm.sort) : undefined,
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createPart(payload);
          return;
        }

        await updatePart({
          ...payload,
          id: Number(partForm.id),
          canLock: partForm.canLock ? Number(partForm.canLock) : undefined,
        });
      },
      successMessage: modalMode === 'create' ? 'Part 创建成功' : 'Part 更新成功',
      errorMessage: 'Part 提交失败',
      close: closeModal,
      afterSuccess: () => loadParts(),
    });
  }

  async function handleDelete(part) {
    await runAction({
      confirmText: `确认删除 part ${part.title || part.id} 吗？`,
      action: () => removePart(part.id),
      successMessage: 'Part 已删除',
      errorMessage: 'Part 删除失败',
      afterSuccess: async () => {
        const nextPage =
          parts.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });
        if (nextPage === query.pageNum) {
          await loadParts();
        }
      },
    });
  }

  async function handleToggleLock(part) {
    await runAction({
      action: () =>
        updatePart({
          id: part.id,
          canLock: part.canLock === 1 ? 2 : 1,
        }),
      successMessage: part.canLock === 1 ? 'Part 已锁定' : 'Part 已解锁',
      errorMessage: 'Part 锁定状态更新失败',
      afterSuccess: () => loadParts(),
    });
  }

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">Part 管理</h2>
          <p className="page-copy">
            这一页对应旧版 part 管理模块，保留分页、增改删、图片上传和锁定能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--compact">
          <div className="section-meta">
            当前单元 ID: {query.unitId || '-'}，教材 ID: {textBookId || '-'}
          </div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加 Part
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() =>
                navigate(textBookId ? `/units?textbookId=${textBookId}` : '/units')
              }
            >
              返回单元
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">Part 列表</h3>
            <p className="section-meta">共 {totalCount} 条记录</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadParts()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Part 名称</th>
                <th>图片</th>
                <th>描述</th>
                <th>排序</th>
                <th>锁定状态</th>
                <th>详情</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    数据加载中...
                  </td>
                </tr>
              ) : null}
              {!loading && !parts.length ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? parts.map((part) => (
                    <tr key={part.id}>
                      <td>{part.title || '-'}</td>
                      <td>
                        {part.icon ? (
                          <a href={part.icon} target="_blank" rel="noreferrer" className="avatar-link">
                            <img src={part.icon} alt={part.title || 'part'} className="avatar-thumb" />
                          </a>
                        ) : (
                          <span className="table-muted">无</span>
                        )}
                      </td>
                      <td>{part.tips || <span className="table-muted">无</span>}</td>
                      <td>{part.sort ?? '-'}</td>
                      <td>
                        <span className={part.canLock === 1 ? 'status-pill status-pill--success' : 'status-pill status-pill--warning'}>
                          {part.canLock === 1 ? '已解锁' : '已锁定'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {part.id ? (
                            <Link
                              to={`/passes?partsId=${part.id}&textbookId=${textBookId}`}
                              className="text-button"
                            >
                              查看关卡
                            </Link>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="text-button" onClick={() => openEditModal(part)}>
                            编辑
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => handleToggleLock(part)}
                            disabled={modalSubmitting || actionSubmitting}
                          >
                            {part.canLock === 1 ? '锁定' : '解锁'}
                          </button>
                          {part.id ? (
                            <Link
                              to={`/passes?partsId=${part.id}&textbookId=${textBookId}`}
                              className="text-button"
                            >
                              查看关卡
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDelete(part)}
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
        <PartModal
          mode={modalMode}
          form={partForm}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updatePartForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}
    </div>
  );
}
