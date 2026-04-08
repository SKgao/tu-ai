import React, { startTransition, useEffect, useState } from 'react';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import {
  createMemberLevel,
  listMemberLevels,
  removeMemberLevel,
  updateMemberLevel,
  uploadAsset,
} from '@/app/services/member-levels';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';

const EMPTY_LEVEL_FORM = {
  userLevel: '',
  levelName: '',
  explainInfo: '',
  exprieDays: '',
  orgMoney: '',
  needMoney: '',
  icon: '',
};

function toAmountCent(value) {
  if (value === '') {
    return undefined;
  }

  return Math.round(Number(value) * 100);
}

function fromAmountCent(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return (Number(value) / 100).toFixed(2);
}

function MemberLevelModal({
  mode,
  form,
  uploadState,
  submitting,
  onClose,
  onChange,
  onUpload,
  onSubmit,
}) {
  return (
    <AppModal
      title={mode === 'create' ? '新增会员等级' : '编辑会员等级'}
      description="维护会员等级名称、有效期、价格与图标。"
      size="lg"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>会员等级 ID</span>
            <input
              value={form.userLevel}
              onChange={(event) => onChange('userLevel', event.target.value)}
              placeholder="请输入会员等级 ID"
              disabled={mode === 'edit'}
            />
          </label>
          <label className="form-field">
            <span>会员等级名称</span>
            <input
              value={form.levelName}
              onChange={(event) => onChange('levelName', event.target.value)}
              placeholder="请输入会员等级名称"
            />
          </label>
          <label className="form-field form-field--full">
            <span>等级描述</span>
            <input
              value={form.explainInfo}
              onChange={(event) => onChange('explainInfo', event.target.value)}
              placeholder="请输入等级描述"
            />
          </label>
          <label className="form-field">
            <span>过期天数</span>
            <input
              value={form.exprieDays}
              onChange={(event) => onChange('exprieDays', event.target.value)}
              placeholder="0 表示永久有效"
            />
          </label>
          <label className="form-field">
            <span>原始价格</span>
            <input
              value={form.orgMoney}
              onChange={(event) => onChange('orgMoney', event.target.value)}
              placeholder="请输入原始价格，单位元"
            />
          </label>
          <label className="form-field">
            <span>需充值金额</span>
            <input
              value={form.needMoney}
              onChange={(event) => onChange('needMoney', event.target.value)}
              placeholder="请输入需充值金额，单位元"
            />
          </label>
          <label className="form-field form-field--full">
            <span>图标地址</span>
            <input
              value={form.icon}
              onChange={(event) => onChange('icon', event.target.value)}
              placeholder="可直接粘贴图片 URL"
            />
          </label>
          <div className="form-field form-field--full">
            <span>上传图标</span>
            <div className="upload-row">
              <input
                type="file"
                accept="image/*"
                disabled={uploadState.uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onUpload(file);
                  }
                  event.target.value = '';
                }}
              />
              <div className="upload-state">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传等级图标'}
              </div>
            </div>
            {form.icon ? (
              <div className="avatar-preview">
                <img src={form.icon} alt="会员等级图标" className="avatar-preview__image" />
              </div>
            ) : null}
          </div>
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function MemberLevelManagementPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    isOpen: modalOpen,
    mode: modalMode,
    form: levelForm,
    updateForm: updateLevelForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_LEVEL_FORM }),
    editState: (level) => ({
      userLevel: String(level.userLevel ?? ''),
      levelName: level.levelName || '',
      explainInfo: level.explainInfo || '',
      exprieDays: level.exprieDays !== undefined && level.exprieDays !== null ? String(level.exprieDays) : '',
      orgMoney: fromAmountCent(level.orgMoney),
      needMoney: fromAmountCent(level.needMoney),
      icon: level.icon || '',
    }),
    onOpenCreate: () => setUploadState({ uploading: false, message: '' }),
    onOpenEdit: () => setUploadState({ uploading: false, message: '' }),
  });
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
  });
  const refreshMemberLevelResources = useMemberCommerceOptionsStore(
    (state) => state.refreshMemberLevelResources,
  );

  async function loadLevels() {
    setLoading(true);
    try {
      const data = await listMemberLevels();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '会员等级列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLevels();
  }, []);

  async function handleUpload(file) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      updateLevelForm('icon', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入图标地址',
      });
    } catch (error) {
      setUploadState({
        uploading: false,
        message: error?.message || '上传失败',
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!levelForm.userLevel || !levelForm.levelName.trim()) {
      showError('请填写会员等级 ID 和名称');
      return;
    }

    if (!/^\d+$/.test(levelForm.userLevel)) {
      showError('会员等级 ID 必须为数字');
      return;
    }

    for (const field of ['exprieDays']) {
      if (levelForm[field] && !/^\d+$/.test(levelForm[field])) {
        showError('过期天数必须为数字');
        return;
      }
    }

    for (const field of ['orgMoney', 'needMoney']) {
      if (levelForm[field] && Number.isNaN(Number(levelForm[field]))) {
        showError('价格字段必须是数字');
        return;
      }
    }

    if (modalMode === 'create' && levels.some((item) => String(item.userLevel) === levelForm.userLevel)) {
      showError('等级 ID 已存在，请重新输入');
      return;
    }

    const payload = {
      userLevel: Number(levelForm.userLevel),
      levelName: levelForm.levelName.trim(),
      explainInfo: levelForm.explainInfo.trim(),
      exprieDays: levelForm.exprieDays ? Number(levelForm.exprieDays) : undefined,
      orgMoney: toAmountCent(levelForm.orgMoney),
      needMoney: toAmountCent(levelForm.needMoney),
      icon: levelForm.icon.trim(),
    };

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createMemberLevel(payload);
          return;
        }

        await updateMemberLevel(payload);
      },
      successMessage: modalMode === 'create' ? '会员等级创建成功' : '会员等级更新成功',
      errorMessage: '会员等级提交失败',
      close: closeModal,
      afterSuccess: async () => {
        await loadLevels();
        await refreshMemberLevelResources().catch(() => {});
      },
    });
  }

  async function handleDelete(level) {
    await runAction({
      confirmText: `确认删除会员等级 ${level.levelName || level.userLevel} 吗？`,
      action: () => removeMemberLevel(level.userLevel),
      successMessage: '会员等级已删除',
      errorMessage: '会员等级删除失败',
      afterSuccess: async () => {
        startTransition(() => {
          setLevels((current) => current.filter((item) => item.userLevel !== level.userLevel));
        });
        await loadLevels();
        await refreshMemberLevelResources().catch(() => {});
      },
    });
  }

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">会员等级管理</h2>
          <p className="page-copy">
            这一页对应旧版 `memberLevel` 模块，保留等级列表、创建、编辑、删除和图标上传能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--compact">
          <div className="section-meta">当前共 {levels.length} 个会员等级</div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加会员等级
            </button>
            <button type="button" className="app-button app-button--ghost" onClick={() => loadLevels()}>
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card surface-card--table">
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>会员等级 ID</th>
                <th>会员等级名称</th>
                <th>等级描述</th>
                <th>图标</th>
                <th>过期时间</th>
                <th>原始价格</th>
                <th>需充值金额</th>
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
              {!loading && !levels.length ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    暂无数据
                  </td>
                </tr>
              ) : null}
              {!loading
                ? levels.map((level) => (
                    <tr key={level.userLevel}>
                      <td>{level.userLevel}</td>
                      <td>{level.levelName || '-'}</td>
                      <td className="table-content-cell">{level.explainInfo || '-'}</td>
                      <td>
                        {level.icon ? (
                          <a href={level.icon} target="_blank" rel="noreferrer" className="avatar-link">
                            <img src={level.icon} alt={level.levelName || 'level'} className="avatar-thumb" />
                          </a>
                        ) : (
                          <span className="table-muted">无</span>
                        )}
                      </td>
                      <td>{Number(level.exprieDays) === 0 ? '永久有效' : level.exprieDays ?? '-'}</td>
                      <td>{fromAmountCent(level.orgMoney) || '0.00'} 元</td>
                      <td>{fromAmountCent(level.needMoney) || '0.00'} 元</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="text-button" onClick={() => openEditModal(level)}>
                            编辑
                          </button>
                          <button
                            type="button"
                            className="text-button text-button--danger"
                            onClick={() => handleDelete(level)}
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
      </section>

      {modalOpen ? (
        <MemberLevelModal
          mode={modalMode}
          form={levelForm}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateLevelForm}
          onUpload={handleUpload}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
