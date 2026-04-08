import React, { startTransition, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { AppModal } from '@/app/components/AppModal';
import { BatchFilePickerField } from '@/app/components/BatchFilePickerField';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import {
  batchDownloadSourceMaterialAudio,
  batchRemoveSourceMaterials,
  batchSyncSourceMaterials,
  createSourceMaterial,
  importSubjectSources,
  listBooks,
  listSourceMaterials,
  removeSourceMaterial,
  updateSourceMaterial,
  uploadAsset,
} from '@/app/services/source-material';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';

const EMPTY_MATERIAL_FORM = {
  id: '',
  textbookId: '',
  text: '',
  icon: '',
  audio: '',
  translation: '',
  explainsArray: '',
};

const EMPTY_IMPORT_FORM = {
  textbookId: '',
  audioArray: [],
  imageArray: [],
  sentensArray: [],
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '//test.api.admin.tutukids.com/';
const IS_PRODUCTION_API = API_BASE_URL.includes('new.api.admin.tutukids.com');

function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

function getFileBaseName(fileName) {
  const name = String(fileName || '').trim();
  const index = name.lastIndexOf('.');

  if (index <= 0) {
    return name;
  }

  return name.slice(0, index);
}

function MaterialModal({
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
      title={mode === 'create' ? '新增素材' : '编辑素材'}
      description="维护素材文本、图标、音频和释义信息。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>教材</span>
            <select
              value={form.textbookId}
              onChange={(event) => onChange('textbookId', event.target.value)}
              disabled={mode === 'edit'}
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
            <span>素材内容</span>
            <input
              value={form.text}
              onChange={(event) => onChange('text', event.target.value)}
              placeholder="请输入素材内容"
            />
          </label>
          <label className="form-field form-field--full">
            <span>素材图标地址</span>
            <input
              value={form.icon}
              onChange={(event) => onChange('icon', event.target.value)}
              placeholder="可直接粘贴图片 URL"
            />
          </label>
          <label className="form-field form-field--full">
            <span>素材音频地址</span>
            <input
              value={form.audio}
              onChange={(event) => onChange('audio', event.target.value)}
              placeholder="可直接粘贴音频 URL"
            />
          </label>
          <label className="form-field form-field--full">
            <span>单次释义</span>
            <input
              value={form.translation}
              onChange={(event) => onChange('translation', event.target.value)}
              placeholder="请输入单次释义，例如 [dog]"
            />
          </label>
          <label className="form-field form-field--full">
            <span>多次释义</span>
            <textarea
              className="app-textarea"
              value={form.explainsArray}
              onChange={(event) => onChange('explainsArray', event.target.value)}
              placeholder='请输入多次释义，例如 ["dog","hound"]'
              rows={4}
            />
          </label>
          <div className="form-field form-field--full">
            <span>上传资源</span>
            <div className="upload-grid">
              {[
                { field: 'icon', label: '上传图片', accept: 'image/*' },
                { field: 'audio', label: '上传音频', accept: 'audio/*' },
              ].map((item) => (
                <label key={item.field} className="upload-tile">
                  <span>{item.label}</span>
                  <input
                    type="file"
                    accept={item.accept}
                    disabled={uploadState.uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        onUpload(file, item.field);
                      }
                      event.target.value = '';
                    }}
                  />
                </label>
              ))}
            </div>
            <div className="upload-state">
              {uploadState.uploading ? uploadState.message : uploadState.message || '上传成功后会自动回填 URL'}
            </div>
          </div>
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

function ImportModal({ form, books, submitting, onClose, onChange, onSubmit }) {
  return (
    <AppModal
      title="导入素材"
      description="兼容旧页的目录导入思路，当前提交文件名数组给后端处理。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>教材</span>
            <select
              value={form.textbookId}
              onChange={(event) => onChange('textbookId', event.target.value)}
            >
              <option value="">请选择教材</option>
              {books.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <BatchFilePickerField
            label="单词音频"
            files={form.audioArray}
            suffix=".mp3"
            onChange={(files) => onChange('audioArray', files)}
            emptyText="可多选，提交时仅传文件名"
          />
          <BatchFilePickerField
            label="图片素材"
            files={form.imageArray}
            accept="image/png"
            suffix=".png"
            onChange={(files) => onChange('imageArray', files)}
            emptyText="建议选择 png 文件"
          />
          <BatchFilePickerField
            label="句子音频"
            files={form.sentensArray}
            onChange={(files) => onChange('sentensArray', files)}
            emptyText="会过滤掉隐藏文件"
          />
        </div>
        <ModalActions
          onCancel={onClose}
          submitting={submitting}
          submitText="开始导入"
          submittingText="提交中..."
        />
      </form>
    </AppModal>
  );
}

export function SourceMaterialManagementPage() {
  const [filters, setFilters] = useState({
    startTime: '',
    endTime: '',
    text: '',
    fuzzySearch: true,
  });
  const [query, setQuery] = useState({
    startTime: '',
    endTime: '',
    text: '',
    openLike: '',
    pageNum: 1,
    pageSize: 10,
  });
  const [materials, setMaterials] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importResult, setImportResult] = useState('');
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
    form: materialForm,
    setForm: setMaterialForm,
    updateForm: updateMaterialForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeMaterialModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_MATERIAL_FORM }),
    editState: (item) => ({
      id: String(item.id),
      textbookId: String(item.textbookId || ''),
      text: item.text || '',
      icon: item.icon || '',
      audio: item.audio || '',
      translation: item.translation || '',
      explainsArray: item.explainsArray || '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });
  const {
    isOpen: importOpen,
    form: importForm,
    updateForm: updateImportForm,
    openCreate: openImportModal,
    close: closeImportModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_IMPORT_FORM }),
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / query.pageSize)),
    [totalCount, query.pageSize],
  );

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await listBooks({
          pageNum: 1,
          pageSize: 100,
        });
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        showError(error?.message || '教材列表加载失败');
      }
    }

    loadBooks();
  }, []);

  useEffect(() => {
    async function loadMaterials() {
      setLoading(true);
      try {
        const data = await listSourceMaterials(query);
        setMaterials(Array.isArray(data?.data) ? data.data : []);
        setTotalCount(data?.totalCount || 0);
        setSelectedIds([]);
      } catch (error) {
        showError(error?.message || '素材列表加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadMaterials();
  }, [query.endTime, query.openLike, query.pageNum, query.pageSize, query.startTime, query.text]);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleUpload(file, field) {
    try {
      await upload(file, {
        successMessage: `${file.name} 上传成功`,
        onSuccess: (url) => {
          setMaterialForm((current) => {
            const next = {
              ...current,
              [field]: url,
            };

            if (!next.text.trim()) {
              if (field === 'icon') {
                next.text = getFileBaseName(file.name);
              } else if (field === 'audio' && !current.icon) {
                next.text = getFileBaseName(file.name).replace(/[^a-zA-Z]/g, '').toLowerCase();
              }
            }

            return next;
          });
        },
      });
    } catch {}
  }

  async function reloadCurrentPage() {
    const data = await listSourceMaterials(query);
    setMaterials(Array.isArray(data?.data) ? data.data : []);
    setTotalCount(data?.totalCount || 0);
    setSelectedIds([]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (modalMode === 'create' && !materialForm.textbookId) {
      showError('请选择教材');
      return;
    }

    if (!materialForm.text.trim()) {
      showError('请填写素材内容');
      return;
    }

    const payload = {
      text: materialForm.text.trim(),
      icon: materialForm.icon.trim(),
      audio: materialForm.audio.trim(),
      translation: materialForm.translation.trim(),
      explainsArray: materialForm.explainsArray.trim(),
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createSourceMaterial({
            ...payload,
            textbookId: Number(materialForm.textbookId),
          });
          return;
        }

        await updateSourceMaterial({
          ...payload,
          id: Number(materialForm.id),
        });
      },
      successMessage: modalMode === 'create' ? '素材创建成功' : '素材更新成功',
      errorMessage: '素材提交失败',
      close: closeMaterialModal,
      afterSuccess: reloadCurrentPage,
    });
  }

  async function handleDelete(item) {
    await runAction({
      confirmText: `确认删除素材 ${item.text || item.id} 吗？`,
      action: () => removeSourceMaterial(item.id),
      successMessage: '素材已删除',
      errorMessage: '素材删除失败',
      afterSuccess: async () => {
        const nextPage = materials.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;

        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });

        if (nextPage === query.pageNum) {
          await reloadCurrentPage();
        }
      },
    });
  }

  async function handleBatchDelete() {
    if (!selectedIds.length) {
      return;
    }

    await runAction({
      confirmText: `确认批量删除 ${selectedIds.length} 个素材吗？`,
      action: () => batchRemoveSourceMaterials(selectedIds),
      successMessage: '批量删除成功',
      errorMessage: '批量删除失败',
      afterSuccess: reloadCurrentPage,
    });
  }

  async function handleBatchDownload() {
    if (!selectedIds.length) {
      return;
    }

    await runAction({
      action: () => batchDownloadSourceMaterialAudio(selectedIds),
      successMessage: '批量下载请求已提交',
      errorMessage: '批量下载失败',
    });
  }

  async function handleBatchSync() {
    if (!selectedIds.length) {
      return;
    }

    await runAction({
      action: () => batchSyncSourceMaterials(selectedIds),
      successMessage: '批量同步成功',
      errorMessage: '批量同步失败',
      afterSuccess: reloadCurrentPage,
    });
  }

  async function handleImport(event) {
    event.preventDefault();

    if (!importForm.textbookId) {
      showError('请选择教材');
      return;
    }

    await submitModal({
      action: async () => {
        const result = await importSubjectSources({
          textbookId: Number(importForm.textbookId),
          audioArray: importForm.audioArray,
          imageArray: importForm.imageArray,
          sentensArray: importForm.sentensArray,
        });
        setImportResult(result || '');
      },
      successMessage: '素材导入请求已提交',
      errorMessage: '素材导入失败',
      close: closeImportModal,
    });
  }

  const allChecked = materials.length > 0 && selectedIds.length === materials.length;
  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">素材管理</h2>
          <p className="page-copy">
            这一页对应旧版 `sourceMaterial` 模块，先迁出查询、增改删、批量操作和素材导入能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      {importResult ? (
        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">最近一次导入结果</h3>
              <p className="section-meta">后端返回的是 HTML 文本，这里做只读展示。</p>
            </div>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => setImportResult('')}
            >
              清空
            </button>
          </div>
          <div
            className="html-result-card"
            dangerouslySetInnerHTML={{ __html: importResult }}
          />
        </section>
      ) : null}

      <section className="surface-card">
        <div className="toolbar-grid">
          <label className="form-field">
            <span>开始时间</span>
            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(event) => updateFilter('startTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>结束时间</span>
            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(event) => updateFilter('endTime', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>素材内容</span>
            <input
              value={filters.text}
              onChange={(event) => updateFilter('text', event.target.value)}
              placeholder="请输入素材内容"
            />
          </label>
          <label className="form-field">
            <span>搜索模式</span>
            <select
              value={filters.fuzzySearch ? '1' : '0'}
              onChange={(event) => updateFilter('fuzzySearch', event.target.value === '1')}
            >
              <option value="1">模糊搜索</option>
              <option value="0">精确搜索</option>
            </select>
          </label>
        </div>
        <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
          <div className="section-meta">
            当前共 {totalCount} 条素材，已选 {selectedIds.length} 条
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => {
                startTransition(() => {
                  setQuery({
                    startTime: toApiDateTime(filters.startTime),
                    endTime: toApiDateTime(filters.endTime),
                    text: filters.text.trim(),
                    openLike: filters.fuzzySearch ? '' : 1,
                    pageNum: 1,
                    pageSize: query.pageSize,
                  });
                });
              }}
            >
              搜索
            </button>
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加素材
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={openImportModal}
            >
              导入素材
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              disabled={!selectedIds.length || submitting}
              onClick={handleBatchDelete}
            >
              批量删除
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              disabled={!selectedIds.length || submitting}
              onClick={handleBatchDownload}
            >
              批量下载音频
            </button>
            {!IS_PRODUCTION_API ? (
              <button
                type="button"
                className="app-button app-button--ghost"
                disabled={!selectedIds.length || submitting}
                onClick={handleBatchSync}
              >
                批量同步
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">素材列表</h3>
            <p className="section-meta">支持内容、图标、音频和释义维护</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => reloadCurrentPage()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th className="select-cell">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(event) => {
                      setSelectedIds(event.target.checked ? materials.map((item) => item.id) : []);
                    }}
                  />
                </th>
                <th>素材内容</th>
                <th>素材图标</th>
                <th>素材音频</th>
                <th>单次释义</th>
                <th>多次释义</th>
                <th>创建时间</th>
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
              {!loading && !materials.length ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? materials.map((item) => {
                    const checked = selectedIds.includes(item.id);

                    return (
                      <tr key={item.id}>
                        <td className="select-cell">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setSelectedIds((current) => {
                                if (event.target.checked) {
                                  return [...current, item.id];
                                }

                                return current.filter((selectedId) => selectedId !== item.id);
                              });
                            }}
                          />
                        </td>
                        <td className="table-content-cell">{item.text || '-'}</td>
                        <td>
                          {item.icon ? (
                            <a href={item.icon} target="_blank" rel="noreferrer" className="avatar-link">
                              <img src={item.icon} alt={item.text || 'source'} className="avatar-thumb" />
                            </a>
                          ) : (
                            <span className="table-muted">无</span>
                          )}
                        </td>
                        <td>
                          {item.audio ? (
                            <audio controls src={item.audio} className="subject-audio" />
                          ) : (
                            <span className="table-muted">无</span>
                          )}
                        </td>
                        <td className="table-content-cell">{item.translation || '[]'}</td>
                        <td className="table-content-cell">{item.explainsArray || '[]'}</td>
                        <td>{item.createdAt || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="text-button" onClick={() => openEditModal(item)}>
                              编辑
                            </button>
                            <button
                              type="button"
                              className="text-button text-button--danger"
                              onClick={() => handleDelete(item)}
                              disabled={submitting}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
        <MaterialModal
          mode={modalMode}
          form={materialForm}
          books={books}
          uploadState={uploadState}
          submitting={submitting}
          onClose={closeMaterialModal}
          onChange={updateMaterialForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}

      {importOpen ? (
        <ImportModal
          form={importForm}
          books={books}
          submitting={modalSubmitting}
          onClose={closeImportModal}
          onChange={updateImportForm}
          onSubmit={handleImport}
        />
      ) : null}
    </div>
  );
}
