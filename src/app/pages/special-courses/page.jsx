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
  createSpecialCourse,
  downSpecialCourse,
  listBoughtSpecialCourses,
  listSpecialCourses,
  listBooks,
  removeSpecialCourse,
  uploadAsset,
  updateSpecialCourse,
  upSpecialCourse,
} from '@/app/services/special-courses';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';
import { createSpecialCourseColumns } from './configs/tableColumns';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';

const EMPTY_FORM = {
  textbookId: undefined,
  textbookName: '',
  teacher: '',
  saleBeginAt: undefined,
  saleEndAt: undefined,
  type: '1',
  beginAt: undefined,
  endAt: undefined,
  orgAmt: undefined,
  amt: undefined,
  num: undefined,
  chatNo: '',
  iconDetail: '',
  iconTicket: '',
  status: '1',
};

const INITIAL_FILTERS = {
  startTime: undefined,
  endTime: undefined,
};

const INITIAL_QUERY = {
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 20,
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

function buildPayload(values, { allowTextbookIdEdit }) {
  const payload = {
    textbookName: values.textbookName.trim(),
    teacher: values.teacher.trim(),
    saleBeginAt: toApiDateTime(values.saleBeginAt),
    saleEndAt: toApiDateTime(values.saleEndAt),
    type: Number(values.type),
    orgAmt: Math.round(Number(values.orgAmt) * 100),
    amt: Math.round(Number(values.amt) * 100),
    num: Number(values.num),
    chatNo: values.chatNo?.trim() || '',
    iconDetail: values.iconDetail?.trim() || '',
    iconTicket: values.iconTicket?.trim() || '',
    status: Number(values.status),
  };

  if (allowTextbookIdEdit) {
    payload.textbookId = Number(values.textbookId);
  }

  if (Number(values.type) === 1) {
    payload.beginAt = toApiDateTime(values.beginAt);
    payload.endAt = toApiDateTime(values.endAt);
  } else {
    payload.beginAt = '';
    payload.endAt = '';
  }

  return payload;
}

function validateForm(values) {
  if (
    !values.textbookId ||
    !values.textbookName?.trim() ||
    !values.teacher?.trim() ||
    !values.saleBeginAt ||
    !values.saleEndAt ||
    values.orgAmt === undefined ||
    values.amt === undefined ||
    values.num === undefined
  ) {
    return '请完整填写课程、教师、预售时间、金额和数量';
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

function normalizeFormValues(course) {
  if (!course) {
    return { ...EMPTY_FORM };
  }

  return {
    textbookId: String(course.textbookId || ''),
    textbookName: course.textbookName || '',
    teacher: course.teacher || '',
    saleBeginAt: course.saleBeginAt ? dayjs(fromApiDateTime(course.saleBeginAt)) : undefined,
    saleEndAt: course.saleEndAt ? dayjs(fromApiDateTime(course.saleEndAt)) : undefined,
    type: String(course.type ?? '1'),
    beginAt: course.beginAt ? dayjs(fromApiDateTime(course.beginAt)) : undefined,
    endAt: course.endAt ? dayjs(fromApiDateTime(course.endAt)) : undefined,
    orgAmt:
      course.orgAmt !== undefined && course.orgAmt !== null
        ? Number((Number(course.orgAmt) / 100).toFixed(2))
        : undefined,
    amt:
      course.amt !== undefined && course.amt !== null
        ? Number((Number(course.amt) / 100).toFixed(2))
        : undefined,
    num: course.num !== undefined && course.num !== null ? Number(course.num) : undefined,
    chatNo: course.chatNo || '',
    iconDetail: course.iconDetail || '',
    iconTicket: course.iconTicket || '',
    status: String(course.status ?? '1'),
  };
}

export function SpecialCourseManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [books, setBooks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    iconDetail: { uploading: false, message: '' },
    iconTicket: { uploading: false, message: '' },
  });
  const userId = searchParams.get('userId') || '';
  const refreshCourseOptions = useMemberCommerceOptionsStore((state) => state.refreshCourseOptions);
  const courseType = Form.useWatch('type', modalForm) || '1';
  const detailValue = Form.useWatch('iconDetail', modalForm);
  const ticketValue = Form.useWatch('iconTicket', modalForm);
  const {
    query,
    data: courses,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: async (currentQuery) => {
      if (userId) {
        const data = await listBoughtSpecialCourses(userId);
        const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        return {
          data: items,
          totalCount: typeof data?.totalCount === 'number' ? data.totalCount : items.length,
        };
      }

      return listSpecialCourses(currentQuery);
    },
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '精品课程列表加载失败'),
  });

  useEffect(() => {
    async function loadBooksData() {
      try {
        const data = await listBooks({
          pageNum: 1,
          pageSize: 1000,
        });
        setBooks(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(error?.message || '课程教材列表加载失败');
      }
    }

    loadBooksData();
  }, [message]);

  function resetUploadState() {
    setUploadState({
      iconDetail: { uploading: false, message: '' },
      iconTicket: { uploading: false, message: '' },
    });
  }

  function openCreateModal() {
    setModalMode('create');
    resetUploadState();
    modalForm.setFieldsValue(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(course) {
    setModalMode('edit');
    resetUploadState();
    modalForm.setFieldsValue(normalizeFormValues(course));
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
      modalForm.setFieldValue(field, url);
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

  async function handleSubmit(values) {
    const errorMessage = validateForm(values);
    if (errorMessage) {
      message.error(errorMessage);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(values, {
        allowTextbookIdEdit: modalMode === 'create',
      });

      if (modalMode === 'create') {
        await createSpecialCourse(payload);
      } else {
        await updateSpecialCourse({
          ...payload,
          textbookId: Number(values.textbookId),
        });
      }

      message.success(modalMode === 'create' ? '精品课程创建成功' : '精品课程更新成功');
      setModalOpen(false);
      await reload().catch(() => {});
      await refreshCourseOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '精品课程提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(course) {
    setActionSubmitting(true);
    try {
      await removeSpecialCourse(course.textbookId);
      message.success('精品课程已删除');
      await reload().catch(() => {});
      await refreshCourseOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '精品课程删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleStatusChange(course) {
    setActionSubmitting(true);
    try {
      if (Number(course.status) === 1) {
        await downSpecialCourse(course.textbookId);
      } else {
        await upSpecialCourse(course.textbookId);
      }
      message.success('课程状态更新成功');
      await reload().catch(() => {});
      await refreshCourseOptions().catch(() => {});
    } catch (error) {
      message.error(error?.message || '课程状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createSpecialCourseColumns({
        onEdit: openEditModal,
        onToggleStatus: handleStatusChange,
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
            精品课程
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            对应旧版 `specialCourse`。先按新版 antd 组件重构课程筛选、列表、上下架和课程配置弹窗。
          </Typography.Paragraph>
        </Space>
      </Card>

      {!userId ? (
        <Card>
          <Form form={searchForm} layout="vertical" initialValues={INITIAL_FILTERS} onFinish={handleSearch}>
            <div className="toolbar-grid toolbar-grid--books">
              <Form.Item label="预售开始时间" name="startTime">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="预售结束时间" name="endTime">
                <DatePicker showTime style={{ width: '100%' }} />
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
                    添加精品课程
                  </Button>
                  <Button onClick={() => reload().catch(() => {})} loading={loading}>
                    刷新
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
        </Card>
      ) : (
        <Card
          title="已买课程视图"
          extra={
            <Space wrap>
              <Typography.Text type="secondary">当前用户 ID: {userId}</Typography.Text>
              <Button onClick={() => navigate(-1)}>返回上一页</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                添加精品课程
              </Button>
            </Space>
          }
        />
      )}

      <Card
        title="课程列表"
        extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}
      >
        <Table
          rowKey={(row) => `${row.textbookId}-${row.id || row.textbookName || ''}`}
          columns={columns}
          dataSource={courses}
          loading={loading}
          scroll={{ x: 1680 }}
          pagination={
            !userId
              ? buildAntdTablePagination({
                  query,
                  totalCount,
                  pageSizeOptions: PAGE_SIZE_OPTIONS,
                  setPageNum,
                  setPageSize,
                })
              : false
          }
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增精品课程' : '编辑精品课程'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => modalForm.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={860}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          保留旧版 `specialCourse` 的课程配置、上下架和已购课程查看能力。
        </Typography.Paragraph>
        <Form form={modalForm} layout="vertical" initialValues={EMPTY_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            <Form.Item label="课程 ID" name="textbookId" rules={[{ required: true, message: '请选择课程' }]}>
              <Select
                disabled={modalMode === 'edit'}
                placeholder="请选择课程"
                options={books.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="课程名称" name="textbookName" rules={[{ required: true, message: '请输入课程名称' }]}>
              <Input placeholder="请输入课程名称" />
            </Form.Item>
            <Form.Item label="辅导老师" name="teacher" rules={[{ required: true, message: '请输入辅导老师' }]}>
              <Input placeholder="请输入辅导老师" />
            </Form.Item>
            <Form.Item label="课程状态" name="status" rules={[{ required: true, message: '请选择课程状态' }]}>
              <Select
                options={[
                  { value: '1', label: '正常' },
                  { value: '2', label: '下架' },
                ]}
              />
            </Form.Item>
            <Form.Item label="预售开始时间" name="saleBeginAt" rules={[{ required: true, message: '请选择预售开始时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="预售结束时间" name="saleEndAt" rules={[{ required: true, message: '请选择预售结束时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="开课方式" name="type" rules={[{ required: true, message: '请选择开课方式' }]}>
              <Select
                options={[
                  { value: '1', label: '统一开课' },
                  { value: '2', label: '购买生效' },
                ]}
              />
            </Form.Item>
            {Number(courseType) === 1 ? (
              <>
                <Form.Item label="开课时间" name="beginAt" rules={[{ required: true, message: '请选择开课时间' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="结课时间" name="endAt" rules={[{ required: true, message: '请选择结课时间' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
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
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入课程数量" />
            </Form.Item>
            <Form.Item label="微信号" name="chatNo">
              <Input placeholder="可选" />
            </Form.Item>

            <Form.Item label="详情图片地址" name="iconDetail">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="优惠券图地址" name="iconTicket">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>

            <Form.Item label="上传详情图片" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={(options) => handleUpload('iconDetail', options)}
                  disabled={uploadState.iconDetail.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.iconDetail.uploading}>
                    上传详情图片
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.iconDetail.uploading
                    ? '上传中...'
                    : uploadState.iconDetail.message || '支持上传图片'}
                </Typography.Text>
                {detailValue ? (
                  <Image width={96} height={96} style={{ borderRadius: 20, objectFit: 'cover' }} src={detailValue} alt="详情图片" />
                ) : null}
              </Space>
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
                    : uploadState.iconTicket.message || '支持上传图片'}
                </Typography.Text>
                {ticketValue ? (
                  <Image width={96} height={96} style={{ borderRadius: 20, objectFit: 'cover' }} src={ticketValue} alt="优惠券图" />
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
