import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  addSingleSubject,
  createCustomPass,
  listCustomPasses,
  listSubjects,
  removeCustomPass,
  updateCustomPass,
  uploadAsset,
} from '@/app/services/custom-passes';

const EMPTY_PASS_FORM = {
  id: '',
  textbookId: '',
  title: '',
  tmpTitle: '',
  icon: '',
  sort: '',
};

const EMPTY_TOPIC_FORM = {
  customsPassId: '',
  sourceIds: '',
  sort: '',
  showIndex: '',
  icon: '',
  audio: '',
  sceneGraph: '',
  sentenceAudio: '',
  subject: '',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function CustomPassModal({
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
      title={mode === 'create' ? '新增小关卡' : '编辑小关卡'}
      description="维护小关卡标题、过渡标题、图片与教材归属。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>教材 ID</span>
            <input
              value={form.textbookId}
              onChange={(event) => onChange('textbookId', event.target.value)}
              placeholder="请输入教材 ID"
            />
          </label>
          <label className="form-field">
            <span>小关卡 ID</span>
            <input
              value={form.id}
              onChange={(event) => onChange('id', event.target.value)}
              placeholder="请输入小关卡 ID"
              disabled={mode === 'edit'}
            />
          </label>
          <label className="form-field">
            <span>小关卡标题</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="请输入小关卡标题"
            />
          </label>
          <label className="form-field">
            <span>过渡标题</span>
            <input
              value={form.tmpTitle}
              onChange={(event) => onChange('tmpTitle', event.target.value)}
              placeholder="请输入过渡标题"
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
          <FileUploadField
            label="图片地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            placeholder="可直接粘贴图片 URL，或使用下方文件上传"
            uploadHint="支持上传小关卡图片"
            previewAlt="小关卡图片"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

function TopicModal({
  form,
  passList,
  subjects,
  uploadState,
  submitting,
  onClose,
  onChange,
  onUpload,
  onSubmit,
}) {
  return (
    <AppModal
      title="添加题目"
      description="这是旧版 `AddProject` 的轻量迁移版，保留最常用的单题录入能力。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>小关卡</span>
            <select
              value={form.customsPassId}
              onChange={(event) => onChange('customsPassId', event.target.value)}
            >
              <option value="">请选择小关卡</option>
              {passList.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>题型</span>
            <select value={form.subject} onChange={(event) => onChange('subject', event.target.value)}>
              <option value="">请选择题型</option>
              {subjects.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
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
          <label className="form-field">
            <span>挖空规则</span>
            <input
              value={form.showIndex}
              onChange={(event) => onChange('showIndex', event.target.value)}
              placeholder="数字之间用空格分隔"
            />
          </label>
          {[
            { field: 'icon', label: '题目图片', accept: 'image/*' },
            { field: 'audio', label: '题目音频', accept: 'audio/*' },
            { field: 'sentenceAudio', label: '句子音频', accept: 'audio/*' },
            { field: 'sceneGraph', label: '场景图片', accept: 'image/*' },
          ].map((item) => (
            <div className="form-field" key={item.field}>
              <span>{item.label}</span>
              <div className="upload-row">
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
              </div>
            </div>
          ))}
        </div>
        <div className="upload-state">
          {uploadState.uploading ? uploadState.message : uploadState.message || '上传成功后会自动写入对应字段'}
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function CustomPassManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const textbookId = searchParams.get('textbookId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [query, setQuery] = useState({
    textbookId,
    pageNum: 1,
    pageSize: 10,
  });
  const [passList, setPassList] = useState([]);
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
    close: closePassModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_PASS_FORM,
      textbookId,
    }),
    editState: (pass) => ({
      id: String(pass.id),
      textbookId: String(textbookId || ''),
      title: pass.title || '',
      tmpTitle: pass.tmpTitle || '',
      icon: pass.icon || '',
      sort: pass.sort !== undefined && pass.sort !== null ? String(pass.sort) : '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });
  const {
    isOpen: topicOpen,
    form: topicForm,
    updateForm: updateTopicForm,
    openCreate: openTopicModal,
    close: closeTopicModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_TOPIC_FORM,
      customsPassId: '',
      subject: '',
    }),
    onOpenCreate: () => resetUploadState(),
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / query.pageSize)),
    [totalCount, query.pageSize],
  );

  async function loadPassList(nextQuery = query) {
    setLoading(true);
    try {
      const data = await listCustomPasses(nextQuery);
      setPassList(Array.isArray(data?.data) ? data.data : []);
      setTotalCount(data?.totalCount || 0);
    } catch (error) {
      showError(error?.message || '小关卡列表加载失败');
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
    loadPassList(query);
  }, [query.pageNum, query.pageSize, query.textbookId]);

  useEffect(() => {
    if (partsId) {
      loadSubjects();
    }
  }, [partsId]);

  async function handleUpload(file, field = 'icon') {
    try {
      await upload(file, {
        successMessage: '上传成功',
        onSuccess: (url) => {
          if (topicOpen) {
            updateTopicForm(field, url);
            return;
          }

          updatePassForm('icon', url);
        },
      });
    } catch {}
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!passForm.textbookId || !passForm.id || !passForm.title.trim() || !passForm.tmpTitle.trim()) {
      showError('请填写教材 ID、小关卡 ID、标题和过渡标题');
      return;
    }

    if (!/^\d+$/.test(passForm.textbookId) || !/^\d+$/.test(passForm.id)) {
      showError('教材 ID 和小关卡 ID 必须为数字');
      return;
    }

    await submitModal({
      action: async () => {
        const payload = {
          textbookId: Number(passForm.textbookId),
          id: Number(passForm.id),
          title: passForm.title.trim(),
          tmpTitle: passForm.tmpTitle.trim(),
          icon: passForm.icon.trim(),
          sort: passForm.sort ? Number(passForm.sort) : undefined,
        };

        if (modalMode === 'create') {
          await createCustomPass(payload);
          return;
        }

        await updateCustomPass(payload);
      },
      successMessage: modalMode === 'create' ? '小关卡创建成功' : '小关卡更新成功',
      errorMessage: '小关卡提交失败',
      close: closePassModal,
      afterSuccess: () => loadPassList(),
    });
  }

  async function handleDelete(pass) {
    await runAction({
      confirmText: `确认删除小关卡 ${pass.title || pass.id} 吗？`,
      action: () =>
        removeCustomPass({
          id: pass.id,
          textbookId,
        }),
      successMessage: '小关卡已删除',
      errorMessage: '小关卡删除失败',
      afterSuccess: async () => {
        const nextPage = passList.length === 1 && query.pageNum > 1 ? query.pageNum - 1 : query.pageNum;
        startTransition(() => {
          setQuery((current) => ({
            ...current,
            pageNum: nextPage,
          }));
        });
        if (nextPage === query.pageNum) {
          await loadPassList();
        }
      },
    });
  }

  async function handleTopicSubmit(event) {
    event.preventDefault();

    if (!topicForm.customsPassId || !topicForm.sourceIds.trim()) {
      showError('请先选择小关卡并填写题目内容');
      return;
    }

    if (topicForm.sort && !/^\d+$/.test(topicForm.sort)) {
      showError('题目顺序必须为数字');
      return;
    }

    await submitModal({
      action: () =>
        addSingleSubject({
          customsPassId: Number(topicForm.customsPassId),
          partId: partsId ? Number(partsId) : undefined,
          sessionId: sessionId ? Number(sessionId) : undefined,
          sourceIds: topicForm.sourceIds.trim(),
          sort: topicForm.sort ? Number(topicForm.sort) : undefined,
          showIndex: topicForm.showIndex ? topicForm.showIndex.split(/\s+/g) : undefined,
          icon: topicForm.icon,
          audio: topicForm.audio,
          sentenceAudio: topicForm.sentenceAudio,
          sceneGraph: topicForm.sceneGraph,
          subject: topicForm.subject ? Number(topicForm.subject) : undefined,
        }),
      successMessage: '题目添加成功',
      errorMessage: '题目添加失败',
      close: closeTopicModal,
    });
  }

  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">小关卡管理</h2>
          <p className="page-copy">
            这一页对应旧版 customPass 管理模块，保留小关卡维护，并在 `partsId` 存在时保留单题录入入口。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--compact">
          <div className="section-meta">
            当前教材 ID: {textbookId || '-'}，大关卡 ID: {sessionId || '-'}，Part ID: {partsId || '-'}
          </div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加小关卡
            </button>
            {partsId ? (
              <button type="button" className="app-button app-button--ghost" onClick={openTopicModal}>
                添加题目
              </button>
            ) : null}
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => navigate(partsId ? `/parts?textBookId=${textbookId}&unitId=` : '/passes')}
            >
              返回上一层
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">小关卡列表</h3>
            <p className="section-meta">共 {totalCount} 条记录</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadPassList()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>小关卡 ID</th>
                <th>标题</th>
                <th>过渡标题</th>
                <th>图片</th>
                <th>排序</th>
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
              {!loading && !passList.length ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? passList.map((pass) => (
                    <tr key={pass.id}>
                      <td>{pass.id}</td>
                      <td>{pass.title || '-'}</td>
                      <td>{pass.tmpTitle || '-'}</td>
                      <td>
                        {pass.icon ? (
                          <a href={pass.icon} target="_blank" rel="noreferrer" className="avatar-link">
                            <img src={pass.icon} alt={pass.title || 'custom pass'} className="avatar-thumb" />
                          </a>
                        ) : (
                          <span className="table-muted">无</span>
                        )}
                      </td>
                      <td>{pass.sort ?? '-'}</td>
                      <td>{pass.createdAt || '-'}</td>
                      <td>
                        <div className="table-actions">
                          {pass.id ? (
                            <Link
                              to={`/subjects?customsPassId=${pass.id}&partsId=${partsId}&sessionId=${sessionId}`}
                              className="text-button"
                            >
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
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDelete(pass)}
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
        <CustomPassModal
          mode={modalMode}
          form={passForm}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closePassModal}
          onChange={updatePassForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}

      {topicOpen ? (
        <TopicModal
          form={topicForm}
          passList={passList}
          subjects={subjects}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeTopicModal}
          onChange={updateTopicForm}
          onUpload={handleUpload}
          onSubmit={handleTopicSubmit}
        />
      ) : null}
    </div>
  );
}
