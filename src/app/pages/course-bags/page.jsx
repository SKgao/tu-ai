import React, { useEffect, useMemo, useState } from 'react';
import {
  changeCourseBagStatus,
  createCourseBag,
  listCourseBags,
  removeCourseBag,
  uploadAsset,
  updateCourseBag,
} from '@/app/services/course-bags';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { PageHero } from '@/app/components/PageHero';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { createCourseBagColumns } from './configs/tableColumns';

const EMPTY_FORM = {
  id: '',
  title: '',
  icon: '',
  sort: '',
};

function CourseBagModal({
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
      title={mode === 'create' ? '新增课程包' : '编辑课程包'}
      description="维护课程包标题、封面与排序，并串起后续课程包课程页面。"
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>课程包名称</span>
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="请输入课程包名称"
            />
          </label>
          <label className="form-field">
            <span>排序字段</span>
            <input
              value={form.sort}
              onChange={(event) => onChange('sort', event.target.value)}
              placeholder="编辑时可选，数字"
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
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传课程包图标'}
              </div>
            </div>
            {form.icon ? (
              <div className="avatar-preview">
                <img src={form.icon} alt="课程包图标" className="avatar-preview__image" />
              </div>
            ) : null}
          </div>
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function CourseBagManagementPage() {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    isOpen: modalOpen,
    mode: modalMode,
    form,
    updateForm,
    openCreate: openCreateModal,
    openEdit: openEditModal,
    close: closeModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_FORM }),
    editState: (bag) => ({
      id: String(bag.id),
      title: bag.title || '',
      icon: bag.icon || '',
      sort: bag.sort !== undefined && bag.sort !== null ? String(bag.sort) : '',
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

  const sortedBags = useMemo(
    () =>
      [...bags].sort((left, right) => {
        const leftSort = Number(left.sort ?? 0);
        const rightSort = Number(right.sort ?? 0);
        return leftSort - rightSort;
      }),
    [bags],
  );

  const columns = useMemo(
    () =>
      createCourseBagColumns({
        onEdit: openEditModal,
        onToggleStatus: handleStatusChange,
        onDelete: handleDelete,
        submitting: modalSubmitting || actionSubmitting,
      }),
    [actionSubmitting, modalSubmitting, sortedBags],
  );

  async function loadBags() {
    setLoading(true);
    try {
      const data = await listCourseBags();
      setBags(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error?.message || '课程包列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBags();
  }, []);

  async function handleUpload(file) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      updateForm('icon', url);
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

    if (!form.title.trim()) {
      showError('请输入课程包名称');
      return;
    }

    if (form.sort && !/^-?\d+$/.test(form.sort)) {
      showError('排序字段必须为整数');
      return;
    }

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createCourseBag({
            title: form.title.trim(),
            icon: form.icon.trim(),
          });
          return;
        }

        await updateCourseBag({
          id: Number(form.id),
          title: form.title.trim(),
          icon: form.icon.trim(),
          sort: form.sort === '' ? 0 : Number(form.sort),
        });
      },
      successMessage: modalMode === 'create' ? '课程包创建成功' : '课程包更新成功',
      errorMessage: '课程包提交失败',
      close: closeModal,
      afterSuccess: loadBags,
    });
  }

  async function handleStatusChange(bag) {
    await runAction({
      action: () =>
        changeCourseBagStatus({
          id: Number(bag.id),
          status: Number(bag.status) === 1 ? 2 : 1,
        }),
      successMessage: '课程包状态更新成功',
      errorMessage: '课程包状态更新失败',
      afterSuccess: loadBags,
    });
  }

  async function handleDelete(bag) {
    await runAction({
      confirmText: `确认删除课程包 ${bag.title || bag.id} 吗？`,
      action: () => removeCourseBag(bag.id),
      successMessage: '课程包已删除',
      errorMessage: '课程包删除失败',
      afterSuccess: loadBags,
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="课程包管理"
        copy="对应旧版 `courseBag/bags`。保留课程包 CRUD、启停和继续钻取课程包课程的能力。"
      />

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-actions">
          <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
            添加课程包
          </button>
          <button
            type="button"
            className="app-button app-button--ghost"
            onClick={() => loadBags()}
            disabled={loading}
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </section>

      <PageTableCard
        title="课程包列表"
        totalCount={sortedBags.length}
        columns={columns}
        data={sortedBags}
        rowKey="id"
        loading={loading}
        minWidth={1100}
      />

      {modalOpen ? (
        <CourseBagModal
          mode={modalMode}
          form={form}
          uploadState={uploadState}
          submitting={modalSubmitting}
          onClose={closeModal}
          onChange={updateForm}
          onUpload={handleUpload}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}
