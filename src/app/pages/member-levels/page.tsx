import { startTransition, useState } from 'react';
import { App, Card, Form, Table } from 'antd';
import type { FormProps, UploadProps } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useUploadState } from '@/app/hooks/useUploadState';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';
import {
  createMemberLevel,
  listMemberLevels,
  removeMemberLevel,
  updateMemberLevel,
  uploadAsset,
} from '@/app/services/member-levels';
import { createMemberLevelColumns } from './configs/tableColumns';
import { MemberLevelHeader } from './components/MemberLevelHeader';
import { MemberLevelModal } from './components/MemberLevelModal';
import type { MemberLevelFormValues, MemberLevelRecord } from './types';
import {
  EMPTY_LEVEL_FORM,
  normalizeMemberLevelFormValues,
  toAmountCent,
} from './utils/forms';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getUploadFileName(file: unknown): string {
  return typeof file === 'object' && file && 'name' in file && typeof file.name === 'string' ? file.name : '文件';
}

export function MemberLevelManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<MemberLevelFormValues>();
  const [levels, setLevels] = useState<MemberLevelRecord[]>([]);
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
    onOpenEdit: (level: MemberLevelRecord) => {
      resetUploadState();
      form.setFieldsValue(normalizeMemberLevelFormValues(level));
    },
  });
  const refreshMemberLevelResources = useMemberCommerceOptionsStore(
    (state) => state.refreshMemberLevelResources,
  );
  const iconValue = Form.useWatch('icon', form) as string | undefined;

  async function loadLevels(): Promise<void> {
    setLoading(true);
    try {
      const data = await listMemberLevels();
      setLevels(Array.isArray(data) ? (data as MemberLevelRecord[]) : []);
    } catch (loadError) {
      message.error(getErrorMessage(loadError, '会员等级列表加载失败'));
    } finally {
      setLoading(false);
    }
  }

  useMountEffect(() => {
    void loadLevels();
  });

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
      setUploadSuccess('上传成功，已自动写入图标地址');
      onSuccess?.({ url });
    } catch (uploadError) {
      const errorMessage = getErrorMessage(uploadError, '上传失败');
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(uploadError as Error);
    }
  }

  const handleSubmit: FormProps<MemberLevelFormValues>['onFinish'] = async (values) => {
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
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '会员等级提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDelete(level: MemberLevelRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeMemberLevel(Number(level.userLevel));
      message.success('会员等级已删除');
      startTransition(() => {
        setLevels((current) => current.filter((item) => item.userLevel !== level.userLevel));
      });
      await loadLevels();
      await refreshMemberLevelResources().catch(() => {});
    } catch (submitError) {
      message.error(getErrorMessage(submitError, '会员等级删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createMemberLevelColumns({
    onEdit: levelModal.openEdit,
    onDelete: handleDelete,
    submitting,
    actionSubmitting,
  });

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
        <Table<MemberLevelRecord>
          rowKey={(row) => String(row.userLevel)}
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
