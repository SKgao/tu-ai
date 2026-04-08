import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import {
  addSingleSubject,
  batchRemoveSubjectRecords,
  createSubjectScenePic,
  getSubjectRecordDetail,
  listSubjectRecords,
  listSubjects,
  removeSubjectRecord,
  removeSubjectScenePic,
  updateSubjectRecord,
  updateSubjectScenePic,
  uploadAsset,
} from '@/app/services/subjects';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';

const EMPTY_SUBJECT_FORM = {
  id: '',
  customsPassId: '',
  customsPassName: '',
  sourceIds: '',
  sort: '',
  showIndex: '',
  subject: '',
  icon: '',
  audio: '',
  sentenceAudio: '',
  sceneGraph: '',
  originalSceneGraph: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function toApiDateTime(value) {
  return value ? `${value.replace('T', ' ')}:00` : '';
}

function isScenePassId(value) {
  return String(value) === '2' || String(value) === '8';
}

function buildSearch(searchParams, updates = {}, removals = []) {
  const nextSearch = new URLSearchParams(searchParams);

  removals.forEach((key) => nextSearch.delete(key));

  Object.entries(updates).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      nextSearch.delete(key);
      return;
    }

    nextSearch.set(key, String(value));
  });

  const result = nextSearch.toString();
  return result ? `?${result}` : '';
}

function SubjectModal({
  mode,
  form,
  subjectTypes,
  lockedCustomsPassId,
  uploadState,
  submitting,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}) {
  const enableSceneField = isScenePassId(form.customsPassId);

  return (
    <AppModal
      title={mode === 'create' ? '新增题目' : '编辑题目'}
      description={
        mode === 'create' ? '保留新架构下最常用的单题录入能力。' : '维护题目内容、顺序、关卡名和场景图。'
      }
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>关卡 ID</span>
            <input
              value={form.customsPassId}
              onChange={(event) => onChange('customsPassId', event.target.value)}
              placeholder="请输入关卡 ID"
              disabled={Boolean(lockedCustomsPassId) || mode === 'edit'}
            />
          </label>

          {mode === 'create' ? (
            <label className="form-field">
              <span>题型</span>
              <select value={form.subject} onChange={(event) => onChange('subject', event.target.value)}>
                <option value="">可选</option>
                {subjectTypes.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="form-field">
              <span>关卡名称</span>
              <input
                value={form.customsPassName}
                onChange={(event) => onChange('customsPassName', event.target.value)}
                placeholder="请输入关卡名称"
              />
            </label>
          )}

          <label className="form-field form-field--full">
            <span>题目内容</span>
            <input
              value={form.sourceIds}
              onChange={(event) => onChange('sourceIds', event.target.value)}
              placeholder="请输入题目内容"
            />
          </label>

          <label className="form-field">
            <span>题目顺序</span>
            <input
              value={form.sort}
              onChange={(event) => onChange('sort', event.target.value)}
              placeholder="请输入题目顺序"
            />
          </label>

          {mode === 'create' ? (
            <label className="form-field">
              <span>挖空规则</span>
              <input
                value={form.showIndex}
                onChange={(event) => onChange('showIndex', event.target.value)}
                placeholder="数字之间用空格分隔"
              />
            </label>
          ) : null}

          {mode === 'create' ? (
            <>
              <label className="form-field form-field--full">
                <span>题目图片地址</span>
                <input
                  value={form.icon}
                  onChange={(event) => onChange('icon', event.target.value)}
                  placeholder="可直接粘贴图片 URL"
                />
              </label>
              <label className="form-field form-field--full">
                <span>题目音频地址</span>
                <input
                  value={form.audio}
                  onChange={(event) => onChange('audio', event.target.value)}
                  placeholder="可直接粘贴音频 URL"
                />
              </label>
              <label className="form-field form-field--full">
                <span>句子音频地址</span>
                <input
                  value={form.sentenceAudio}
                  onChange={(event) => onChange('sentenceAudio', event.target.value)}
                  placeholder="可直接粘贴句子音频 URL"
                />
              </label>
            </>
          ) : null}

          {enableSceneField ? (
            <label className="form-field form-field--full">
              <span>场景图地址</span>
              <input
                value={form.sceneGraph}
                onChange={(event) => onChange('sceneGraph', event.target.value)}
                placeholder="可直接粘贴场景图 URL"
              />
            </label>
          ) : null}

          <div className="form-field form-field--full">
            <span>上传资源</span>
            <div className="upload-grid">
              {mode === 'create'
                ? [
                    { field: 'icon', label: '题目图片', accept: 'image/*' },
                    { field: 'audio', label: '题目音频', accept: 'audio/*' },
                    { field: 'sentenceAudio', label: '句子音频', accept: 'audio/*' },
                    ...(enableSceneField ? [{ field: 'sceneGraph', label: '场景图', accept: 'image/*' }] : []),
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
                  ))
                : enableSceneField ? (
                    <label className="upload-tile">
                      <span>上传场景图</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadState.uploading}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            onUpload(file, 'sceneGraph');
                          }
                          event.target.value = '';
                        }}
                      />
                    </label>
                  ) : (
                    <span className="table-muted">当前题目无需上传额外资源</span>
                  )}
            </div>
            <div className="upload-state">
              {uploadState.uploading
                ? `${uploadState.message || '文件上传中...'}`
                : uploadState.message || '上传成功后会自动写入对应字段'}
            </div>
          </div>
        </div>

        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function SubjectsManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeCustomsPassId = searchParams.get('customsPassId') || '';
  const partsId = searchParams.get('partsId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const textbookId =
    searchParams.get('textBookId') || searchParams.get('textbookId') || '';
  const topicId = searchParams.get('topicId') || '';
  const isDetailMode = searchParams.get('detpage') === '1' || Boolean(topicId);

  const [filters, setFilters] = useState({
    startTime: '',
    endTime: '',
    customsPassId: routeCustomsPassId,
    customsPassName: '',
    sourceIds: '',
  });
  const [query, setQuery] = useState({
    startTime: '',
    endTime: '',
    customsPassId: routeCustomsPassId,
    customsPassName: '',
    sourceIds: '',
    pageNum: 1,
    pageSize: 10,
  });
  const [records, setRecords] = useState([]);
  const [detailRecord, setDetailRecord] = useState(null);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
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
    form: subjectForm,
    updateForm: updateSubjectForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_SUBJECT_FORM,
      customsPassId: routeCustomsPassId,
    }),
    editState: (record) => ({
      ...EMPTY_SUBJECT_FORM,
      id: String(record.id),
      customsPassId: String(record.customsPassId || routeCustomsPassId || ''),
      customsPassName: record.customsPassName || '',
      sourceIds: record.sourceIds || '',
      sort: record.sort !== undefined && record.sort !== null ? String(record.sort) : '',
      sceneGraph:
        record.sceneGraph && record.sceneGraph !== 'null' ? String(record.sceneGraph) : '',
      originalSceneGraph:
        record.sceneGraph && record.sceneGraph !== 'null' ? String(record.sceneGraph) : '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / query.pageSize)),
    [totalCount, query.pageSize],
  );

  const enableSceneColumn = useMemo(() => {
    if (isScenePassId(routeCustomsPassId)) {
      return true;
    }

    if (isScenePassId(subjectForm.customsPassId)) {
      return true;
    }

    if (isScenePassId(detailRecord?.customsPassId)) {
      return true;
    }

    return records.some((item) => isScenePassId(item.customsPassId));
  }, [detailRecord?.customsPassId, records, routeCustomsPassId, subjectForm.customsPassId]);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      customsPassId: routeCustomsPassId,
    }));
    setQuery((current) => ({
      ...current,
      customsPassId: routeCustomsPassId,
      pageNum: 1,
    }));
    setSelectedIds([]);
  }, [routeCustomsPassId]);

  useEffect(() => {
    async function loadSubjectTypes() {
      try {
        const data = await listSubjects();
        setSubjectTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        showError(error?.message || '题型列表加载失败');
      }
    }

    loadSubjectTypes();
  }, []);

  useEffect(() => {
    if (isDetailMode) {
      return;
    }

    async function loadRecords() {
      setLoading(true);
      try {
        const data = await listSubjectRecords(query);
        setRecords(Array.isArray(data?.data) ? data.data : []);
        setTotalCount(data?.totalCount || 0);
        setSelectedIds([]);
      } catch (error) {
        showError(error?.message || '题目列表加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [
    isDetailMode,
    query.customsPassId,
    query.customsPassName,
    query.endTime,
    query.pageNum,
    query.pageSize,
    query.sourceIds,
    query.startTime,
  ]);

  useEffect(() => {
    if (!isDetailMode || !topicId) {
      setDetailRecord(null);
      return;
    }

    async function loadDetail() {
      setLoading(true);
      try {
        const data = await getSubjectRecordDetail(topicId);
        setDetailRecord(data);
      } catch (error) {
        showError(error?.message || '题目详情加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [isDetailMode, topicId]);

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
          updateSubjectForm(field, url);
        },
      });
    } catch {}
  }

  async function reloadCurrentPage() {
    if (isDetailMode && topicId) {
      const data = await getSubjectRecordDetail(topicId);
      setDetailRecord(data);
      return;
    }

    const data = await listSubjectRecords(query);
    setRecords(Array.isArray(data?.data) ? data.data : []);
    setTotalCount(data?.totalCount || 0);
    setSelectedIds([]);
  }

  async function syncSceneGraph(subjectId, nextSceneGraph, previousSceneGraph) {
    const current = previousSceneGraph && previousSceneGraph !== 'null' ? previousSceneGraph : '';
    const next = nextSceneGraph && nextSceneGraph !== 'null' ? nextSceneGraph : '';

    if (current === next) {
      return;
    }

    if (!next && current) {
      await removeSubjectScenePic(subjectId);
      return;
    }

    if (!next) {
      return;
    }

    if (current) {
      await updateSubjectScenePic({ id: subjectId, scenePic: next });
      return;
    }

    await createSubjectScenePic({ id: subjectId, scenePic: next });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!subjectForm.customsPassId || !subjectForm.sourceIds.trim()) {
      showError('请填写关卡 ID 和题目内容');
      return;
    }

    if (!/^\d+$/.test(subjectForm.customsPassId)) {
      showError('关卡 ID 必须为数字');
      return;
    }

    if (subjectForm.sort && !/^\d+$/.test(subjectForm.sort)) {
      showError('题目顺序必须为数字');
      return;
    }

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await addSingleSubject({
            customsPassId: Number(subjectForm.customsPassId),
            partId: partsId ? Number(partsId) : undefined,
            sessionId: sessionId ? Number(sessionId) : undefined,
            sourceIds: subjectForm.sourceIds.trim(),
            sort: subjectForm.sort ? Number(subjectForm.sort) : undefined,
            showIndex: subjectForm.showIndex ? subjectForm.showIndex.trim().split(/\s+/g) : undefined,
            subject: subjectForm.subject ? Number(subjectForm.subject) : undefined,
            icon: subjectForm.icon.trim(),
            audio: subjectForm.audio.trim(),
            sentenceAudio: subjectForm.sentenceAudio.trim(),
            sceneGraph: subjectForm.sceneGraph.trim(),
          });
          return;
        }

        await updateSubjectRecord({
          id: Number(subjectForm.id),
          customsPassId: Number(subjectForm.customsPassId),
          customsPassName: subjectForm.customsPassName.trim(),
          sourceIds: subjectForm.sourceIds.trim(),
          sort: subjectForm.sort ? Number(subjectForm.sort) : undefined,
        });

        if (isScenePassId(subjectForm.customsPassId)) {
          await syncSceneGraph(
            Number(subjectForm.id),
            subjectForm.sceneGraph.trim(),
            subjectForm.originalSceneGraph,
          );
        }
      },
      successMessage: modalMode === 'create' ? '题目创建成功' : '题目更新成功',
      errorMessage: '题目提交失败',
      close: closeModal,
      afterSuccess: reloadCurrentPage,
    });
  }

  async function handleDelete(record) {
    await runAction({
      confirmText: `确认删除题目 ${record.sourceIds || record.id} 吗？`,
      action: () => removeSubjectRecord(record.id),
      successMessage: '题目已删除',
      errorMessage: '题目删除失败',
      afterSuccess: async () => {
        if (isDetailMode) {
          navigate(`/subjects${buildSearch(searchParams, {}, ['topicId', 'detpage'])}`, {
            replace: true,
          });
          return;
        }

        const nextPage = records.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;

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
      confirmText: `确认批量删除 ${selectedIds.length} 个题目吗？`,
      action: () => batchRemoveSubjectRecords(selectedIds),
      successMessage: '批量删除成功',
      errorMessage: '批量删除失败',
      afterSuccess: reloadCurrentPage,
    });
  }

  const allChecked = records.length > 0 && selectedIds.length === records.length;
  const detailResources = Array.isArray(detailRecord?.sourceVOS) ? detailRecord.sourceVOS : [];
  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">{isDetailMode ? '题目详情' : '题目管理'}</h2>
          <p className="page-copy">
            {isDetailMode
              ? '这一页对应旧版题目详情视图，保留资源预览、编辑和删除能力。'
              : '这一页对应旧版 subjects 模块，先迁出常用的查询、单题录入、增改删和场景图能力。'}
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      {!isDetailMode ? (
        <>
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
                <span>关卡名称</span>
                <input
                  value={filters.customsPassName}
                  onChange={(event) => updateFilter('customsPassName', event.target.value)}
                  placeholder="请输入关卡名称"
                />
              </label>
              <label className="form-field">
                <span>题目内容</span>
                <input
                  value={filters.sourceIds}
                  onChange={(event) => updateFilter('sourceIds', event.target.value)}
                  placeholder="请输入题目内容"
                />
              </label>
            </div>
            <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
              <div className="section-meta">
                当前关卡 ID: {filters.customsPassId || '-'}，教材 ID: {textbookId || '-'}，Part ID:{' '}
                {partsId || '-'}，大关卡 ID: {sessionId || '-'}
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
                        customsPassId: filters.customsPassId.trim(),
                        customsPassName: filters.customsPassName.trim(),
                        sourceIds: filters.sourceIds.trim(),
                        pageNum: 1,
                        pageSize: query.pageSize,
                      });
                    });
                  }}
                >
                  搜索
                </button>
                <button
                  type="button"
                  className="app-button app-button--primary"
                  onClick={openCreateModal}
                >
                  添加题目
                </button>
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={handleBatchDelete}
                  disabled={!selectedIds.length || submitting}
                >
                  批量删除
                </button>
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={() => navigate(-1)}
                >
                  返回上一层
                </button>
              </div>
            </div>
          </section>

          <section className="surface-card surface-card--table">
            <div className="section-header">
              <div>
                <h3 className="section-title">题目列表</h3>
                <p className="section-meta">共 {totalCount} 条记录，已选 {selectedIds.length} 条</p>
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
                          setSelectedIds(event.target.checked ? records.map((item) => item.id) : []);
                        }}
                      />
                    </th>
                    <th>单元名称</th>
                    <th>Part 描述</th>
                    <th>Part 标题</th>
                    <th>关卡名称</th>
                    <th>题目内容</th>
                    <th>题目顺序</th>
                    {enableSceneColumn ? <th>场景图</th> : null}
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={enableSceneColumn ? '9' : '8'} className="table-empty">
                        数据加载中...
                      </td>
                    </tr>
                  ) : null}
                  {!loading && !records.length ? (
                    <tr>
                      <td colSpan={enableSceneColumn ? '9' : '8'} className="table-empty">
                        暂无数据
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? records.map((record) => {
                        const checked = selectedIds.includes(record.id);

                        return (
                          <tr key={record.id}>
                            <td className="select-cell">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => {
                                  setSelectedIds((current) => {
                                    if (event.target.checked) {
                                      return [...current, record.id];
                                    }

                                    return current.filter((item) => item !== record.id);
                                  });
                                }}
                              />
                            </td>
                            <td>{record.unitsName || '-'}</td>
                            <td>{record.partsTips || '-'}</td>
                            <td>{record.partsTitle || '-'}</td>
                            <td>{record.customsPassName || '-'}</td>
                            <td className="table-content-cell">{record.sourceIds || '-'}</td>
                            <td>{record.sort ?? '-'}</td>
                            {enableSceneColumn ? (
                              <td>
                                {record.sceneGraph && record.sceneGraph !== 'null' ? (
                                  <a
                                    href={record.sceneGraph}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="avatar-link"
                                  >
                                    <img
                                      src={record.sceneGraph}
                                      alt={record.customsPassName || 'scene'}
                                      className="avatar-thumb"
                                    />
                                  </a>
                                ) : (
                                  <span className="table-muted">无</span>
                                )}
                              </td>
                            ) : null}
                            <td>
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() => openEditModal(record)}
                                >
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    navigate(
                                      `/subjects${buildSearch(searchParams, {
                                        topicId: record.id,
                                        detpage: 1,
                                      })}`,
                                    )
                                  }
                                >
                                  查看详情
                                </button>
                                <button
                                  type="button"
                                  className="text-button text-button--danger"
                                  onClick={() => handleDelete(record)}
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
        </>
      ) : (
        <section className="surface-card">
          <div className="section-header">
            <div>
              <h3 className="section-title">题目详情</h3>
              <p className="section-meta">Topic ID: {detailRecord?.id || topicId || '-'}</p>
            </div>
            <div className="toolbar-actions">
              <button
                type="button"
                className="app-button app-button--ghost"
                onClick={() =>
                  navigate(`/subjects${buildSearch(searchParams, {}, ['topicId', 'detpage'])}`)
                }
              >
                返回列表
              </button>
              {detailRecord ? (
                <button
                  type="button"
                  className="app-button app-button--primary"
                  onClick={() => openEditModal(detailRecord)}
                >
                  编辑题目
                </button>
              ) : null}
            </div>
          </div>

          {loading ? <div className="table-empty">数据加载中...</div> : null}

          {!loading && !detailRecord ? <div className="table-empty">未找到题目详情</div> : null}

          {!loading && detailRecord ? (
            <div className="subject-detail">
              <div className="subject-detail__meta">
                <article className="subject-meta-card">
                  <span className="subject-meta-card__label">关卡 ID</span>
                  <strong>{detailRecord.customsPassId ?? '-'}</strong>
                </article>
                <article className="subject-meta-card">
                  <span className="subject-meta-card__label">关卡名称</span>
                  <strong>{detailRecord.customsPassName || '-'}</strong>
                </article>
                <article className="subject-meta-card">
                  <span className="subject-meta-card__label">题目顺序</span>
                  <strong>{detailRecord.sort ?? '-'}</strong>
                </article>
                <article className="subject-meta-card">
                  <span className="subject-meta-card__label">创建时间</span>
                  <strong>{detailRecord.createdAt || '-'}</strong>
                </article>
              </div>

              <div className="subject-detail__content">
                <div>
                  <h4 className="section-title">题目内容</h4>
                  <p className="subject-content-block">{detailRecord.sourceIds || '-'}</p>
                </div>
                {detailRecord.sceneGraph && detailRecord.sceneGraph !== 'null' ? (
                  <div>
                    <h4 className="section-title">场景图</h4>
                    <a href={detailRecord.sceneGraph} target="_blank" rel="noreferrer" className="avatar-link">
                      <img
                        src={detailRecord.sceneGraph}
                        alt={detailRecord.customsPassName || 'scene'}
                        className="subject-scene-image"
                      />
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="toolbar-actions">
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={() => reloadCurrentPage()}
                >
                  刷新详情
                </button>
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={() => openEditModal(detailRecord)}
                >
                  编辑
                </button>
                <button
                  type="button"
                  className="app-button app-button--ghost text-button--danger"
                  onClick={() => handleDelete(detailRecord)}
                  disabled={submitting}
                >
                  删除
                </button>
              </div>

              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>资源文本</th>
                      <th>图片</th>
                      <th>音频</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!detailResources.length ? (
                      <tr>
                        <td colSpan="3" className="table-empty">
                          暂无资源明细
                        </td>
                      </tr>
                    ) : null}
                    {detailResources.map((resource, index) => (
                      <tr key={`${resource.id || resource.text || 'resource'}-${index}`}>
                        <td className="table-content-cell">{resource.text || '-'}</td>
                        <td>
                          {resource.icon ? (
                            <a href={resource.icon} target="_blank" rel="noreferrer" className="avatar-link">
                              <img
                                src={resource.icon}
                                alt={resource.text || 'resource'}
                                className="avatar-thumb"
                              />
                            </a>
                          ) : (
                            <span className="table-muted">无</span>
                          )}
                        </td>
                        <td>
                          {resource.audio ? (
                            <audio controls src={resource.audio} className="subject-audio" />
                          ) : (
                            <span className="table-muted">无</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      )}

      {modalOpen ? (
        <SubjectModal
          mode={modalMode}
          form={subjectForm}
          subjectTypes={subjectTypes}
          lockedCustomsPassId={routeCustomsPassId}
          uploadState={uploadState}
          submitting={submitting}
          onClose={closeModal}
          onChange={updateSubjectForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}
    </div>
  );
}
