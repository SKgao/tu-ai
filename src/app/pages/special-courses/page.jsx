import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Form,
  Space,
  Table,
  Typography,
} from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import {
  createSpecialCourse,
  downSpecialCourse,
  listBoughtSpecialCourses,
  listSpecialCourses,
  listBooks,
  removeSpecialCourse,
  uploadAsset,
  updateSpecialCourse,
  upSpecialCourse,
} from '@/app/services/special-courses';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMultiUploadState } from '@/app/hooks/useMultiUploadState';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createSpecialCourseColumns } from './configs/tableColumns';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';
import { SpecialCourseModal } from './components/SpecialCourseModal';
import { SpecialCourseSearchForm } from './components/SpecialCourseSearchForm';
import {
  EMPTY_FORM,
  INITIAL_QUERY,
  PAGE_SIZE_OPTIONS,
  buildPayload,
  buildSpecialCourseSearchFilters,
  normalizeSpecialCourseFormValues,
  validateSpecialCourseForm,
} from './utils/forms';

export function SpecialCourseManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [books, setBooks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useMultiUploadState(['iconDetail', 'iconTicket']);
  const courseModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      modalForm.setFieldsValue(EMPTY_FORM);
    },
    onOpenEdit: (course) => {
      resetUploadState();
      modalForm.setFieldsValue(normalizeSpecialCourseFormValues(course));
    },
  });
  const userId = searchParams.get('userId') || '';
  const refreshCourseOptions = useMemberCommerceOptionsStore((state) => state.refreshCourseOptions);
  const courseType = Form.useWatch('type', modalForm) || '1';
  const detailValue = Form.useWatch('iconDetail', modalForm);
  const ticketValue = Form.useWatch('iconTicket', modalForm);
  const {
    query,
    data: courses,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) => {
      if (userId) {
        const data = await listBoughtSpecialCourses(userId);
        const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        return {
          data: items,
          totalCount: typeof data?.totalCount === 'number' ? data.totalCount : items.length,
        };
      }

      return listSpecialCourses(currentQuery);
    },
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '精品课程列表加载失败'),
  });

  useEffect(() => {
    async function loadBooksData() {
      try {
        const data = await listBooks({
          pageNum: 1,
          pageSize: 1000,
        });
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(error?.message || '课程教材列表加载失败');
      }
    }

    loadBooksData();
  }, [message]);

  function handleSearch(values) {
    applyFilters(buildSpecialCourseSearchFilters(values));
  }

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleUpload(field, { file, onError, onSuccess }) {
    setUploading(field, file.name);

    try {
      const url = await uploadAsset(file);
      modalForm.setFieldValue(field, url);
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
    const errorMessage = validateSpecialCourseForm(values);
    if (errorMessage) {
      message.error(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(values, {
        allowTextbookIdEdit: courseModal.mode === 'create',
      });

      if (courseModal.mode === 'create') {
        await createSpecialCourse(payload);
      } else {
        await updateSpecialCourse({
          ...payload,
          textbookId: Number(values.textbookId),
        });
      }

      message.success(courseModal.mode === 'create' ? '精品课程创建成功' : '精品课程更新成功');
      courseModal.setOpen(false);
      await reload().catch(() => {});
      await refreshCourseOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '精品课程提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(course) {
    setActionSubmitting(true);
    try {
      await removeSpecialCourse(course.textbookId);
      message.success('精品课程已删除');
      await reload().catch(() => {});
      await refreshCourseOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '精品课程删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleStatusChange(course) {
    setActionSubmitting(true);
    try {
      if (Number(course.status) === 1) {
        await downSpecialCourse(course.textbookId);
      } else {
        await upSpecialCourse(course.textbookId);
      }
      message.success('课程状态更新成功');
      await reload().catch(() => {});
      await refreshCourseOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '课程状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createSpecialCourseColumns({
        onEdit: courseModal.openEdit,
        onToggleStatus: handleStatusChange,
        onDelete: handleDelete,
        submitting: submitting || actionSubmitting,
      }),
    [actionSubmitting, courseModal.openEdit, submitting],
  );

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="精品课程"
        description="对应旧版 `specialCourse`。先按新版 antd 组件重构课程筛选、列表、上下架和课程配置弹窗。"
      />

      {!userId ? (
        <PageToolbarCard>
          <SpecialCourseSearchForm
            form={searchForm}
            loading={loading}
            onSearch={handleSearch}
            onReset={handleReset}
            onCreate={courseModal.openCreate}
            onRefresh={() => reload().catch(() => {})}
          />
        </PageToolbarCard>
      ) : (
        <PageToolbarCard
          title="已买课程视图"
          actions={
            <Space wrap>
              <Typography.Text type="secondary">当前用户 ID: {userId}</Typography.Text>
              <Button onClick={() => navigate(-1)}>返回上一页</Button>
              <Button type="primary" onClick={courseModal.openCreate}>
                添加精品课程
              </Button>
            </Space>
          }
        />
      )}

      <Card
        title="课程列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table
          rowKey={(row) => `${row.textbookId}-${row.id || row.textbookName || ''}`}
          columns={columns}
          dataSource={courses}
          loading={loading}
          scroll={{ x: 1680 }}
          pagination={
            !userId
              ? buildAntdTablePagination({
                  query,
                  totalCount,
                  pageSizeOptions: PAGE_SIZE_OPTIONS,
                  setPageNum,
                  setPageSize,
                })
              : false
          }
        />
      </Card>

      <SpecialCourseModal
        open={courseModal.open}
        mode={courseModal.mode}
        form={modalForm}
        books={books}
        courseType={courseType}
        detailValue={detailValue}
        ticketValue={ticketValue}
        submitting={submitting}
        uploadState={uploadState}
        onCancel={courseModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
