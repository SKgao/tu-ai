import { useMemo, useState } from 'react';
import { App, Button, Card, Form, Space, Table, Typography } from 'antd';
import type { FormProps, UploadProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMountEffect } from '@/app/hooks/useMountEffect';
import { useUploadState } from '@/app/hooks/useUploadState';
import { getErrorMessage } from '@/app/lib/errors';
import { useCourseBagDictionary } from '@/app/stores/dictionaries';
import {
  changeCourseBagStatus,
  createCourseBag,
  listCourseBags,
  removeCourseBag,
  uploadAsset,
  updateCourseBag,
} from '@/app/services/course-bags';
import { CourseBagModal } from './components/CourseBagModal';
import { createCourseBagColumns } from './configs/tableColumns';
import { EMPTY_COURSE_BAG_FORM, normalizeCourseBagFormValues } from './utils/forms';
import type { CourseBagFormValues, CourseBagListResult, CourseBagRecord } from './types';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

export function CourseBagManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<CourseBagFormValues>();
  const [bags, setBags] = useState<CourseBagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const { uploadState, resetUploadState, setUploading, setUploadSuccess, setUploadError } =
    useUploadState();
  const bagModal = useFormModal<CourseBagRecord>({
    submitting,
    onOpenCreate: () => {
      resetUploadState();
      form.setFieldsValue({ ...EMPTY_COURSE_BAG_FORM });
    },
    onOpenEdit: (bag) => {
      resetUploadState();
      form.setFieldsValue(normalizeCourseBagFormValues(bag));
    },
  });
  const iconValue = Form.useWatch('icon', form);

  const sortedBags = useMemo(
    () =>
      [...bags].sort((left, right) => {
        const leftSort = Number(left.sort ?? 0);
        const rightSort = Number(right.sort ?? 0);
        return leftSort - rightSort;
      }),
    [bags],
  );

  async function loadBags(): Promise<void> {
    setLoading(true);
    try {
      const data = await listCourseBags();
      setBags(Array.isArray(data) ? (data as CourseBagListResult) : []);
    } catch (error) {
      message.error(getErrorMessage(error, '课程包列表加载失败'));
    } finally {
      setLoading(false);
    }
  }

  useMountEffect(() => {
    loadBags();
  });

  async function handleUpload(options: UploadRequestOptions): Promise<void> {
    const { file, onError, onSuccess } = options;
    // antd 的 customRequest 实际总是传入 File，这里只做类型收窄，不改变运行时行为。
    const uploadFile = file as File;
    setUploading(uploadFile.name);

    try {
      const url = await uploadAsset(uploadFile);
      form.setFieldValue('icon', url);
      setUploadSuccess('上传成功，已自动写入图标地址');
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = getErrorMessage(error, '上传失败');
      setUploadError(errorMessage);
      message.error(errorMessage);
      onError?.(error as Error);
    }
  }

  const handleSubmit: FormProps<CourseBagFormValues>['onFinish'] = async (values) => {
    if (!values.title?.trim()) {
      message.error('请输入课程包名称');
      return;
    }

    setSubmitting(true);
    try {
      if (bagModal.mode === 'create') {
        await createCourseBag({
          title: values.title.trim(),
          icon: values.icon?.trim() || '',
        });
      } else {
        await updateCourseBag({
          id: Number(values.id),
          title: values.title.trim(),
          icon: values.icon?.trim() || '',
          sort: values.sort ?? 0,
        });
      }

      message.success(bagModal.mode === 'create' ? '课程包创建成功' : '课程包更新成功');
      useCourseBagDictionary.getState().invalidate();
      bagModal.setOpen(false);
      await loadBags();
    } catch (error) {
      message.error(getErrorMessage(error, '课程包提交失败'));
    } finally {
      setSubmitting(false);
    }
  };

  async function handleStatusChange(bag: CourseBagRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await changeCourseBagStatus({
        id: Number(bag.id),
        status: Number(bag.status) === 1 ? 2 : 1,
      });
      message.success('课程包状态更新成功');
      useCourseBagDictionary.getState().invalidate();
      await loadBags();
    } catch (error) {
      message.error(getErrorMessage(error, '课程包状态更新失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDelete(bag: CourseBagRecord): Promise<void> {
    setActionSubmitting(true);
    try {
      await removeCourseBag(Number(bag.id));
      message.success('课程包已删除');
      useCourseBagDictionary.getState().invalidate();
      await loadBags();
    } catch (error) {
      message.error(getErrorMessage(error, '课程包删除失败'));
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = createCourseBagColumns({
    onEdit: bagModal.openEdit,
    onToggleStatus: handleStatusChange,
    onDelete: handleDelete,
    submitting: submitting || actionSubmitting,
  });

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="课程包管理"
        description="这一页对应旧版 `courseBag/bags`，保留课程包的新增、编辑、启停和继续钻取课程链路。"
      />

      <PageToolbarCard
        actions={
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={bagModal.openCreate}>
              添加课程包
            </Button>
            <Button onClick={() => loadBags()} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      />

      <Card
        title="课程包列表"
        extra={<Typography.Text type="secondary">共 {sortedBags.length} 条记录</Typography.Text>}
      >
        <Table<CourseBagRecord>
          rowKey="id"
          columns={columns}
          dataSource={sortedBags}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={false}
        />
      </Card>

      <CourseBagModal
        open={bagModal.open}
        mode={bagModal.mode}
        form={form}
        emptyForm={EMPTY_COURSE_BAG_FORM}
        submitting={submitting}
        uploadState={uploadState}
        iconValue={iconValue}
        onCancel={bagModal.close}
        onSubmit={handleSubmit}
        onUpload={handleUpload}
      />
    </div>
  );
}
