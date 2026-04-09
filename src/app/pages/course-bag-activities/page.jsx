import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Card,
  Form,
  Space,
  Table,
  Typography,
} from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useMultiUploadState } from '@/app/hooks/useMultiUploadState';
import { listCourseBags } from '@/app/services/course-bags';
import {
  createCourseBagActivity,
  listCourseBagActivities,
  removeCourseBagActivity,
  uploadAsset,
  updateCourseBagActivity,
} from '@/app/services/course-bag-activities';
import { createCourseBagActivityColumns } from './configs/tableColumns';
import { CourseBagActivityModal } from './components/CourseBagActivityModal';
import { CourseBagActivityToolbar } from './components/CourseBagActivityToolbar';
import {
  EMPTY_FORM,
  buildCreateCourseBagActivityPayload,
  buildEditCourseBagActivityPayload,
  normalizeCourseBagActivityFormValues,
  validateCreateCourseBagActivityForm,
  validateEditCourseBagActivityForm,
} from './utils/forms';

export function CourseBagActivityManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const courseId = searchParams.get('id') || '';
  const courseName = searchParams.get('courseName') || '';
  const [activities, setActivities] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useMultiUploadState(['iconDetail', 'iconTicket']);
  const activityModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue({
        ...EMPTY_FORM,
        textbookId: courseId ? String(courseId) : undefined,
      });
    },
    onOpenEdit: (activity) => {
      resetUploadState();
      form.setFieldsValue(normalizeCourseBagActivityFormValues(activity));
    },
  });
  const courseType = Form.useWatch('type', form) || '1';
  const detailValue = Form.useWatch('iconDetail', form);
  const ticketValue = Form.useWatch('iconTicket', form);

  const loadActivities = useCallback(async () => {
    if (!courseId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listCourseBagActivities(courseId);
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '课程活动列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [courseId, message]);

  useMountEffect(() => {
    async function loadCourseOptions() {
      try {
        const bags = await listCourseBags();
        const items = Array.isArray(bags)
          ? bags.flatMap((bag) =>
              Array.isArray(bag?.textBookDOS)
                ? bag.textBookDOS.map((course) => ({
                    textbookId: course.id,
                    textbookName: course.name,
                  }))
                : [],
            )
          : [];
        setCourseOptions(items);
      } catch (error) {
        message.error(error?.message || '课程选项加载失败');
      }
    }

    loadCourseOptions();
  });

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  async function handleUpload(field, { file, onError, onSuccess }) {
    setUploading(field, file.name);

    try {
      const url = await uploadAsset(file);
      form.setFieldValue(field, url);
      setUploadSuccess(field, '上传成功，已自动写入地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(field, errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
    const errorMessage =
      activityModal.mode === 'create'
        ? validateCreateCourseBagActivityForm(values)
        : validateEditCourseBagActivityForm(values);

    if (errorMessage) {
      message.error(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      if (activityModal.mode === 'create') {
        await createCourseBagActivity(buildCreateCourseBagActivityPayload(values));
      } else {
        await updateCourseBagActivity(buildEditCourseBagActivityPayload(values));
      }

      message.success(activityModal.mode === 'create' ? '课程活动创建成功' : '课程活动更新成功');
      activityModal.setOpen(false);
      await loadActivities();
    } catch (error) {
      message.error(error?.message || '课程活动提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(activity) {
    setActionSubmitting(true);
    try {
      await removeCourseBagActivity(activity.id);
      message.success('课程活动已删除');
      await loadActivities();
    } catch (error) {
      message.error(error?.message || '课程活动删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createCourseBagActivityColumns({
    onEdit: activityModal.openEdit,
    onDelete: handleDelete,
    submitting: submitting || actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="课程包活动"
        description="这一页对应旧版 `courseBag/activity`，保留活动新增、编辑、删除，以及课程活动时间与金额配置。"
      />

      <PageToolbarCard>
        <CourseBagActivityToolbar
          courseName={courseName}
          courseId={courseId}
          loading={loading}
          onBack={() => navigate(-1)}
          onCreate={activityModal.openCreate}
          onRefresh={() => loadActivities()}
        />
      </PageToolbarCard>

      <Card
        title="活动列表"
        extra={<Typography.Text type="secondary">共 {activities.length} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={activities}
          loading={loading}
          scroll={{ x: 1680 }}
          pagination={false}
        />
      </Card>

      <CourseBagActivityModal
        open={activityModal.open}
        mode={activityModal.mode}
        form={form}
        courseOptions={courseOptions}
        courseType={courseType}
        detailValue={detailValue}
        ticketValue={ticketValue}
        submitting={submitting}
        uploadState={uploadState}
        onCancel={activityModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
