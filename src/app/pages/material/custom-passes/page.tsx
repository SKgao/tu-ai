import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Card,
  Form,
  Table,
  Typography,
} from 'antd';
import type { FormProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { PAGE_SIZE_OPTIONS } from '@/app/lib/constants';
import { getErrorMessage } from '@/app/lib/errors';
import { getUploadFileName } from '@/app/lib/upload';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import {
  selectDictionaryEnsure,
  selectDictionaryItems,
  useSubjectTypeDictionary,
} from '@/app/stores/dictionaries';
import {
  addSingleSubject,
  createCustomPass,
  listCustomPasses,
  removeCustomPass,
  updateCustomPass,
  uploadAsset,
} from '@/app/services/material/custom-passes';
import { CustomPassModal } from './components/CustomPassModal';
import { CustomPassToolbar } from './components/CustomPassToolbar';
import { TopicModal } from './components/TopicModal';
import { createCustomPassColumns } from './configs/tableColumns';
import { normalizePassFormValues } from './utils/forms';
import type {
  CustomPassFormValues,
  CustomPassListResult,
  CustomPassQuery,
  CustomPassRecord,
  CustomPassUploadTarget,
  TopicFormValues,
  TopicUploadField,
  UploadRequestOptions,
} from './types';

export function CustomPassManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passForm] = Form.useForm<CustomPassFormValues>();
  const [topicForm] = Form.useForm<TopicFormValues>();
  const textbookId = searchParams.get('textbookId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const partsId = searchParams.get('partsId') || '';
  // 题型字典由全局 store 缓存（subjects / passes / custom-passes 共用，避免各自重复拉取）
  const subjects = useSubjectTypeDictionary(selectDictionaryItems);
  const ensureSubjects = useSubjectTypeDictionary(selectDictionaryEnsure);
  const [topicOpen, setTopicOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const passModal = useFormModal<CustomPassRecord>({
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
  const watchedPassIcon = Form.useWatch('icon', passForm);
  const passIconValue = typeof watchedPassIcon === 'string' ? watchedPassIcon : undefined;
  const {
    query,
    data: passList,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable<CustomPassQuery, CustomPassListResult, CustomPassRecord>({
    initialQuery: {
      textbookId,
      pageNum: 1,
      pageSize: 10,
    },
    enabled: Boolean(textbookId),
    request: async (currentQuery) => (await listCustomPasses(currentQuery)) as CustomPassListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '小关卡列表加载失败'),
  });

  useEffect(() => {
    // 只在存在 partsId（即「添加题目」入口可用）时才加载题型字典
    if (!partsId) {
      return;
    }

    void ensureSubjects().catch((error: unknown) => {
      message.error(getErrorMessage(error, '题型列表加载失败'));
    });
  }, [ensureSubjects, message, partsId]);

  async function handleUpload(
    options: UploadRequestOptions,
    field: TopicUploadField = 'icon',
    target: CustomPassUploadTarget = 'pass',
  ): Promise<void> {
    const { file, onError, onSuccess } = options;
    const fileName = getUploadFileName(file);

    setUploading(fileName);

    try {
      if (!(file instanceof Blob)) {
        throw new Error('上传文件无效');
      }

      const url = await uploadAsset(file);
      if (target === 'topic') {
        topicForm.setFieldValue(field, url);
      } else {
        passForm.setFieldValue('icon', url);
      }

      setUploadSuccess('上传成功');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = getErrorMessage(error, '上传失败');
      const uploadError = error instanceof Error ? error : new Error(errorMessage);
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError);
    }
  }

  const handlePassSubmit: FormProps<CustomPassFormValues>['onFinish'] = async (values) => {
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
      message.error(getErrorMessage(error, '小关卡提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(pass: CustomPassRecord): Promise<void> {
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
      message.error(getErrorMessage(error, '小关卡删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const handleTopicSubmit: FormProps<TopicFormValues>['onFinish'] = async (values) => {
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
      message.error(getErrorMessage(error, '题目添加失败'));
    } finally {
      setSubmitting(false);
    }
  };

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
          onBack={() => navigate(partsId ? `/material/parts?textBookId=${textbookId}&unitId=` : '/material/passes')}
          onRefresh={() => void reload().catch(() => {})}
        />
      </PageToolbarCard>

      <Card title="小关卡列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table<CustomPassRecord>
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
