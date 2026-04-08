import React, { useEffect, useState } from 'react';
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
  bindCustomPassToSession,
  changeSessionCustomSort,
  changeSessionStatus,
  createSession,
  listCustomPasses,
  listSessionCustomPasses,
  listSessions,
  removeSession,
  unbindSessionCustomPass,
  updateSession,
  uploadAsset,
} from '@/app/services/sessions';

const EMPTY_SESSION_FORM = {
  id: '',
  textbookId: '',
  title: '',
  icon: '',
  sort: '',
};

function SessionModal({
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
      title={mode === 'create' ? '新增大关卡' : '编辑大关卡'}
      description="维护大关卡的教材归属、标题、图片与顺序。"
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
            <span>大关卡 ID</span>
            <input
              value={form.id}
              onChange={(event) => onChange('id', event.target.value)}
              placeholder="请输入大关卡 ID"
              disabled={mode === 'edit'}
            />
          </label>
          <label className="form-field">
            <span>大关卡标题</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="请输入大关卡标题"
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
            uploadHint="支持上传大关卡图片"
            previewAlt="大关卡图片"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

function BoundCustomPassModal({
  sessionTitle,
  customPasses,
  submitting,
  onClose,
  onUnbind,
  onSortChange,
}) {
  return (
    <AppModal
      title={sessionTitle ? `${sessionTitle} 已绑定小关卡` : '已绑定小关卡'}
      description="这里保留旧版“查看已绑定小关卡”的能力，并支持解绑与排序。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <div className="modal-form">
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>小关卡标题</th>
                <th>图片</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {!customPasses.length ? (
                <tr>
                  <td colSpan="4" className="table-empty">
                    暂无已绑定小关卡
                  </td>
                </tr>
              ) : (
                customPasses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.customTitle || item.title || '-'}</td>
                    <td>
                      {item.icon ? (
                        <a href={item.icon} target="_blank" rel="noreferrer" className="avatar-link">
                          <img src={item.icon} alt={item.customTitle || 'custom pass'} className="avatar-thumb" />
                        </a>
                      ) : (
                        <span className="table-muted">无</span>
                      )}
                    </td>
                    <td>
                      <input
                        className="table-input"
                        defaultValue={item.sort ?? ''}
                        onBlur={(event) => onSortChange(item, event.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-button text-button--danger"
                        onClick={() => onUnbind(item)}
                        disabled={submitting}
                      >
                        解绑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppModal>
  );
}

export function SessionManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const textbookId = searchParams.get('textbookId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [filterTextbookId, setFilterTextbookId] = useState(textbookId);
  const [sessions, setSessions] = useState([]);
  const [availableCustomPasses, setAvailableCustomPasses] = useState([]);
  const [boundCustomPasses, setBoundCustomPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boundModalOpen, setBoundModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState({ id: '', title: '' });
  const [selectedBindTarget, setSelectedBindTarget] = useState('');
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
    form: sessionForm,
    updateForm: updateSessionForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeSessionModal,
  } = useModalState({
    createState: () => ({
      ...EMPTY_SESSION_FORM,
      textbookId: filterTextbookId,
    }),
    editState: (session) => ({
      id: String(session.id),
      textbookId: String(filterTextbookId || ''),
      title: session.title || '',
      icon: session.icon || '',
      sort: session.sort !== undefined && session.sort !== null ? String(session.sort) : '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });

  async function loadSessions(currentTextbookId = filterTextbookId) {
    if (!currentTextbookId) {
      setSessions([]);
      setAvailableCustomPasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sessionData, customPassData] = await Promise.all([
        listSessions(Number(currentTextbookId)),
        listCustomPasses({
          textbookId: Number(currentTextbookId),
          pageNum: 1,
          pageSize: 1000,
        }),
      ]);
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setAvailableCustomPasses(Array.isArray(customPassData?.data) ? customPassData.data : []);
    } catch (error) {
      showError(error?.message || '大关卡列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, [filterTextbookId]);

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功',
        onSuccess: (url) => {
          updateSessionForm('icon', url);
        },
      });
    } catch {}
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!sessionForm.textbookId || !sessionForm.id || !sessionForm.title.trim()) {
      showError('请填写教材 ID、大关卡 ID 和标题');
      return;
    }

    if (!/^\d+$/.test(sessionForm.textbookId) || !/^\d+$/.test(sessionForm.id)) {
      showError('教材 ID 和大关卡 ID 必须为数字');
      return;
    }

    await submitModal({
      action: async () => {
        const payload = {
          textbookId: Number(sessionForm.textbookId),
          id: Number(sessionForm.id),
          title: sessionForm.title.trim(),
          icon: sessionForm.icon.trim(),
          sort: sessionForm.sort ? Number(sessionForm.sort) : undefined,
        };

        if (modalMode === 'create') {
          await createSession(payload);
          return;
        }

        await updateSession(payload);
      },
      successMessage: modalMode === 'create' ? '大关卡创建成功' : '大关卡更新成功',
      errorMessage: '大关卡提交失败',
      close: closeSessionModal,
      afterSuccess: () => loadSessions(),
    });
  }

  async function handleDelete(session) {
    await runAction({
      confirmText: `确认删除大关卡 ${session.title || session.id} 吗？`,
      action: () => removeSession(session.id),
      successMessage: '大关卡已删除',
      errorMessage: '大关卡删除失败',
      afterSuccess: () => loadSessions(),
    });
  }

  async function handleToggleStatus(session) {
    await runAction({
      action: () =>
        changeSessionStatus({
          id: Number(session.id),
          status: session.status === 1 ? 2 : 1,
        }),
      successMessage: session.status === 1 ? '大关卡已禁用' : '大关卡已启用',
      errorMessage: '大关卡状态更新失败',
      afterSuccess: () => loadSessions(),
    });
  }

  async function openBoundModal(session) {
    setSelectedSession({
      id: session.id,
      title: session.title,
    });
    setBoundModalOpen(true);

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(session.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '已绑定小关卡加载失败');
      setBoundCustomPasses([]);
    }
  }

  async function reloadBoundModal() {
    if (!selectedSession.id) {
      return;
    }

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(selectedSession.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '已绑定小关卡加载失败');
      setBoundCustomPasses([]);
    }
  }

  async function handleBindCustomPass(session) {
    if (!selectedBindTarget) {
      showError('请先选择要绑定的小关卡');
      return;
    }

    await runAction({
      action: () =>
        bindCustomPassToSession({
          textbookId: Number(filterTextbookId),
          sessionId: Number(session.id),
          customPassId: Number(selectedBindTarget),
        }),
      successMessage: '小关卡绑定成功',
      errorMessage: '小关卡绑定失败',
      afterSuccess: async () => {
        setSelectedBindTarget('');
        await loadSessions();
      },
    });
  }

  async function handleUnbind(item) {
    await runAction({
      confirmText: `确认解绑小关卡 ${item.customTitle || item.title || item.id} 吗？`,
      action: () => unbindSessionCustomPass(item.id),
      successMessage: '小关卡已解绑',
      errorMessage: '解绑失败',
      afterSuccess: async () => {
        await Promise.all([loadSessions(), reloadBoundModal()]);
      },
    });
  }

  async function handleBoundSortChange(item, value) {
    if (!value || !/^\d+$/.test(value)) {
      return;
    }

    await runAction({
      action: () =>
        changeSessionCustomSort({
          id: Number(item.id),
          sort: Number(value),
        }),
      successMessage: '小关卡排序已更新',
      errorMessage: '排序更新失败',
      afterSuccess: reloadBoundModal,
    });
  }

  const submitting = modalSubmitting || actionSubmitting;

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">大关卡管理</h2>
          <p className="page-copy">
            这一页对应旧版 session 管理模块，保留大关卡维护、状态切换，以及与小关卡的绑定关系。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--compact">
          <label className="form-field">
            <span>教材 ID</span>
            <input
              value={filterTextbookId}
              onChange={(event) => setFilterTextbookId(event.target.value)}
              placeholder="输入教材 ID"
            />
          </label>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加大关卡
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={() => navigate('/books')}>
              返回教材
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card surface-card--table">
        <div className="section-header">
          <div>
            <h3 className="section-title">大关卡列表</h3>
            <p className="section-meta">当前教材 ID: {filterTextbookId || '-'}，共 {sessions.length} 条记录</p>
          </div>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadSessions()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>图标</th>
                <th>状态</th>
                <th>顺序</th>
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
              {!loading && !sessions.length ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.id}</td>
                      <td>{session.title || '-'}</td>
                      <td>
                        {session.icon ? (
                          <a href={session.icon} target="_blank" rel="noreferrer" className="avatar-link">
                            <img src={session.icon} alt={session.title || 'session'} className="avatar-thumb" />
                          </a>
                        ) : (
                          <span className="table-muted">无</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            session.status === 1 ? 'status-pill status-pill--success' : 'status-pill status-pill--warning'
                          }
                        >
                          {session.status === 1 ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td>{session.sort ?? '-'}</td>
                      <td>
                        <div className="table-actions">
                          <select
                            value={selectedSession.id === session.id ? selectedBindTarget : ''}
                            onChange={(event) => {
                              setSelectedSession({ id: session.id, title: session.title });
                              setSelectedBindTarget(event.target.value);
                            }}
                          >
                            <option value="">绑定小关卡</option>
                            {availableCustomPasses.map((item) => (
                              <option key={item.id} value={String(item.id)}>
                                {item.title}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => handleBindCustomPass(session)}
                            disabled={submitting}
                          >
                            绑定
                          </button>
                          <button type="button" className="text-button" onClick={() => openBoundModal(session)}>
                            已绑定小关卡
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          {partsId ? (
                            <Link
                              to={`/custom-passes?textbookId=${filterTextbookId}&sessionId=${session.id}&partsId=${partsId}`}
                              className="text-button"
                            >
                              查看小关卡
                            </Link>
                          ) : null}
                          <button type="button" className="text-button" onClick={() => openEditModal(session)}>
                            编辑
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => handleToggleStatus(session)}
                            disabled={submitting}
                          >
                            {session.status === 1 ? '禁用' : '启用'}
                          </button>
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDelete(session)}
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
      </section>

      {modalOpen ? (
        <SessionModal
          mode={modalMode}
          form={sessionForm}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeSessionModal}
          onChange={updateSessionForm}
          onSubmit={handleSubmit}
          onUpload={handleUpload}
        />
      ) : null}

      {boundModalOpen ? (
        <BoundCustomPassModal
          sessionTitle={selectedSession.title}
          customPasses={boundCustomPasses}
          submitting={actionSubmitting}
          onClose={() => setBoundModalOpen(false)}
          onUnbind={handleUnbind}
          onSortChange={handleBoundSortChange}
        />
      ) : null}
    </div>
  );
}
