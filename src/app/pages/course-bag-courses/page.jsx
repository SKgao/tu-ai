import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  changeCourseBagCourseStatus,
  createCourseBagCourse,
  listCourseBags,
  removeCourseBagCourse,
  uploadAsset,
  updateCourseBagCourse,
} from '@/app/services/course-bag-courses';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { FileUploadField } from '@/app/components/FileUploadField';
import { ModalActions } from '@/app/components/ModalActions';
import { PageHero } from '@/app/components/PageHero';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useFileUpload } from '@/app/hooks/useFileUpload';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { createCourseBagCourseColumns } from './configs/tableColumns';

const EMPTY_FORM = {
  id: '',
  name: '',
  icon: '',
  sort: '',
};

function CourseBagCourseModal({
  mode,
  bagTitle,
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
      title={mode === 'create' ? '新增课程包课程' : '编辑课程包课程'}
      description={bagTitle ? `当前课程包：${bagTitle}` : '维护课程包里的精品课程。'}
      onClose={onClose}
      closeDisabled={submitting}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>课程名称</span>
            <input
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder="请输入课程名称"
            />
          </label>
          {mode === 'edit' ? (
            <label className="form-field">
              <span>排序字段</span>
              <input
                value={form.sort}
                onChange={(event) => onChange('sort', event.target.value)}
                placeholder="请输入排序"
              />
            </label>
          ) : null}
          <FileUploadField
            label="封面地址"
            value={form.icon}
            onValueChange={(value) => onChange('icon', value)}
            onUpload={onUpload}
            uploadState={uploadState}
            accept="image/*"
            uploadHint="支持上传课程封面"
            previewAlt="课程封面"
            fullWidth
          />
        </div>
        <ModalActions onCancel={onClose} submitting={submitting} />
      </form>
    </AppModal>
  );
}

export function CourseBagCourseManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bagId = searchParams.get('id') || '';
  const bagTitle = searchParams.get('title') || '';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { uploadState, upload, resetUploadState } = useFileUpload({
    uploadRequest: uploadAsset,
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
    editState: (course) => ({
      id: String(course.id),
      name: course.name || '',
      icon: course.icon || '',
      sort: course.sort !== undefined && course.sort !== null ? String(course.sort) : '',
    }),
    onOpenCreate: () => resetUploadState(),
    onOpenEdit: () => resetUploadState(),
  });

  const sortedCourses = useMemo(
    () =>
      [...courses].sort((left, right) => {
        const leftSort = Number(left.sort ?? 0);
        const rightSort = Number(right.sort ?? 0);
        return leftSort - rightSort;
      }),
    [courses],
  );

  const columns = useMemo(
    () =>
      createCourseBagCourseColumns({
        onEdit: openEditModal,
        onToggleStatus: handleStatusChange,
        onDelete: handleDelete,
        submitting: modalSubmitting || actionSubmitting,
      }),
    [actionSubmitting, modalSubmitting, sortedCourses],
  );

  async function loadCourses() {
    if (!bagId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const bags = await listCourseBags();
      const currentBag = (Array.isArray(bags) ? bags : []).find((item) => String(item.id) === String(bagId));
      setCourses(Array.isArray(currentBag?.textBookDOS) ? currentBag.textBookDOS : []);
    } catch (error) {
      showError(error?.message || '课程包课程列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, [bagId]);

  async function handleUpload(file) {
    try {
      await upload(file, {
        successMessage: '上传成功，已自动写入封面地址',
        onSuccess: (url) => {
          updateForm('icon', url);
        },
      });
    } catch {}
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!bagId || !form.name.trim()) {
      showError('请先确认课程包 ID，并填写课程名称');
      return;
    }

    if (modalMode === 'edit' && form.sort && !/^-?\d+$/.test(form.sort)) {
      showError('排序字段必须为整数');
      return;
    }

    await submitModal({
      action: async () => {
        if (modalMode === 'create') {
          await createCourseBagCourse({
            bagId: Number(bagId),
            name: form.name.trim(),
            icon: form.icon.trim(),
          });
          return;
        }

        await updateCourseBagCourse({
          id: Number(form.id),
          name: form.name.trim(),
          icon: form.icon.trim(),
          sort: form.sort === '' ? 0 : Number(form.sort),
        });
      },
      successMessage: modalMode === 'create' ? '课程包课程创建成功' : '课程包课程更新成功',
      errorMessage: '课程包课程提交失败',
      close: closeModal,
      afterSuccess: loadCourses,
    });
  }

  async function handleStatusChange(course) {
    await runAction({
      action: () =>
        changeCourseBagCourseStatus({
          id: Number(course.id),
          status: Number(course.status) === 1 ? 2 : 1,
        }),
      successMessage: '课程状态更新成功',
      errorMessage: '课程状态更新失败',
      afterSuccess: loadCourses,
    });
  }

  async function handleDelete(course) {
    await runAction({
      confirmText: `确认删除课程 ${course.name || course.id} 吗？`,
      action: () => removeCourseBagCourse(course.id),
      successMessage: '课程已删除',
      errorMessage: '课程删除失败',
      afterSuccess: loadCourses,
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="课程包课程"
        copy="对应旧版 `courseBag/course`，保留课程包内课程的 CRUD、启停和继续钻取活动/教学链路。"
      />

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">{bagTitle || '未指定课程包'}</h3>
            <p className="section-meta">当前课程包 ID: {bagId || '-'}</p>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--ghost" onClick={() => navigate(-1)}>
              返回上一页
            </button>
            <button type="button" className="app-button app-button--primary" onClick={openCreateModal}>
              添加课程
            </button>
          </div>
        </div>
      </section>

      <PageTableCard
        title="课程列表"
        totalCount={sortedCourses.length}
        columns={columns}
        data={sortedCourses}
        rowKey="id"
        loading={loading}
        minWidth={1240}
      />

      {modalOpen ? (
        <CourseBagCourseModal
          mode={modalMode}
          bagTitle={bagTitle}
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
