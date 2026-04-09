import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Form, Space, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { createCourseUser, listCourseUsers } from '@/app/services/course-users';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createCourseUserColumns } from './configs/tableColumns';
import { CourseUserGrantModal } from './components/CourseUserGrantModal';
import { CourseUserSearchForm } from './components/CourseUserSearchForm';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';
import {
  buildCourseUserSearchFilters,
  COURSE_USER_PAGE_SIZE_OPTIONS,
  COURSE_USER_SEX_OPTIONS,
  EMPTY_COURSE_USER_FORM,
  INITIAL_COURSE_USER_FILTERS,
} from './utils/forms';

export function CourseUserManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const routeTutuNumber = searchParams.get('tutuNumber') || '';
  const books = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const grantModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      modalForm.setFieldsValue(EMPTY_COURSE_USER_FORM);
    },
  });
  const columns = useMemo(() => createCourseUserColumns(), []);
  const {
    query,
    data: users,
    totalCount,
    loading,
    applyFilters,
    patchQuery,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      pageNum: 1,
      pageSize: 10,
      textbookId: '',
      tutuNumber: routeTutuNumber,
      mobile: '',
      realName: '',
      sex: '',
    },
    request: listCourseUsers,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '已买课程列表加载失败'),
  });

  useEffect(() => {
    searchForm.setFieldsValue({
      ...INITIAL_COURSE_USER_FILTERS,
      tutuNumber: routeTutuNumber,
    });
    patchQuery({
      tutuNumber: routeTutuNumber,
      pageNum: 1,
    });
  }, [patchQuery, routeTutuNumber, searchForm]);

  useMountEffect(() => {
    ensureCourseOptions().catch((error) => {
      message.error(error?.message || '精品课程列表加载失败');
    });
  });

  function handleSearch(values) {
    applyFilters(buildCourseUserSearchFilters(values));
  }

  function handleReset() {
    searchForm.setFieldsValue({
      ...INITIAL_COURSE_USER_FILTERS,
      tutuNumber: routeTutuNumber,
    });
    applyFilters({
      textbookId: '',
      tutuNumber: routeTutuNumber,
      mobile: '',
      realName: '',
      sex: '',
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      await createCourseUser({
        realName: values.realName.trim(),
        mobile: values.mobile.trim(),
        sex: Number(values.sex),
        payAmt: Math.round(Number(values.payAmt) * 100),
        textbookId: Number(values.textbookId),
      });
      message.success('精品课程开通成功');
      grantModal.setOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '精品课程开通失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="已买课程"
        description="这一页对应旧版 `courseUser` 模块，先按新版 antd 组件重构筛选、列表和开通课程弹窗。"
      />

      <PageToolbarCard>
        <CourseUserSearchForm
          form={searchForm}
          loading={loading}
          routeTutuNumber={routeTutuNumber}
          initialValues={{
            ...INITIAL_COURSE_USER_FILTERS,
            tutuNumber: routeTutuNumber,
          }}
          books={books}
          sexOptions={COURSE_USER_SEX_OPTIONS}
          onSearch={handleSearch}
          onReset={handleReset}
          onCreate={grantModal.openCreate}
          onBack={() => navigate(-1)}
        />
      </PageToolbarCard>

      <Card
        title="已买课程列表"
        extra={
          <Space>
            <Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>
            <Button onClick={() => reload().catch(() => {})} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          rowKey={(row, index) => `${row.tutuNumber || 'course-user'}-${index}`}
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 1120 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: COURSE_USER_PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <CourseUserGrantModal
        open={grantModal.open}
        form={modalForm}
        books={books}
        sexOptions={COURSE_USER_SEX_OPTIONS}
        submitting={submitting}
        onCancel={grantModal.close}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
