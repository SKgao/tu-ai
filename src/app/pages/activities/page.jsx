import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useShallow } from 'zustand/react/shallow';
import {
  changeActivityStatus,
  createActivity,
  listActivities,
  removeActivity,
  uploadAsset,
  updateActivity,
} from '@/app/services/activities';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';
import { createActivityColumns } from './configs/tableColumns';
import {
  selectActivityFormOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const EMPTY_ACTIVITY_FORM = {
  id: undefined,
  title: '',
  content: '',
  icon: '',
  activeMoney: undefined,
  status: '1',
  itemId: undefined,
  activeExpireDays: undefined,
  beginAt: undefined,
  endAt: undefined,
  url: '',
};

const INITIAL_FILTERS = {
  startTime: undefined,
  endTime: undefined,
  id: undefined,
};

const INITIAL_QUERY = {
  startTime: '',
  endTime: '',
  id: '',
  pageNum: 1,
  pageSize: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function normalizeActivityFormValues(activity) {
  if (!activity) {
    return { ...EMPTY_ACTIVITY_FORM };
  }

  return {
    id: Number(activity.id),
    title: activity.title || '',
    content: activity.content || '',
    icon: activity.icon || '',
    activeMoney:
      activity.activeMoney !== undefined && activity.activeMoney !== null
        ? Number((Number(activity.activeMoney) / 100).toFixed(2))
        : undefined,
    status: String(activity.status ?? '1'),
    itemId:
      activity.itemId !== undefined && activity.itemId !== null ? String(activity.itemId) : undefined,
    activeExpireDays:
      activity.activeExpireDays !== undefined && activity.activeExpireDays !== null
        ? Number(activity.activeExpireDays)
        : undefined,
    beginAt: activity.beginAt ? dayjs(fromApiDateTime(activity.beginAt)) : undefined,
    endAt: activity.endAt ? dayjs(fromApiDateTime(activity.endAt)) : undefined,
    url: activity.url || '',
  };
}

export function ActivityManagementPage() {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const { activityOptions, memberLevels } = useMemberCommerceOptionsStore(
    useShallow(selectActivityFormOptions),
  );
  const ensureActivityFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureActivityFilterOptions,
  );
  const refreshActivityFilterOptions = useMemberCommerceOptionsStore(
    (state) => state.refreshActivityFilterOptions,
  );
  const iconValue = Form.useWatch('icon', modalForm);
  const activityType = Form.useWatch('status', modalForm) || '1';
  const {
    query,
    data: activities,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: listActivities,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '活动列表加载失败'),
  });

  useEffect(() => {
    ensureActivityFilterOptions().catch((error) => {
      message.error(error?.message || '活动筛选项加载失败');
    });
  }, [ensureActivityFilterOptions, message]);

  function openCreateModal() {
    setModalMode('create');
    setUploadState({
      uploading: false,
      message: '',
    });
    modalForm.setFieldsValue(EMPTY_ACTIVITY_FORM);
    setModalOpen(true);
  }

  function openEditModal(activity) {
    setModalMode('edit');
    setUploadState({
      uploading: false,
      message: '',
    });
    modalForm.setFieldsValue(normalizeActivityFormValues(activity));
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  function handleSearch(values) {
    applyFilters({
      startTime: toApiDateTime(values.startTime),
      endTime: toApiDateTime(values.endTime),
      id: values.id || '',
    });
  }

  function handleReset() {
    searchForm.resetFields();
    applyFilters({
      ...INITIAL_QUERY,
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      modalForm.setFieldValue('icon', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入图片地址',
      });
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadState({
        uploading: false,
        message: errorMessage,
      });
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleSubmit(values) {
    if (!values.title?.trim() || !values.beginAt || !values.endAt) {
      message.error('请填写活动标题并选择开始/结束时间');
      return;
    }

    const beginAt = dayjs(values.beginAt);
    const endAt = dayjs(values.endAt);

    if (beginAt.isAfter(endAt)) {
      message.error('活动开始时间不能大于结束时间');
      return;
    }

    const isPurchaseActivity = String(values.status) === '1';

    if (isPurchaseActivity && !values.itemId) {
      message.error('购买活动必须选择参与活动商品');
      return;
    }

    const diffDays = Math.floor(endAt.diff(beginAt, 'day', true));
    const payload = {
      title: values.title.trim(),
      content: values.content?.trim() || '',
      icon: values.icon?.trim() || '',
      url: values.url?.trim() || '',
      status: Number(values.status),
      beginAt: toApiDateTime(values.beginAt),
      endAt: toApiDateTime(values.endAt),
      activeExpireDays:
        modalMode === 'create' ? diffDays : values.activeExpireDays ? Number(values.activeExpireDays) : undefined,
      itemId: isPurchaseActivity && values.itemId ? Number(values.itemId) : undefined,
      activeMoney:
        isPurchaseActivity && values.activeMoney !== undefined
          ? Math.round(Number(values.activeMoney) * 100)
          : undefined,
    };

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createActivity(payload);
      } else {
        await updateActivity({
          ...payload,
          id: Number(values.id),
        });
      }

      message.success(modalMode === 'create' ? '活动创建成功' : '活动更新成功');
      setModalOpen(false);
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '活动提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(activity) {
    setActionSubmitting(true);
    try {
      await removeActivity(activity.id);
      message.success('活动已删除');
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '活动删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleChangeStatus(activity, status) {
    setActionSubmitting(true);
    try {
      await changeActivityStatus({
        id: Number(activity.id),
        status: Number(status),
      });
      message.success('活动状态更新成功');
      await reload().catch(() => {});
      await refreshActivityFilterOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '活动状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createActivityColumns({
        onEdit: openEditModal,
        onToggleStatus: handleChangeStatus,
        onDelete: handleDelete,
        submitting: submitting || actionSubmitting,
      }),
    [actionSubmitting, submitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            活动管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `activity` 模块，先按新版 antd 组件重构筛选、列表、增改删和状态切换。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form form={searchForm} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={handleSearch}>
          <div className="toolbar-grid toolbar-grid--books">
            <Form.Item label="活动开始时间" name="startTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="活动结束时间" name="endTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="活动筛选" name="id">
              <Select
                allowClear
                placeholder="全部"
                options={activityOptions.map((item) => ({
                  value: String(item.id),
                  label: item.title,
                }))}
              />
            </Form.Item>
            <Form.Item label=" ">
              <Space wrap>
                <Button type="primary" htmlType="submit" loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset} disabled={loading}>
                  重置
                </Button>
                <Button type="primary" ghost icon={<PlusOutlined />} onClick={openCreateModal}>
                  添加活动
                </Button>
                <Button onClick={() => reload().catch(() => {})} loading={loading}>
                  刷新
                </Button>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title="活动列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={activities}
          loading={loading}
          scroll={{ x: 1260 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增活动' : '编辑活动'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => modalForm.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={800}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护活动标题、时间、金额、参与商品和链接信息。
        </Typography.Paragraph>
        <Form form={modalForm} layout="vertical" initialValues={EMPTY_ACTIVITY_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            <Form.Item label="活动标题" name="title" rules={[{ required: true, message: '请输入活动标题' }]}>
              <Input placeholder="请输入活动标题" />
            </Form.Item>
            <Form.Item label="活动类型" name="status" rules={[{ required: true, message: '请选择活动类型' }]}>
              <Select
                disabled={modalMode === 'edit'}
                options={[
                  { value: '1', label: '购买活动' },
                  { value: '2', label: '分享活动' },
                ]}
              />
            </Form.Item>
            <Form.Item label="活动开始时间" name="beginAt" rules={[{ required: true, message: '请选择活动开始时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="活动结束时间" name="endAt" rules={[{ required: true, message: '请选择活动结束时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            {modalMode === 'edit' ? (
              <Form.Item label="活动持续时间" name="activeExpireDays">
                <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入活动持续天数" />
              </Form.Item>
            ) : null}
            {String(activityType) === '1' ? (
              <>
                <Form.Item label="参与活动商品" name="itemId" rules={[{ required: true, message: '请选择会员等级' }]}>
                  <Select
                    placeholder="请选择会员等级"
                    options={memberLevels.map((item) => ({
                      value: String(item.userLevel),
                      label: item.levelName,
                    }))}
                  />
                </Form.Item>
                <Form.Item label="活动价格" name="activeMoney">
                  <Space.Compact block>
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入活动价格" />
                    <div className="compact-addon">元</div>
                  </Space.Compact>
                </Form.Item>
              </>
            ) : null}
            <Form.Item label="活动内容" name="content" className="form-field--full">
              <Input.TextArea rows={4} placeholder="请输入活动内容" />
            </Form.Item>
            <Form.Item label="活动图片地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传活动图片" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传活动封面
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传活动封面'}
                </Typography.Text>
                {iconValue ? (
                  <img src={iconValue} alt="活动图片" className="avatar-preview__image" />
                ) : null}
              </Space>
            </Form.Item>
            <Form.Item label="活动链接" name="url" className="form-field--full">
              <Input placeholder="请输入活动链接" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
