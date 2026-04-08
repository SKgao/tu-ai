import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { App, Card, Form, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import {
  createMemberLevel,
  listMemberLevels,
  removeMemberLevel,
  updateMemberLevel,
  uploadAsset,
} from '@/app/services/member-levels';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useUploadState } from '@/app/hooks/useUploadState';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';
import { createMemberLevelColumns } from './configs/tableColumns';
import { MemberLevelHeader } from './components/MemberLevelHeader';
import { MemberLevelModal } from './components/MemberLevelModal';
import {
  EMPTY_LEVEL_FORM,
  normalizeMemberLevelFormValues,
  toAmountCent,
} from './utils/forms';

export function MemberLevelManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const levelModal = useFormModal({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue({ ...EMPTY_LEVEL_FORM });
    },
    onOpenEdit: (level) => {
      resetUploadState();
      form.setFieldsValue(normalizeMemberLevelFormValues(level));
    },
  });
  const refreshMemberLevelResources = useMemberCommerceOptionsStore(
    (state) => state.refreshMemberLevelResources,
  );
  const iconValue = Form.useWatch('icon', form);

  async function loadLevels() {
    setLoading(true);
    try {
      const data = await listMemberLevels();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '会员等级列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLevels();
  }, []);

  async function handleUpload({ file, onError, onSuccess }) {
    setUploading(file.name);

    try {
      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入图标地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
    if (
      levelModal.mode === 'create' &&
      levels.some((item) => Number(item.userLevel) === Number(values.userLevel))
    ) {
      message.error('等级 ID 已存在，请重新输入');
      return;
    }

    const payload = {
      userLevel: Number(values.userLevel),
      levelName: values.levelName.trim(),
      explainInfo: values.explainInfo?.trim() || '',
      exprieDays: values.exprieDays ?? undefined,
      orgMoney: toAmountCent(values.orgMoney),
      needMoney: toAmountCent(values.needMoney),
      icon: values.icon?.trim() || '',
    };

    setSubmitting(true);
    try {
      if (levelModal.mode === 'create') {
        await createMemberLevel(payload);
      } else {
        await updateMemberLevel(payload);
      }

      message.success(levelModal.mode === 'create' ? '会员等级创建成功' : '会员等级更新成功');
      levelModal.setOpen(false);
      await loadLevels();
      await refreshMemberLevelResources().catch(() => {});
    } catch (error) {
      message.error(error?.message || '会员等级提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(level) {
    setActionSubmitting(true);
    try {
      await removeMemberLevel(level.userLevel);
      message.success('会员等级已删除');
      startTransition(() => {
        setLevels((current) => current.filter((item) => item.userLevel !== level.userLevel));
      });
      await loadLevels();
      await refreshMemberLevelResources().catch(() => {});
    } catch (error) {
      message.error(error?.message || '会员等级删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createMemberLevelColumns({
        onEdit: levelModal.openEdit,
        onDelete: handleDelete,
        submitting,
        actionSubmitting,
      }),
    [actionSubmitting, levelModal.openEdit, submitting],
  );

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="会员等级管理"
        description="这一页对应旧版 `memberLevel` 模块，先按新版 antd 组件重构列表、弹窗表单和上传交互。"
      />

      <Card
        title="会员等级列表"
        extra={
          <MemberLevelHeader
            count={levels.length}
            loading={loading}
            onCreate={levelModal.openCreate}
            onRefresh={loadLevels}
          />
        }
      >
        <Table
          rowKey={(row) => row.userLevel}
          columns={columns}
          dataSource={levels}
          loading={loading}
          pagination={false}
        />
      </Card>

      <MemberLevelModal
        open={levelModal.open}
        mode={levelModal.mode}
        form={form}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={levelModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
