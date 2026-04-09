import React, { useEffect, useState } from 'react';
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
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import {
  addSingleSubject,
  createCustomPass,
  listCustomPasses,
  listSubjects,
  removeCustomPass,
  updateCustomPass,
  uploadAsset,
} from '@/app/services/custom-passes';
import { CustomPassModal } from './components/CustomPassModal';
import { CustomPassToolbar } from './components/CustomPassToolbar';
import { TopicModal } from './components/TopicModal';
import { createCustomPassColumns } from './configs/tableColumns';
import {
  PAGE_SIZE_OPTIONS,
  normalizePassFormValues,
} from './utils/forms';

export function CustomPassManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passForm] = Form.useForm();
  const [topicForm] = Form.useForm();
  const textbookId = searchParams.get('textbookId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [subjects, setSubjects] = useState([]);
  const [topicOpen, setTopicOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const passModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      passForm.setFieldsValue(normalizePassFormValues(null, textbookId));
    },
    onOpenEdit: (pass) => {
      resetUploadState();
      passForm.setFieldsValue(normalizePassFormValues(pass, textbookId));
    },
  });
  const passIconValue = Form.useWatch('icon', passForm);
  const {
    query,
    data: passList,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      textbookId,
      pageNum: 1,
      pageSize: 10,
    },
    enabled: Boolean(textbookId),
    request: listCustomPasses,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '小关卡列表加载失败'),
  });

  useEffect(() => {
    async function loadSubjectTypes() {
      try {
        const data = await listSubjects();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error?.message || '题型列表加载失败');
      }
    }

    if (partsId) {
      loadSubjectTypes();
    }
  }, [partsId, message]);

  async function handleUpload({ file, onError, onSuccess }, field = 'icon', target = 'pass') {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      if (target === 'topic') {
        topicForm.setFieldValue(field, url);
      } else {
        passForm.setFieldValue('icon', url);
      }

      setUploadSuccess('上传成功');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handlePassSubmit(values) {
    if (values.textbookId === undefined || values.id === undefined || !values.title?.trim() || !values.tmpTitle?.trim()) {
      message.error('请填写教材 ID、小关卡 ID、标题和过渡标题');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        textbookId: Number(values.textbookId),
        id: Number(values.id),
        title: values.title.trim(),
        tmpTitle: values.tmpTitle.trim(),
        icon: values.icon?.trim() || '',
        sort: values.sort ?? undefined,
      };

      if (passModal.mode === 'create') {
        await createCustomPass(payload);
      } else {
        await updateCustomPass(payload);
      }

      message.success(passModal.mode === 'create' ? '小关卡创建成功' : '小关卡更新成功');
      passModal.setOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '小关卡提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(pass) {
    setActionSubmitting(true);
    try {
      await removeCustomPass({
        id: pass.id,
        textbookId,
      });
      message.success('小关卡已删除');
      if (passList.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '小关卡删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleTopicSubmit(values) {
    if (!values.customsPassId || !values.sourceIds?.trim()) {
      message.error('请先选择小关卡并填写题目内容');
      return;
    }

    setSubmitting(true);
    try {
      await addSingleSubject({
        customsPassId: Number(values.customsPassId),
        partId: partsId ? Number(partsId) : undefined,
        sessionId: sessionId ? Number(sessionId) : undefined,
        sourceIds: values.sourceIds.trim(),
        sort: values.sort ?? undefined,
        showIndex: values.showIndex ? values.showIndex.split(/\s+/g) : undefined,
        icon: values.icon || '',
        audio: values.audio || '',
        sentenceAudio: values.sentenceAudio || '',
        sceneGraph: values.sceneGraph || '',
        subject: values.subject ? Number(values.subject) : undefined,
      });
      message.success('题目添加成功');
      setTopicOpen(false);
    } catch (error) {
      message.error(error?.message || '题目添加失败');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = createCustomPassColumns({
    partsId,
    sessionId,
    onEdit: passModal.openEdit,
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="小关卡管理"
        description="这一页对应旧版 customPass 管理模块，保留小关卡维护，并在 `partsId` 存在时保留单题录入入口。"
      />

      <PageToolbarCard>
        <CustomPassToolbar
          textbookId={textbookId}
          sessionId={sessionId}
          partsId={partsId}
          loading={loading}
          topicForm={topicForm}
          onCreatePass={passModal.openCreate}
          onOpenTopic={() => {
            resetUploadState();
            setTopicOpen(true);
          }}
          onBack={() => navigate(partsId ? `/parts?textBookId=${textbookId}&unitId=` : '/passes')}
          onRefresh={() => reload().catch(() => {})}
        />
      </PageToolbarCard>

      <Card title="小关卡列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={passList}
          loading={loading}
          scroll={{ x: 1180 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <CustomPassModal
        open={passModal.open}
        mode={passModal.mode}
        form={passForm}
        submitting={submitting}
        uploadState={uploadState}
        passIconValue={passIconValue}
        onCancel={passModal.close}
        onSubmit={handlePassSubmit}
        onUpload={(options) => handleUpload(options)}
      />

      <TopicModal
        open={topicOpen}
        form={topicForm}
        passList={passList}
        subjects={subjects}
        submitting={submitting}
        uploadState={uploadState}
        onCancel={() => setTopicOpen(false)}
        onSubmit={handleTopicSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
