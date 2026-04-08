import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Card, Form, Space, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import {
  createPart,
  listParts,
  removePart,
  updatePart,
  uploadAsset,
} from '@/app/services/parts';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { useUploadState } from '@/app/hooks/useUploadState';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { PartModal } from './components/PartModal';
import { PartToolbar } from './components/PartToolbar';
import { createPartColumns } from './configs/tableColumns';
import {
  PAGE_SIZE_OPTIONS,
  normalizePartFormValues,
} from './utils/forms';

export function PartManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const unitId = searchParams.get('unitId') || '';
  const textBookId = searchParams.get('textBookId') || '';
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const partModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue(normalizePartFormValues(null, unitId));
    },
    onOpenEdit: (part) => {
      resetUploadState();
      form.setFieldsValue(normalizePartFormValues(part, unitId));
    },
  });
  const iconValue = Form.useWatch('icon', form);
  const {
    query,
    data: parts,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      unitId,
      pageNum: 1,
      pageSize: 10,
    },
    request: listParts,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || 'Part 列表加载失败'),
  });

  async function handleUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入图片地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
    if (!values.title?.trim() || values.unitsId === undefined) {
      message.error('请填写 Part 名称并输入单元 ID');
      return;
    }

    const payload = {
      title: values.title.trim(),
      icon: values.icon?.trim() || '',
      unitsId: Number(values.unitsId),
      tips: values.tips?.trim() || '',
      sort: values.sort ?? undefined,
    };

    setSubmitting(true);
    try {
      if (partModal.mode === 'create') {
        await createPart(payload);
      } else {
        await updatePart({
          ...payload,
          id: Number(values.id),
          canLock: values.canLock ? Number(values.canLock) : undefined,
        });
      }

      message.success(partModal.mode === 'create' ? 'Part 创建成功' : 'Part 更新成功');
      partModal.setOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || 'Part 提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(part) {
    setActionSubmitting(true);
    try {
      await removePart(part.id);
      message.success('Part 已删除');
      if (parts.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || 'Part 删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleLock(part) {
    setActionSubmitting(true);
    try {
      await updatePart({
        id: part.id,
        canLock: part.canLock === 1 ? 2 : 1,
      });
      message.success(part.canLock === 1 ? 'Part 已锁定' : 'Part 已解锁');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || 'Part 锁定状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createPartColumns({
        textBookId,
        onEdit: partModal.openEdit,
        onToggleLock: handleToggleLock,
        onDelete: handleDelete,
        submitting,
        actionSubmitting,
      }),
    [actionSubmitting, partModal.openEdit, submitting, textBookId],
  );

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="Part 管理"
        description="这一页对应旧版 part 管理模块，保留分页、增改删、图片上传和锁定能力。"
      />

      <PageToolbarCard>
        <PartToolbar
          unitId={query.unitId}
          textBookId={textBookId}
          loading={loading}
          onCreate={partModal.openCreate}
          onBack={() => navigate(textBookId ? `/units?textbookId=${textBookId}` : '/units')}
          onRefresh={() => reload().catch(() => {})}
        />
      </PageToolbarCard>

      <Card title="Part 列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={parts}
          loading={loading}
          scroll={{ x: 1080 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <PartModal
        open={partModal.open}
        mode={partModal.mode}
        form={form}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={partModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
