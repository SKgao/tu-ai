import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Card, Form, Space, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import {
  addSingleSubject,
  batchRemoveSubjectRecords,
  createSubjectScenePic,
  getSubjectRecordDetail,
  listSubjectRecords,
  listSubjects,
  removeSubjectRecord,
  removeSubjectScenePic,
  updateSubjectRecord,
  updateSubjectScenePic,
  uploadAsset,
} from '@/app/services/subjects';
import { SubjectDetailCard } from './components/SubjectDetailCard';
import { SubjectModal } from './components/SubjectModal';
import { SubjectSearchForm } from './components/SubjectSearchForm';
import { createSubjectColumns } from './configs/tableColumns';
import {
  PAGE_SIZE_OPTIONS,
  buildSearch,
  buildSubjectSearchFilters,
  isScenePassId,
  normalizeSubjectFormValues,
} from './utils/forms';

export function SubjectsManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const routeCustomsPassId = searchParams.get('customsPassId') || '';
  const partsId = searchParams.get('partsId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const textbookId = searchParams.get('textBookId') || searchParams.get('textbookId') || '';
  const topicId = searchParams.get('topicId') || '';
  const isDetailMode = searchParams.get('detpage') === '1' || Boolean(topicId);
  const {
    query,
    setQuery,
    data: records,
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
      customsPassId: routeCustomsPassId,
      customsPassName: '',
      sourceIds: '',
      pageNum: 1,
      pageSize: 10,
    },
    request: listSubjectRecords,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    enabled: !isDetailMode,
    onError: (errorMessage) => message.error(errorMessage || '题目列表加载失败'),
  });
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const subjectModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      modalForm.setFieldsValue(normalizeSubjectFormValues(null, routeCustomsPassId));
    },
    onOpenEdit: (record) => {
      resetUploadState();
      modalForm.setFieldsValue(normalizeSubjectFormValues(record, routeCustomsPassId));
    },
  });
  const currentCustomsPassId = Form.useWatch('customsPassId', modalForm);

  const enableSceneColumn = useMemo(() => {
    if (isScenePassId(routeCustomsPassId) || isScenePassId(currentCustomsPassId) || isScenePassId(detailRecord?.customsPassId)) {
      return true;
    }

    return records.some((item) => isScenePassId(item.customsPassId));
  }, [currentCustomsPassId, detailRecord?.customsPassId, records, routeCustomsPassId]);

  const detailResources = Array.isArray(detailRecord?.sourceVOS) ? detailRecord.sourceVOS : [];

  useEffect(() => {
    searchForm.resetFields();
    setQuery((current) => ({
      ...current,
      startTime: '',
      endTime: '',
      customsPassId: routeCustomsPassId,
      customsPassName: '',
      sourceIds: '',
      pageNum: 1,
    }));
    setSelectedIds([]);
  }, [routeCustomsPassId, searchForm, setQuery]);

  useMountEffect(() => {
    async function loadSubjectTypes() {
      try {
        const data = await listSubjects();
        setSubjectTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error?.message || '题型列表加载失败');
      }
    }

    loadSubjectTypes();
  });

  useEffect(() => {
    setSelectedIds([]);
  }, [records]);

  useEffect(() => {
    if (!isDetailMode || !topicId) {
      setDetailRecord(null);
      setDetailLoading(false);
      return;
    }

    async function loadDetail() {
      setDetailLoading(true);
      try {
        const data = await getSubjectRecordDetail(topicId);
        setDetailRecord(data);
      } catch (error) {
        message.error(error?.message || '题目详情加载失败');
      } finally {
        setDetailLoading(false);
      }
    }

    loadDetail();
  }, [isDetailMode, message, topicId]);

  async function handleUpload({ file, onError, onSuccess }, field) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      modalForm.setFieldValue(field, url);
      setUploadSuccess(`${file.name} 上传成功`);
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function reloadCurrentPage() {
    if (isDetailMode && topicId) {
      setDetailLoading(true);
      try {
        const data = await getSubjectRecordDetail(topicId);
        setDetailRecord(data);
      } catch (error) {
        message.error(error?.message || '题目详情加载失败');
      } finally {
        setDetailLoading(false);
      }
      return;
    }

    await reload();
    setSelectedIds([]);
  }

  async function syncSceneGraph(subjectId, nextSceneGraph, previousSceneGraph) {
    const current = previousSceneGraph && previousSceneGraph !== 'null' ? previousSceneGraph : '';
    const next = nextSceneGraph && nextSceneGraph !== 'null' ? nextSceneGraph : '';

    if (current === next) {
      return;
    }

    if (!next && current) {
      await removeSubjectScenePic(subjectId);
      return;
    }

    if (!next) {
      return;
    }

    if (current) {
      await updateSubjectScenePic({ id: subjectId, scenePic: next });
      return;
    }

    await createSubjectScenePic({ id: subjectId, scenePic: next });
  }

  async function handleSubmit(values) {
    if (!values.customsPassId || !values.sourceIds?.trim()) {
      message.error('请填写关卡 ID 和题目内容');
      return;
    }

    setSubmitting(true);
    try {
      if (subjectModal.mode === 'create') {
        await addSingleSubject({
          customsPassId: Number(values.customsPassId),
          partId: partsId ? Number(partsId) : undefined,
          sessionId: sessionId ? Number(sessionId) : undefined,
          sourceIds: values.sourceIds.trim(),
          sort: values.sort ?? undefined,
          showIndex: values.showIndex ? values.showIndex.trim().split(/\s+/g) : undefined,
          subject: values.subject ? Number(values.subject) : undefined,
          icon: values.icon?.trim() || '',
          audio: values.audio?.trim() || '',
          sentenceAudio: values.sentenceAudio?.trim() || '',
          sceneGraph: values.sceneGraph?.trim() || '',
        });
      } else {
        await updateSubjectRecord({
          id: Number(values.id),
          customsPassId: Number(values.customsPassId),
          customsPassName: values.customsPassName?.trim() || '',
          sourceIds: values.sourceIds.trim(),
          sort: values.sort ?? undefined,
        });

        if (isScenePassId(values.customsPassId)) {
          await syncSceneGraph(Number(values.id), values.sceneGraph?.trim() || '', values.originalSceneGraph);
        }
      }

      message.success(subjectModal.mode === 'create' ? '题目创建成功' : '题目更新成功');
      subjectModal.setOpen(false);
      await reloadCurrentPage();
    } catch (error) {
      message.error(error?.message || '题目提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(record) {
    setActionSubmitting(true);
    try {
      await removeSubjectRecord(record.id);
      message.success('题目已删除');
      if (isDetailMode) {
        navigate(`/subjects${buildSearch(searchParams, {}, ['topicId', 'detpage'])}`, { replace: true });
      } else if (records.length === 1 && query.pageNum > 1) {
        setQuery((current) => ({
          ...current,
          pageNum: current.pageNum - 1,
        }));
      } else {
        await reloadCurrentPage();
      }
    } catch (error) {
      message.error(error?.message || '题目删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBatchDelete() {
    if (!selectedIds.length) {
      return;
    }

    setActionSubmitting(true);
    try {
      await batchRemoveSubjectRecords(selectedIds);
      message.success('批量删除成功');
      await reloadCurrentPage();
    } catch (error) {
      message.error(error?.message || '批量删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createSubjectColumns({
    enableSceneColumn,
    onEdit: subjectModal.openEdit,
    onView: (record) =>
      navigate(
        `/subjects${buildSearch(searchParams, {
          topicId: record.id,
          detpage: 1,
        })}`,
      ),
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title={isDetailMode ? '题目详情' : '题目管理'}
        description={
          isDetailMode
            ? '这一页对应旧版题目详情视图，保留资源预览、编辑和删除能力。'
            : '这一页对应旧版 subjects 模块，保留查询、单题录入、增改删和场景图能力。'
        }
      />

      {!isDetailMode ? (
        <>
          <PageToolbarCard>
            <SubjectSearchForm
              form={searchForm}
              loading={loading}
              routeCustomsPassId={routeCustomsPassId}
              textbookId={textbookId}
              partsId={partsId}
              sessionId={sessionId}
              selectedCount={selectedIds.length}
              submitting={submitting}
              actionSubmitting={actionSubmitting}
              onSearch={(values) => applyFilters(buildSubjectSearchFilters(values, routeCustomsPassId))}
              onCreate={subjectModal.openCreate}
              onBatchDelete={handleBatchDelete}
              onBack={() => navigate(-1)}
            />
          </PageToolbarCard>

          <Card title="题目列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录，已选 {selectedIds.length} 条</Typography.Text>}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={records}
              loading={loading}
              rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: (nextKeys) => setSelectedIds(nextKeys),
              }}
              scroll={{ x: enableSceneColumn ? 1380 : 1280 }}
              pagination={buildAntdTablePagination({
                query,
                totalCount,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                setPageNum,
                setPageSize,
              })}
            />
          </Card>
        </>
      ) : (
        <SubjectDetailCard
          loading={detailLoading}
          detailRecord={detailRecord}
          topicId={topicId}
          detailResources={detailResources}
          submitting={submitting}
          actionSubmitting={actionSubmitting}
          onBack={() => navigate(`/subjects${buildSearch(searchParams, {}, ['topicId', 'detpage'])}`)}
          onEdit={subjectModal.openEdit}
          onRefresh={reloadCurrentPage}
          onDelete={handleDelete}
        />
      )}

      <SubjectModal
        open={subjectModal.open}
        mode={subjectModal.mode}
        form={modalForm}
        routeCustomsPassId={routeCustomsPassId}
        currentCustomsPassId={currentCustomsPassId}
        subjectTypes={subjectTypes}
        submitting={submitting}
        uploadState={uploadState}
        onCancel={subjectModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
