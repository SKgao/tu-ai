import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Form, Space, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useUploadState } from '@/app/hooks/useUploadState';
import {
  changeCourseBagCourseStatus,
  createCourseBagCourse,
  listCourseBags,
  removeCourseBagCourse,
  uploadAsset,
  updateCourseBagCourse,
} from '@/app/services/course-bag-courses';
import { CourseBagCourseModal } from './components/CourseBagCourseModal';
import { createCourseBagCourseColumns } from './configs/tableColumns';
import {
  EMPTY_COURSE_BAG_COURSE_FORM,
  normalizeCourseBagCourseFormValues,
} from './utils/forms';

export function CourseBagCourseManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const bagId = searchParams.get('id') || '';
  const bagTitle = searchParams.get('title') || '';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const courseModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue({ ...EMPTY_COURSE_BAG_COURSE_FORM });
    },
    onOpenEdit: (course) => {
      resetUploadState();
      form.setFieldsValue(normalizeCourseBagCourseFormValues(course));
    },
  });
  const iconValue = Form.useWatch('icon', form);

  const sortedCourses = useMemo(
    () =>
      [...courses].sort((left, right) => {
        const leftSort = Number(left.sort ?? 0);
        const rightSort = Number(right.sort ?? 0);
        return leftSort - rightSort;
      }),
    [courses],
  );

  const loadCourses = useCallback(async () => {
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
      message.error(error?.message || '课程包课程列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [bagId, message]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  async function handleUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入封面地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
    if (!bagId || !values.name?.trim()) {
      message.error('请先确认课程包 ID，并填写课程名称');
      return;
    }

    setSubmitting(true);
    try {
      if (courseModal.mode === 'create') {
        await createCourseBagCourse({
          bagId: Number(bagId),
          name: values.name.trim(),
          icon: values.icon?.trim() || '',
        });
      } else {
        await updateCourseBagCourse({
          id: Number(values.id),
          name: values.name.trim(),
          icon: values.icon?.trim() || '',
          sort: values.sort ?? 0,
        });
      }

      message.success(courseModal.mode === 'create' ? '课程包课程创建成功' : '课程包课程更新成功');
      courseModal.setOpen(false);
      await loadCourses();
    } catch (error) {
      message.error(error?.message || '课程包课程提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(course) {
    setActionSubmitting(true);
    try {
      await changeCourseBagCourseStatus({
        id: Number(course.id),
        status: Number(course.status) === 1 ? 2 : 1,
      });
      message.success('课程状态更新成功');
      await loadCourses();
    } catch (error) {
      message.error(error?.message || '课程状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDelete(course) {
    setActionSubmitting(true);
    try {
      await removeCourseBagCourse(course.id);
      message.success('课程已删除');
      await loadCourses();
    } catch (error) {
      message.error(error?.message || '课程删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createCourseBagCourseColumns({
    onEdit: courseModal.openEdit,
    onToggleStatus: handleStatusChange,
    onDelete: handleDelete,
    submitting: submitting || actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="课程包课程"
        description="这一页对应旧版 `courseBag/course`，保留课程包内课程的 CRUD、启停和继续钻取活动/教学链路。"
      />

      <PageToolbarCard
        title={bagTitle || '未指定课程包'}
        description={`当前课程包 ID: ${bagId || '-'}`}
        actions={
          <Space wrap>
            <Button onClick={() => navigate(-1)}>返回上一页</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={courseModal.openCreate} disabled={!bagId}>
              添加课程
            </Button>
            <Button onClick={() => loadCourses()} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      />

      <Card
        title="课程列表"
        extra={<Typography.Text type="secondary">共 {sortedCourses.length} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sortedCourses}
          loading={loading}
          scroll={{ x: 1240 }}
          pagination={false}
        />
      </Card>

      <CourseBagCourseModal
        open={courseModal.open}
        mode={courseModal.mode}
        form={form}
        emptyForm={EMPTY_COURSE_BAG_COURSE_FORM}
        bagTitle={bagTitle}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={courseModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
