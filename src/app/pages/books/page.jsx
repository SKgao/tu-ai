import React, { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Form, Space, Table, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { toApiDateTime } from '@/app/lib/dateTime';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import {
  createBook,
  createGrade,
  createVersion,
  listBooks,
  listGrades,
  listVersions,
  lockBook,
  removeBook,
  removeGrade,
  removeVersion,
  updateBook,
  updateGrade,
  updateVersion,
  uploadAsset,
} from '@/app/services/books';
import { createBookColumns, createResourceColumns } from './configs/tableColumns';
import { BookModal } from './components/BookModal';
import { BookSearchForm } from './components/BookSearchForm';
import { ResourceModal } from './components/ResourceModal';
import {
  EMPTY_BOOK_FORM,
  EMPTY_RESOURCE_FORM,
  PAGE_SIZE_OPTIONS,
  normalizeBookFormValues,
  normalizeResourceFormValues,
} from './utils/forms';

export function BookManagementPage() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('book');
  const [searchForm] = Form.useForm();
  const [bookForm] = Form.useForm();
  const [resourceForm] = Form.useForm();
  const [grades, setGrades] = useState([]);
  const [versions, setVersions] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceType, setResourceType] = useState('grade');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const bookModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      bookForm.setFieldsValue({ ...EMPTY_BOOK_FORM });
    },
    onOpenEdit: (book) => {
      resetUploadState();
      bookForm.setFieldsValue(normalizeBookFormValues(book));
    },
  });
  const iconValue = Form.useWatch('icon', bookForm);
  const resourceId = Form.useWatch('id', resourceForm);
  const {
    query,
    data: books,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      startTime: '',
      endTime: '',
      gradeId: '',
      bookVersionId: '',
      pageNum: 1,
      pageSize: 10,
    },
    request: listBooks,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '教材列表加载失败'),
  });

  async function loadGradesData() {
    const data = await listGrades();
    setGrades(Array.isArray(data) ? data : []);
  }

  async function loadVersionsData() {
    const data = await listVersions();
    setVersions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    async function loadResources() {
      setResourceLoading(true);
      try {
        await Promise.all([loadGradesData(), loadVersionsData()]);
      } catch (error) {
        message.error(error?.message || '基础资源加载失败');
      } finally {
        setResourceLoading(false);
      }
    }

    loadResources();
  }, []);

  function openResourceModal(type, item) {
    setResourceType(type);
    resourceForm.setFieldsValue(normalizeResourceFormValues(type, item));
    setResourceModalOpen(true);
  }

  function closeResourceModal() {
    if (submitting) {
      return;
    }

    setResourceModalOpen(false);
  }

  function handleBookSearch(values) {
    applyFilters({
      startTime: toApiDateTime(values.startTime),
      endTime: toApiDateTime(values.endTime),
      gradeId: values.gradeId || '',
      bookVersionId: values.bookVersionId || '',
    });
  }

  function handleBookReset() {
    searchForm.resetFields();
    applyFilters({
      startTime: '',
      endTime: '',
      gradeId: '',
      bookVersionId: '',
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function refreshActiveTab() {
    try {
      if (activeTab === 'book') {
        setResourceLoading(true);
        await Promise.all([
          reload().catch(() => {}),
          loadGradesData(),
          loadVersionsData(),
        ]);
        setResourceLoading(false);
        return;
      }

      setResourceLoading(true);
      if (activeTab === 'grade') {
        await loadGradesData();
        setResourceLoading(false);
        return;
      }

      await loadVersionsData();
      setResourceLoading(false);
    } catch (error) {
      message.error(error?.message || '数据加载失败');
      setResourceLoading(false);
    }
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      bookForm.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入封面地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleBookSubmit(values) {
    if (!values.name?.trim() || !values.gradeId || !values.bookVersionId) {
      message.error('请填写教材名称并选择年级、教材版本');
      return;
    }

    const payload = {
      name: values.name.trim(),
      icon: values.icon?.trim() || '',
      gradeId: Number(values.gradeId),
      bookVersionId: Number(values.bookVersionId),
    };

    setSubmitting(true);
    try {
      if (bookModal.mode === 'create') {
        await createBook(payload);
      } else {
        await updateBook({
          ...payload,
          id: Number(values.id),
          status: values.status ?? undefined,
        });
      }

      message.success(bookModal.mode === 'create' ? '教材创建成功' : '教材更新成功');
      bookModal.setOpen(false);
      await Promise.all([
        reload().catch(() => {}),
        loadGradesData(),
        loadVersionsData(),
      ]);
    } catch (error) {
      message.error(error?.message || '教材提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResourceSubmit(values) {
    if (!values.name?.trim()) {
      message.error(`请输入${resourceType === 'grade' ? '年级' : '教材版本'}名称`);
      return;
    }

    setSubmitting(true);
    try {
      if (resourceType === 'grade') {
        if (values.id) {
          await updateGrade({
            id: Number(values.id),
            gradeName: values.name.trim(),
            status: values.sortValue ?? undefined,
          });
        } else {
          await createGrade(values.name.trim());
        }

        await loadGradesData();
      } else {
        if (values.id) {
          await updateVersion({
            id: Number(values.id),
            name: values.name.trim(),
          });
        } else {
          await createVersion(values.name.trim());
        }

        await loadVersionsData();
      }

      message.success(
        resourceType === 'grade'
          ? values.id
            ? '年级更新成功'
            : '年级创建成功'
          : values.id
            ? '教材版本更新成功'
            : '教材版本创建成功',
      );
      setResourceModalOpen(false);
    } catch (error) {
      message.error(error?.message || '资源提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBook(book) {
    setActionSubmitting(true);
    try {
      await removeBook(book.id);
      message.success('教材已删除');
      if (books.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '教材删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleBookLock(book) {
    setActionSubmitting(true);
    try {
      await lockBook({
        textbookId: book.id,
        canLock: book.canLock === 1 ? 2 : 1,
      });
      message.success(book.canLock === 1 ? '教材已锁定' : '教材已解锁');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '教材锁定状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDeleteResource(type, item) {
    setActionSubmitting(true);
    try {
      if (type === 'grade') {
        await removeGrade(item.id);
        message.success('年级已删除');
        await loadGradesData();
      } else {
        await removeVersion(item.id);
        message.success('教材版本已删除');
        await loadVersionsData();
      }
    } catch (error) {
      message.error(error?.message || '删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const bookColumns = useMemo(
    () =>
      createBookColumns({
        onEdit: bookModal.openEdit,
        onToggleLock: handleToggleBookLock,
        onDelete: handleDeleteBook,
        submitting: submitting || actionSubmitting,
      }),
    [actionSubmitting, bookModal.openEdit, submitting],
  );

  const resourceColumns = useMemo(
    () =>
      createResourceColumns({
        resourceType: activeTab,
        onEdit: openResourceModal,
        onDelete: handleDeleteResource,
        submitting: submitting || actionSubmitting,
      }),
    [actionSubmitting, activeTab, submitting],
  );

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="教材管理"
        description="这一页整合了旧版的教材、年级、教材版本三个 tab，并保留封面上传、锁定和资源维护能力。"
      />

      <PageToolbarCard>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'book', label: '教材管理' },
            { key: 'grade', label: '年级管理' },
            { key: 'version', label: '教材版本' },
          ]}
        />

        {activeTab === 'book' ? (
          <BookSearchForm
            form={searchForm}
            loading={loading}
            grades={grades}
            versions={versions}
            onSearch={handleBookSearch}
            onReset={handleBookReset}
            onCreate={bookModal.openCreate}
          />
        ) : (
          <div className="toolbar-grid toolbar-grid--compact">
            <Typography.Text type="secondary">
              {activeTab === 'grade'
                ? '维护年级基础数据，供教材和课程配置引用。'
                : '维护教材版本基础数据，供教材录入时选择。'}
            </Typography.Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openResourceModal(activeTab)}>
              {activeTab === 'grade' ? '添加年级' : '添加教材版本'}
            </Button>
          </div>
        )}
      </PageToolbarCard>

      <Card
        title={activeTab === 'book' ? '教材列表' : activeTab === 'grade' ? '年级列表' : '教材版本列表'}
        extra={
          <Space>
            <Typography.Text type="secondary">
              {activeTab === 'book'
                ? `共 ${totalCount} 条教材记录`
                : activeTab === 'grade'
                  ? `共 ${grades.length} 个年级`
                  : `共 ${versions.length} 个教材版本`}
            </Typography.Text>
            <Button onClick={() => refreshActiveTab()} loading={activeTab === 'book' ? loading : resourceLoading}>
              刷新
            </Button>
          </Space>
        }
      >
        {activeTab === 'book' ? (
          <Table
            rowKey="id"
            columns={bookColumns}
            dataSource={books}
            loading={loading}
            scroll={{ x: 1460 }}
            pagination={buildAntdTablePagination({
              query,
              totalCount,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              setPageNum,
              setPageSize,
            })}
          />
        ) : (
          <Table
            rowKey="id"
            columns={resourceColumns}
            dataSource={activeTab === 'grade' ? grades : versions}
            loading={resourceLoading}
            pagination={false}
          />
        )}
      </Card>

      <BookModal
        open={bookModal.open}
        mode={bookModal.mode}
        form={bookForm}
        grades={grades}
        versions={versions}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={bookModal.close}
        onSubmit={handleBookSubmit}
        onUpload={handleUpload}
      />

      <ResourceModal
        open={resourceModalOpen}
        form={resourceForm}
        resourceId={resourceId}
        resourceType={resourceType}
        submitting={submitting}
        onCancel={closeResourceModal}
        onSubmit={handleResourceSubmit}
      />
    </div>
  );
}
