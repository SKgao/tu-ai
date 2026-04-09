import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Card, Form, Table, Typography, Space } from 'antd';
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

export function SessionManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const textbookId = searchParams.get('textbookId') || '';
  const partsId = searchParams.get('partsId') || '';
  const [filterTextbookId, setFilterTextbookId] = useState(textbookId);
  const [sessions, setSessions] = useState([]);
  const [availableCustomPasses, setAvailableCustomPasses] = useState([]);
  const [boundCustomPasses, setBoundCustomPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boundModalOpen, setBoundModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState({ id: '', title: '' });
  const [bindSelections, setBindSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const sessionModal = useFormModal({
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
  const iconValue = Form.useWatch('icon', form);

  const loadSessions = useCallback(async (currentTextbookId = filterTextbookId) => {
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
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setAvailableCustomPasses(Array.isArray(customPassData?.data) ? customPassData.data : []);
    } catch (error) {
      message.error(error?.message || '大关卡列表加载失败');
    } finally {
      setLoading(false);
    }
  }, [filterTextbookId, message]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadSuccess('上传成功');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
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
      message.error(error?.message || '大关卡提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(session) {
    setActionSubmitting(true);
    try {
      await removeSession(session.id);
      message.success('大关卡已删除');
      await loadSessions();
    } catch (error) {
      message.error(error?.message || '大关卡删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleStatus(session) {
    setActionSubmitting(true);
    try {
      await changeSessionStatus({
        id: Number(session.id),
        status: session.status === 1 ? 2 : 1,
      });
      message.success(session.status === 1 ? '大关卡已禁用' : '大关卡已启用');
      await loadSessions();
    } catch (error) {
      message.error(error?.message || '大关卡状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function openBoundModal(session) {
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
      setBoundCustomPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '已绑定小关卡加载失败');
      setBoundCustomPasses([]);
    }
  }

  async function reloadBoundModal() {
    if (!selectedSession.id) {
      return;
    }

    try {
      const data = await listSessionCustomPasses({
        textbookId: Number(filterTextbookId),
        sessionId: Number(selectedSession.id),
      });
      setBoundCustomPasses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '已绑定小关卡加载失败');
      setBoundCustomPasses([]);
    }
  }

  async function handleBindCustomPass(session) {
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
      message.error(error?.message || '小关卡绑定失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleUnbind(item) {
    setActionSubmitting(true);
    try {
      await unbindSessionCustomPass(item.id);
      message.success('小关卡已解绑');
      await Promise.all([loadSessions(), reloadBoundModal()]);
    } catch (error) {
      message.error(error?.message || '解绑失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleBoundSortChange(item, value) {
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
      message.error(error?.message || '排序更新失败');
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
        <Table
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
