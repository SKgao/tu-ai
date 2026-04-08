import React, { useEffect, useMemo, useState } from 'react';
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
  changeCourseBagStatus,
  createCourseBag,
  listCourseBags,
  removeCourseBag,
  uploadAsset,
  updateCourseBag,
} from '@/app/services/course-bags';
import { createCourseBagColumns } from './configs/tableColumns';

const EMPTY_FORM = {
  id: undefined,
  title: '',
  icon: '',
  sort: undefined,
};

function normalizeFormValues(bag) {
  if (!bag) {
    return { ...EMPTY_FORM };
  }

  return {
    id: Number(bag.id),
    title: bag.title || '',
    icon: bag.icon || '',
    sort: bag.sort !== undefined && bag.sort !== null ? Number(bag.sort) : undefined,
  };
}

export function CourseBagManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [bags, setBags] = useState([]);
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

  const sortedBags = useMemo(
    () =>
      [...bags].sort((left, right) => {
        const leftSort = Number(left.sort ?? 0);
        const rightSort = Number(right.sort ?? 0);
        return leftSort - rightSort;
      }),
    [bags],
  );

  async function loadBags() {
    setLoading(true);
    try {
      const data = await listCourseBags();
      setBags(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error?.message || '课程包列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBags();
  }, []);

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

  function openEditModal(bag) {
    setModalMode('edit');
    resetUploadState();
    form.setFieldsValue(normalizeFormValues(bag));
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
        message: '上传成功，已自动写入图标地址',
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
    if (!values.title?.trim()) {
      message.error('请输入课程包名称');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
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

      message.success(modalMode === 'create' ? '课程包创建成功' : '课程包更新成功');
      setModalOpen(false);
      await loadBags();
    } catch (error) {
      message.error(error?.message || '课程包提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(bag) {
    setActionSubmitting(true);
    try {
      await changeCourseBagStatus({
        id: Number(bag.id),
        status: Number(bag.status) === 1 ? 2 : 1,
      });
      message.success('课程包状态更新成功');
      await loadBags();
    } catch (error) {
      message.error(error?.message || '课程包状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDelete(bag) {
    setActionSubmitting(true);
    try {
      await removeCourseBag(bag.id);
      message.success('课程包已删除');
      await loadBags();
    } catch (error) {
      message.error(error?.message || '课程包删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const columns = useMemo(
    () =>
      createCourseBagColumns({
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
            课程包管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `courseBag/bags`，保留课程包的新增、编辑、启停和继续钻取课程链路。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加课程包
          </Button>
          <Button onClick={() => loadBags()} loading={loading}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card
        title="课程包列表"
        extra={<Typography.Text type="secondary">共 {sortedBags.length} 条记录</Typography.Text>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={sortedBags}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增课程包' : '编辑课程包'}
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
          维护课程包标题、图标和排序，并保留后续精品课程钻取能力。
        </Typography.Paragraph>
        <Form form={form} layout="vertical" initialValues={EMPTY_FORM} onFinish={handleSubmit}>
          <div className="form-grid">
            {modalMode === 'edit' ? (
              <Form.Item label="课程包 ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item
              label="课程包名称"
              name="title"
              className="form-field--full"
              rules={[{ required: true, message: '请输入课程包名称' }]}
            >
              <Input placeholder="请输入课程包名称" />
            </Form.Item>
            <Form.Item label="排序字段" name="sort">
              <InputNumber
                precision={0}
                style={{ width: '100%' }}
                placeholder={modalMode === 'create' ? '创建后可编辑排序' : '请输入排序'}
                disabled={modalMode === 'create'}
              />
            </Form.Item>
            <Form.Item label="图标地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传图标" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传课程包图标
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传课程包图标'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="课程包图标"
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
