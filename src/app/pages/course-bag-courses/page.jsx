import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  changeCourseBagCourseStatus,
  createCourseBagCourse,
  listCourseBags,
  removeCourseBagCourse,
  uploadAsset,
  updateCourseBagCourse,
} from '@/app/services/course-bag-courses';
import { createCourseBagCourseColumns } from './configs/tableColumns';

const EMPTY_FORM = {
  id: undefined,
  name: '',
  icon: '',
  sort: undefined,
};

function normalizeFormValues(course) {
  if (!course) {
    return { ...EMPTY_FORM };
  }

  return {
    id: Number(course.id),
    name: course.name || '',
    icon: course.icon || '',
    sort: course.sort !== undefined && course.sort !== null ? Number(course.sort) : undefined,
  };
}

export function CourseBagCourseManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const bagId = searchParams.get('id') || '';
  const bagTitle = searchParams.get('title') || '';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const iconValue = Form.useWatch('icon', form);

  const sortedCourses = useMemo(
    () =>
      [...courses].sort((left, right) => {
        const leftSort = Number(left.sort ?? 0);
        const rightSort = Number(right.sort ?? 0);
        return leftSort - rightSort;
      }),
    [courses],
  );

  async function loadCourses() {
    if (!bagId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const bags = await listCourseBags();
      const currentBag = (Array.isArray(bags) ? bags : []).find((item) => String(item.id) === String(bagId));
      setCourses(Array.isArray(currentBag?.textBookDOS) ? currentBag.textBookDOS : []);
    } catch (error) {
      message.error(error?.message || '课程包课程列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, [bagId]);

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateModal() {
    setModalMode('create');
    resetUploadState();
    form.setFieldsValue({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEditModal(course) {
    setModalMode('edit');
    resetUploadState();
    form.setFieldsValue(normalizeFormValues(course));
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      form.setFieldValue('icon', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入封面地址',
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
    if (!bagId || !values.name?.trim()) {
      message.error('请先确认课程包 ID，并填写课程名称');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createCourseBagCourse({
          bagId: Number(bagId),
          name: values.name.trim(),
          icon: values.icon?.trim() || '',
        });
      } else {
        await updateCourseBagCourse({
          id: Number(values.id),
          name: values.name.trim(),
          icon: values.icon?.trim() || '',
          sort: values.sort ?? 0,
        });
      }

      message.success(modalMode === 'create' ? '课程包课程创建成功' : '课程包课程更新成功');
      setModalOpen(false);
      await loadCourses();
    } catch (error) {
      message.error(error?.message || '课程包课程提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(course) {
    setActionSubmitting(true);
    try {
      await changeCourseBagCourseStatus({
        id: Number(course.id),
        status: Number(course.status) === 1 ? 2 : 1,
      });
      message.success('课程状态更新成功');
      await loadCourses();
    } catch (error) {
      message.error(error?.message || '课程状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDelete(course) {
    setActionSubmitting(true);
    try {
      await removeCourseBagCourse(course.id);
      message.success('课程已删除');
      await loadCourses();
    } catch (error) {
      message.error(error?.message || '课程删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createCourseBagCourseColumns({
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
            课程包课程
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `courseBag/course`，保留课程包内课程的 CRUD、启停和继续钻取活动/教学链路。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--books">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {bagTitle || '未指定课程包'}
            </Typography.Title>
            <Typography.Text type="secondary">当前课程包 ID: {bagId || '-'}</Typography.Text>
          </div>
          <div>
            <Space wrap>
              <Button onClick={() => navigate(-1)}>返回上一页</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} disabled={!bagId}>
                添加课程
              </Button>
              <Button onClick={() => loadCourses()} loading={loading}>
                刷新
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      <Card
        title="课程列表"
        extra={<Typography.Text type="secondary">共 {sortedCourses.length} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sortedCourses}
          loading={loading}
          scroll={{ x: 1240 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增课程包课程' : '编辑课程包课程'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={660}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          {bagTitle ? `当前课程包：${bagTitle}` : '维护课程包里的精品课程。'}
        </Typography.Paragraph>
        <Form form={form} layout="vertical" initialValues={EMPTY_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {modalMode === 'edit' ? (
              <Form.Item label="课程 ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item
              label="课程名称"
              name="name"
              className="form-field--full"
              rules={[{ required: true, message: '请输入课程名称' }]}
            >
              <Input placeholder="请输入课程名称" />
            </Form.Item>
            {modalMode === 'edit' ? (
              <Form.Item label="排序字段" name="sort">
                <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入排序" />
              </Form.Item>
            ) : null}
            <Form.Item label="封面地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传封面" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传课程封面
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传课程封面'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="课程封面"
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
