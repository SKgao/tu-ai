import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Image,
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
import {
  createCourseBagActivity,
  listCourseBagActivities,
  removeCourseBagActivity,
  uploadAsset,
  updateCourseBagActivity,
} from '@/app/services/course-bag-activities';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';
import { createCourseBagActivityColumns } from './configs/tableColumns';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const EMPTY_FORM = {
  id: undefined,
  textbookId: undefined,
  textbookName: '',
  saleBeginAt: undefined,
  saleEndAt: undefined,
  presaleDays: undefined,
  teacher: '',
  status: '1',
  type: '1',
  beginAt: undefined,
  endAt: undefined,
  courseDays: undefined,
  orgAmt: undefined,
  amt: undefined,
  num: undefined,
  chatNo: '',
  iconDetail: '',
  iconTicket: '',
};

function normalizeFormValues(activity) {
  if (!activity) {
    return { ...EMPTY_FORM };
  }

  return {
    id: Number(activity.id || 0) || undefined,
    textbookId: activity.textbookId ? String(activity.textbookId) : undefined,
    textbookName: activity.textbookName || '',
    saleBeginAt: activity.saleBeginAt ? dayjs(fromApiDateTime(activity.saleBeginAt)) : undefined,
    saleEndAt: activity.saleEndAt ? dayjs(fromApiDateTime(activity.saleEndAt)) : undefined,
    presaleDays: undefined,
    teacher: activity.teacher || '',
    status: String(activity.status ?? '1'),
    type: String(activity.type ?? '1'),
    beginAt: activity.beginAt ? dayjs(fromApiDateTime(activity.beginAt)) : undefined,
    endAt: activity.endAt ? dayjs(fromApiDateTime(activity.endAt)) : undefined,
    courseDays: undefined,
    orgAmt:
      activity.orgAmt !== undefined && activity.orgAmt !== null
        ? Number((Number(activity.orgAmt) / 100).toFixed(2))
        : undefined,
    amt:
      activity.amt !== undefined && activity.amt !== null
        ? Number((Number(activity.amt) / 100).toFixed(2))
        : undefined,
    num: activity.num !== undefined && activity.num !== null ? Number(activity.num) : undefined,
    chatNo: activity.chatNo || '',
    iconDetail: activity.iconDetail || '',
    iconTicket: activity.iconTicket || '',
  };
}

function isIntegerValue(value) {
  return /^\d+$/.test(String(value));
}

export function CourseBagActivityManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const courseId = searchParams.get('id') || '';
  const courseName = searchParams.get('courseName') || '';
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    iconDetail: { uploading: false, message: '' },
    iconTicket: { uploading: false, message: '' },
  });
  const courseOptions = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const courseType = Form.useWatch('type', form) || '1';
  const detailValue = Form.useWatch('iconDetail', form);
  const ticketValue = Form.useWatch('iconTicket', form);

  async function loadActivities() {
    if (!courseId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listCourseBagActivities(courseId);
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '课程活动列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ensureCourseOptions().catch((error) => {
      message.error(error?.message || '课程选项加载失败');
    });
  }, [ensureCourseOptions]);

  useEffect(() => {
    loadActivities();
  }, [courseId]);

  function resetUploadState() {
    setUploadState({
      iconDetail: { uploading: false, message: '' },
      iconTicket: { uploading: false, message: '' },
    });
  }

  function openCreateModal() {
    setModalMode('create');
    resetUploadState();
    form.setFieldsValue({
      ...EMPTY_FORM,
      textbookId: courseId ? String(courseId) : undefined,
    });
    setModalOpen(true);
  }

  function openEditModal(activity) {
    setModalMode('edit');
    resetUploadState();
    form.setFieldsValue(normalizeFormValues(activity));
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  async function handleUpload(field, { file, onError, onSuccess }) {
    setUploadState((current) => ({
      ...current,
      [field]: {
        uploading: true,
        message: `${file.name} 上传中...`,
      },
    }));

    try {
      const url = await uploadAsset(file);
      form.setFieldValue(field, url);
      setUploadState((current) => ({
        ...current,
        [field]: {
          uploading: false,
          message: '上传成功，已自动写入地址',
        },
      }));
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadState((current) => ({
        ...current,
        [field]: {
          uploading: false,
          message: errorMessage,
        },
      }));
      message.error(errorMessage);
      onError?.(error);
    }
  }

  function validateCreateForm(values) {
    if (
      values.id === undefined ||
      !values.textbookId ||
      !values.saleBeginAt ||
      values.presaleDays === undefined ||
      !values.teacher?.trim() ||
      values.orgAmt === undefined ||
      values.amt === undefined ||
      values.num === undefined
    ) {
      return '请完整填写活动 ID、课程、预售时间、教师、金额和数量';
    }

    if (!isIntegerValue(values.id) || !isIntegerValue(values.textbookId)) {
      return '活动 ID 和课程 ID 必须为整数';
    }

    if (!isIntegerValue(values.presaleDays)) {
      return '预售持续天数必须为整数';
    }

    if (Number(values.type) === 1) {
      if (!values.beginAt || values.courseDays === undefined) {
        return '统一开课模式必须填写开课时间和持续天数';
      }

      if (!isIntegerValue(values.courseDays)) {
        return '开课持续天数必须为整数';
      }
    }

    if (Number.isNaN(Number(values.orgAmt)) || Number.isNaN(Number(values.amt))) {
      return '金额必须为数字';
    }

    if (!isIntegerValue(values.num)) {
      return '课程数量必须为整数';
    }

    return '';
  }

  function validateEditForm(values) {
    if (
      values.id === undefined ||
      !values.saleBeginAt ||
      !values.saleEndAt ||
      !values.teacher?.trim() ||
      values.orgAmt === undefined ||
      values.amt === undefined ||
      values.num === undefined
    ) {
      return '请完整填写活动时间、教师、金额和数量';
    }

    if (Number.isNaN(Number(values.orgAmt)) || Number.isNaN(Number(values.amt))) {
      return '金额必须为数字';
    }

    if (!isIntegerValue(values.num)) {
      return '课程数量必须为整数';
    }

    const saleBeginAt = dayjs(values.saleBeginAt);
    const saleEndAt = dayjs(values.saleEndAt);

    if (saleBeginAt.isAfter(saleEndAt)) {
      return '预售开始时间不能大于预售结束时间';
    }

    if (Number(values.type) === 1) {
      if (!values.beginAt || !values.endAt) {
        return '统一开课模式必须填写开课和结课时间';
      }

      const beginAt = dayjs(values.beginAt);
      const endAt = dayjs(values.endAt);

      if (beginAt.isAfter(endAt)) {
        return '开课时间不能大于结课时间';
      }
    }

    return '';
  }

  async function handleSubmit(values) {
    const errorMessage = modalMode === 'create' ? validateCreateForm(values) : validateEditForm(values);

    if (errorMessage) {
      message.error(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const saleBeginAt = dayjs(values.saleBeginAt);
        const payload = {
          id: Number(values.id),
          textbookId: Number(values.textbookId),
          saleBeginAt: toApiDateTime(values.saleBeginAt),
          saleEndAt: saleBeginAt.add(Number(values.presaleDays), 'day').format('YYYY-MM-DD HH:mm:ss'),
          teacher: values.teacher.trim(),
          status: Number(values.status),
          type: Number(values.type),
          orgAmt: Math.round(Number(values.orgAmt) * 100),
          amt: Math.round(Number(values.amt) * 100),
          num: Number(values.num),
          chatNo: values.chatNo?.trim() || '',
          iconDetail: values.iconDetail?.trim() || '',
          iconTicket: values.iconTicket?.trim() || '',
        };

        if (Number(values.type) === 1) {
          const beginAt = dayjs(values.beginAt);
          payload.beginAt = toApiDateTime(values.beginAt);
          payload.endAt = beginAt.add(Number(values.courseDays), 'day').format('YYYY-MM-DD HH:mm:ss');
        } else {
          payload.beginAt = '';
          payload.endAt = '';
        }

        await createCourseBagActivity(payload);
      } else {
        const payload = {
          id: Number(values.id),
          textbookName: values.textbookName?.trim() || '',
          teacher: values.teacher.trim(),
          saleBeginAt: toApiDateTime(values.saleBeginAt),
          saleEndAt: toApiDateTime(values.saleEndAt),
          status: Number(values.status),
          type: Number(values.type),
          orgAmt: Math.round(Number(values.orgAmt) * 100),
          amt: Math.round(Number(values.amt) * 100),
          num: Number(values.num),
          chatNo: values.chatNo?.trim() || '',
          iconDetail: values.iconDetail?.trim() || '',
          iconTicket: values.iconTicket?.trim() || '',
        };

        if (Number(values.type) === 1) {
          payload.beginAt = toApiDateTime(values.beginAt);
          payload.endAt = toApiDateTime(values.endAt);
        } else {
          payload.beginAt = '';
          payload.endAt = '';
        }

        await updateCourseBagActivity(payload);
      }

      message.success(modalMode === 'create' ? '课程活动创建成功' : '课程活动更新成功');
      setModalOpen(false);
      await loadActivities();
    } catch (error) {
      message.error(error?.message || '课程活动提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(activity) {
    setActionSubmitting(true);
    try {
      await removeCourseBagActivity(activity.id);
      message.success('课程活动已删除');
      await loadActivities();
    } catch (error) {
      message.error(error?.message || '课程活动删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createCourseBagActivityColumns({
        onEdit: openEditModal,
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
            课程包活动
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `courseBag/activity`，保留活动新增、编辑、删除，以及课程活动时间与金额配置。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--books">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {courseName || '未指定课程'}
            </Typography.Title>
            <Typography.Text type="secondary">当前课程 ID: {courseId || '-'}</Typography.Text>
          </div>
          <div>
            <Space wrap>
              <Button onClick={() => navigate(-1)}>返回上一页</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} disabled={!courseId}>
                添加课程活动
              </Button>
              <Button onClick={() => loadActivities()} loading={loading}>
                刷新
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      <Card
        title="活动列表"
        extra={<Typography.Text type="secondary">共 {activities.length} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={activities}
          loading={loading}
          scroll={{ x: 1680 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增课程活动' : '编辑课程活动'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={920}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          对齐旧版 `courseBag/activity` 的活动配置字段和课程挂接能力。
        </Typography.Paragraph>
        <Form form={form} layout="vertical" initialValues={EMPTY_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            <Form.Item
              label="活动 ID"
              name="id"
              rules={[{ required: true, message: '请输入活动 ID' }]}
            >
              <InputNumber disabled={modalMode !== 'create'} precision={0} style={{ width: '100%' }} placeholder="请输入活动 ID" />
            </Form.Item>
            <Form.Item label="课程" name={modalMode === 'create' ? 'textbookId' : 'textbookName'}>
              {modalMode === 'create' ? (
                <Select
                  placeholder="请选择课程"
                  options={courseOptions.map((item) => ({
                    value: String(item.textbookId),
                    label: item.textbookName,
                  }))}
                />
              ) : (
                <Input placeholder="请输入课程名称" />
              )}
            </Form.Item>
            <Form.Item label="辅导老师" name="teacher" rules={[{ required: true, message: '请输入辅导老师' }]}>
              <Input placeholder="请输入辅导老师" />
            </Form.Item>
            <Form.Item label="课程状态" name="status">
              <Select
                options={[
                  { value: '1', label: '正常' },
                  { value: '2', label: '下架' },
                ]}
              />
            </Form.Item>
            <Form.Item label="开课方式" name="type">
              <Select
                options={[
                  { value: '1', label: '统一开课' },
                  { value: '2', label: '购买生效' },
                  { value: '3', label: '闯关解锁' },
                ]}
              />
            </Form.Item>
            <Form.Item label="预售开始时间" name="saleBeginAt" rules={[{ required: true, message: '请选择预售开始时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            {modalMode === 'create' ? (
              <Form.Item label="预售持续天数" name="presaleDays">
                <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入持续天数" />
              </Form.Item>
            ) : (
              <Form.Item label="预售结束时间" name="saleEndAt" rules={[{ required: true, message: '请选择预售结束时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            )}
            {Number(courseType) === 1 ? (
              <>
                <Form.Item label="开课时间" name="beginAt" rules={[{ required: true, message: '请选择开课时间' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                {modalMode === 'create' ? (
                  <Form.Item label="开课持续天数" name="courseDays">
                    <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入持续天数" />
                  </Form.Item>
                ) : (
                  <Form.Item label="结课时间" name="endAt" rules={[{ required: true, message: '请选择结课时间' }]}>
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                )}
              </>
            ) : null}
            <Form.Item label="原始金额" name="orgAmt" rules={[{ required: true, message: '请输入原始金额' }]}>
              <Space.Compact block>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="单位元" />
                <div className="compact-addon">元</div>
              </Space.Compact>
            </Form.Item>
            <Form.Item label="实际金额" name="amt" rules={[{ required: true, message: '请输入实际金额' }]}>
              <Space.Compact block>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="单位元" />
                <div className="compact-addon">元</div>
              </Space.Compact>
            </Form.Item>
            <Form.Item label="课程数量" name="num" rules={[{ required: true, message: '请输入课程数量' }]}>
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入课程数量" />
            </Form.Item>
            <Form.Item label="微信号" name="chatNo">
              <Input placeholder="可选" />
            </Form.Item>
            <Form.Item label="详情图地址" name="iconDetail" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传详情图" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={(options) => handleUpload('iconDetail', options)}
                  disabled={uploadState.iconDetail.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.iconDetail.uploading}>
                    上传详情图
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.iconDetail.uploading
                    ? '上传中...'
                    : uploadState.iconDetail.message || '支持上传详情图'}
                </Typography.Text>
                {detailValue ? (
                  <Image
                    width={108}
                    height={108}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={detailValue}
                    alt="详情图"
                  />
                ) : null}
              </Space>
            </Form.Item>
            <Form.Item label="优惠券图地址" name="iconTicket" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传优惠券图" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={(options) => handleUpload('iconTicket', options)}
                  disabled={uploadState.iconTicket.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.iconTicket.uploading}>
                    上传优惠券图
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.iconTicket.uploading
                    ? '上传中...'
                    : uploadState.iconTicket.message || '支持上传优惠券图'}
                </Typography.Text>
                {ticketValue ? (
                  <Image
                    width={108}
                    height={108}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={ticketValue}
                    alt="优惠券图"
                  />
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
