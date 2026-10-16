import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Card, Form, Table, Typography } from 'antd';
import type { FormProps, UploadProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useUploadState } from '@/app/hooks/useUploadState';
import {
  bindCustomPassToSession,
  changeSessionCustomSort,
  changeSessionStatus,
  createSession,
  listCustomPasses,
  listSessionCustomPasses,
  listSessions,
  removeSession,
  unbindSessionCustomPass,
  updateSession,
  uploadAsset,
} from '@/app/services/sessions';
import { BoundCustomPassModal } from './components/BoundCustomPassModal';
import { SessionModal } from './components/SessionModal';
import { SessionToolbar } from './components/SessionToolbar';
import { createSessionColumns } from './configs/tableColumns';
import { normalizeSessionFormValues } from './utils/forms';
import type {
  BoundCustomPassRecord,
  CustomPassOption,
  SelectedSession,
  SessionBindSelections,
  SessionFormValues,
  SessionRecord,
} from './types';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];
type UploadRequestFile = UploadRequestOptions['file'];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getUploadFileName(file: UploadRequestFile): string {
  return typeof file === 'object' && file !== null && 'name' in file && typeof file.name === 'string' && file.name
    ? file.name
    : '文件';
}

export function SessionManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<SessionFormValues>();
  const textbookId = searchParams.get('textbookId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [filterTextbookId, setFilterTextbookId] = useState(textbookId);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [availableCustomPasses, setAvailableCustomPasses] = useState<CustomPassOption[]>([]);
  const [boundCustomPasses, setBoundCustomPasses] = useState<BoundCustomPassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [boundModalOpen, setBoundModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SelectedSession>({ id: '', title: '' });
  const [bindSelections, setBindSelections] = useState<SessionBindSelections>({});
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const sessionModal = useFormModal<SessionRecord>({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue(normalizeSessionFormValues(null, filterTextbookId));
    },
    onOpenEdit: (session) => {
      resetUploadState();
      form.setFieldsValue(normalizeSessionFormValues(session, filterTextbookId));
    },
  });
  const watchedIcon = Form.useWatch('icon', form);
  const iconValue = typeof watchedIcon === 'string' ? watchedIcon : undefined;

  const loadSessions = useCallback(async (currentTextbookId: string = filterTextbookId) => {
    if (!currentTextbookId) {
      setSessions([]);
      setAvailableCustomPasses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sessionData, customPassData] = await Promise.all([
        listSessions(Number(currentTextbookId)),
        listCustomPasses({
          textbookId: Number(currentTextbookId),
          pageNum: 1,
          pageSize: 1000,
        }),
      ]);
      const customPassList = customPassData?.data;
      setSessions(Array.isArray(sessionData) ? (sessionData as SessionRecord[]) : []);
      setAvailableCustomPasses(Array.isArray(customPassList) ? (customPassList as CustomPassOption[]) : []);
    } catch (error) {
      message.error(getErrorMessage(error, '大关卡列表加载失败'));
    } finally {
      setLoading(false);
    }
  }, [filterTextbookId, message]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleUpload(options: UploadRequestOptions): Promise<void> {
    const { file, onError, onSuccess } = options;
    const fileName = getUploadFileName(file);

    setUploading(fileName);

    try {
      if (!(file instanceof Blob)) {
        throw new Error('上传文件无效');
      }

      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
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

  const handleSubmit: FormProps<SessionFormValues>['onFinish'] = async (values) => {
    if (values.textbookId === undefined || values.id === undefined || !values.title?.trim()) {
      message.error('请填写教材 ID、大关卡 ID 和标题');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        textbookId: Number(values.textbookId),
        id: Number(values.id),
        title: values.title.trim(),
        icon: values.icon?.trim() || '',
        sort: values.sort ?? undefined,
      };

      if (sessionModal.mode === 'create') {
        await createSession(payload);
      } else {
        await updateSession(payload);
      }

      message.success(sessionModal.mode === 'create' ? '大关卡创建成功' : '大关卡更新成功');
      sessionModal.setOpen(false);
      await loadSessions();
    } catch (error) {
      message.error(getErrorMessage(error, '大关卡提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(session: SessionRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeSession(Number(session.id));
      message.success('大关卡已删除');
      await loadSessions();
    } catch (error) {
      message.error(getErrorMessage(error, '大关卡删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleStatus(session: SessionRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await changeSessionStatus({
        id: Number(session.id),
        status: Number(session.status) === 1 ? 2 : 1,
      });
      message.success(Number(session.status) === 1 ? '大关卡已禁用' : '大关卡已启用');
      await loadSessions();
    } catch (error) {
      message.error(getErrorMessage(error, '大关卡状态更新失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function openBoundModal(session: SessionRecord): Promise<void> {
    setSelectedSession({
      id: session.id,
      title: session.title,
    });
    setBoundModalOpen(true);

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(session.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? (data as BoundCustomPassRecord[]) : []);
    } catch (error) {
      message.error(getErrorMessage(error, '已绑定小关卡加载失败'));
      setBoundCustomPasses([]);
    }
  }

  async function reloadBoundModal(): Promise<void> {
    if (!selectedSession.id) {
      return;
    }

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(selectedSession.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? (data as BoundCustomPassRecord[]) : []);
    } catch (error) {
      message.error(getErrorMessage(error, '已绑定小关卡加载失败'));
      setBoundCustomPasses([]);
    }
  }

  async function handleBindCustomPass(session: SessionRecord): Promise<void> {
    const targetId = bindSelections[session.id];
    if (!targetId) {
      message.error('请先选择要绑定的小关卡');
      return;
    }

    setActionSubmitting(true);
    try {
      await bindCustomPassToSession({
        textbookId: Number(filterTextbookId),
        sessionId: Number(session.id),
        customPassId: Number(targetId),
      });
      message.success('小关卡绑定成功');
      setBindSelections((current) => ({
        ...current,
        [session.id]: '',
      }));
      await loadSessions();
    } catch (error) {
      message.error(getErrorMessage(error, '小关卡绑定失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleUnbind(item: BoundCustomPassRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await unbindSessionCustomPass(Number(item.id));
      message.success('小关卡已解绑');
      await Promise.all([loadSessions(), reloadBoundModal()]);
    } catch (error) {
      message.error(getErrorMessage(error, '解绑失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBoundSortChange(
    item: BoundCustomPassRecord,
    value: string | number | null | undefined,
  ): Promise<void> {
    if (value === undefined || value === null || value === '') {
      return;
    }

    setActionSubmitting(true);
    try {
      await changeSessionCustomSort({
        id: Number(item.id),
        sort: Number(value),
      });
      message.success('小关卡排序已更新');
      await reloadBoundModal();
    } catch (error) {
      message.error(getErrorMessage(error, '排序更新失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createSessionColumns({
    bindSelections,
    availableCustomPasses,
    filterTextbookId,
    partsId,
    submitting,
    actionSubmitting,
    onBindSelectionChange: (sessionId, value) =>
      setBindSelections((current) => ({
        ...current,
        [sessionId]: value,
      })),
    onBindCustomPass: handleBindCustomPass,
    onOpenBoundModal: openBoundModal,
    onEdit: sessionModal.openEdit,
    onToggleStatus: handleToggleStatus,
    onDelete: handleDelete,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="大关卡管理"
        description="这一页对应旧版 session 管理模块，保留大关卡维护、状态切换，以及与小关卡的绑定关系。"
      />

      <PageToolbarCard>
        <SessionToolbar
          filterTextbookId={filterTextbookId}
          loading={loading}
          onTextbookIdChange={setFilterTextbookId}
          onCreate={sessionModal.openCreate}
          onBack={() => navigate('/books')}
          onRefresh={() => loadSessions()}
        />
      </PageToolbarCard>

      <Card
        title="大关卡列表"
        extra={<Typography.Text type="secondary">当前教材 ID: {filterTextbookId || '-'}，共 {sessions.length} 条记录</Typography.Text>}
      >
        <Table<SessionRecord>
          rowKey="id"
          columns={columns}
          dataSource={sessions}
          loading={loading}
          scroll={{ x: 1460 }}
          pagination={false}
        />
      </Card>

      <SessionModal
        open={sessionModal.open}
        mode={sessionModal.mode}
        form={form}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={sessionModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />

      <BoundCustomPassModal
        open={boundModalOpen}
        selectedSession={selectedSession}
        boundCustomPasses={boundCustomPasses}
        actionSubmitting={actionSubmitting}
        onCancel={() => setBoundModalOpen(false)}
        onSortChange={handleBoundSortChange}
        onUnbind={handleUnbind}
      />
    </div>
  );
}
