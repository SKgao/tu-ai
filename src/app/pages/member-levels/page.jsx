import React, { startTransition, useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  createMemberLevel,
  listMemberLevels,
  removeMemberLevel,
  updateMemberLevel,
  uploadAsset,
} from '@/app/services/member-levels';
import { useMemberCommerceOptionsStore } from '@/app/stores/memberCommerceOptions';

const EMPTY_LEVEL_FORM = {
  userLevel: undefined,
  levelName: '',
  explainInfo: '',
  exprieDays: undefined,
  orgMoney: undefined,
  needMoney: undefined,
  icon: '',
};

function toAmountCent(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return Math.round(Number(value) * 100);
}

function fromAmountCent(value) {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return Number((Number(value) / 100).toFixed(2));
}

function normalizeFormValues(level) {
  if (!level) {
    return { ...EMPTY_LEVEL_FORM };
  }

  return {
    userLevel: Number(level.userLevel),
    levelName: level.levelName || '',
    explainInfo: level.explainInfo || '',
    exprieDays:
      level.exprieDays !== undefined && level.exprieDays !== null ? Number(level.exprieDays) : undefined,
    orgMoney: fromAmountCent(level.orgMoney),
    needMoney: fromAmountCent(level.needMoney),
    icon: level.icon || '',
  };
}

export function MemberLevelManagementPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const refreshMemberLevelResources = useMemberCommerceOptionsStore(
    (state) => state.refreshMemberLevelResources,
  );

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

  function openCreateModal() {
    setModalMode('create');
    setUploadState({
      uploading: false,
      message: '',
    });
    form.setFieldsValue({ ...EMPTY_LEVEL_FORM });
    setModalOpen(true);
  }

  function openEditModal(level) {
    setModalMode('edit');
    setUploadState({
      uploading: false,
      message: '',
    });
    form.setFieldsValue(normalizeFormValues(level));
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
    if (modalMode === 'create' && levels.some((item) => Number(item.userLevel) === Number(values.userLevel))) {
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
      if (modalMode === 'create') {
        await createMemberLevel(payload);
      } else {
        await updateMemberLevel(payload);
      }

      message.success(modalMode === 'create' ? '会员等级创建成功' : '会员等级更新成功');
      setModalOpen(false);
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
    () => [
      {
        title: '会员等级 ID',
        dataIndex: 'userLevel',
      },
      {
        title: '会员等级名称',
        dataIndex: 'levelName',
        render: (value) => value || '-',
      },
      {
        title: '等级描述',
        dataIndex: 'explainInfo',
        ellipsis: true,
        render: (value) => value || '-',
      },
      {
        title: '图标',
        dataIndex: 'icon',
        render: (value, record) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.levelName || 'level'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      {
        title: '过期时间',
        dataIndex: 'exprieDays',
        render: (value) => (Number(value) === 0 ? '永久有效' : value ?? '-'),
      },
      {
        title: '原始价格',
        dataIndex: 'orgMoney',
        render: (value) => `${fromAmountCent(value) ?? '0.00'} 元`,
      },
      {
        title: '需充值金额',
        dataIndex: 'needMoney',
        render: (value) => `${fromAmountCent(value) ?? '0.00'} 元`,
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, level) => (
          <Space size="small">
            <Button type="link" onClick={() => openEditModal(level)}>
              编辑
            </Button>
            <Popconfirm
              title={`确认删除会员等级 ${level.levelName || level.userLevel} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(level)}
              disabled={actionSubmitting}
            >
              <Button type="link" danger disabled={actionSubmitting || submitting}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [actionSubmitting, submitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            会员等级管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `memberLevel` 模块，先按新版 antd 组件重构列表、弹窗表单和上传交互。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card
        title="会员等级列表"
        extra={
          <Space wrap>
            <Typography.Text type="secondary">共 {levels.length} 个会员等级</Typography.Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              添加会员等级
            </Button>
            <Button onClick={() => loadLevels()} loading={loading}>
              刷新
            </Button>
          </Space>
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

      <Modal
        title={modalMode === 'create' ? '新增会员等级' : '编辑会员等级'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={800}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护会员等级名称、有效期、价格与图标。
        </Typography.Paragraph>
        <Form
          form={form}
          layout="vertical"
          initialValues={EMPTY_LEVEL_FORM}
          onFinish={handleSubmit}
        >
          <div className="form-grid">
            <Form.Item
              label="会员等级 ID"
              name="userLevel"
              rules={[
                { required: true, message: '请填写会员等级 ID' },
                { type: 'number', min: 0, message: '会员等级 ID 必须为数字' },
              ]}
            >
              <InputNumber
                min={0}
                precision={0}
                disabled={modalMode === 'edit'}
                style={{ width: '100%' }}
                placeholder="请输入会员等级 ID"
              />
            </Form.Item>

            <Form.Item
              label="会员等级名称"
              name="levelName"
              rules={[{ required: true, message: '请填写会员等级名称' }]}
            >
              <Input placeholder="请输入会员等级名称" />
            </Form.Item>

            <Form.Item label="等级描述" name="explainInfo" className="form-field--full">
              <Input placeholder="请输入等级描述" />
            </Form.Item>

            <Form.Item
              label="过期天数"
              name="exprieDays"
              rules={[{ type: 'number', min: 0, message: '过期天数必须为数字' }]}
            >
              <InputNumber
                min={0}
                precision={0}
                style={{ width: '100%' }}
                placeholder="0 表示永久有效"
              />
            </Form.Item>

            <Form.Item
              label="原始价格"
              name="orgMoney"
              rules={[{ type: 'number', min: 0, message: '原始价格必须是数字' }]}
            >
              <Space.Compact block>
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入原始价格"
                />
                <div className="compact-addon">元</div>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              label="需充值金额"
              name="needMoney"
              rules={[{ type: 'number', min: 0, message: '需充值金额必须是数字' }]}
            >
              <Space.Compact block>
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入需充值金额"
                />
                <div className="compact-addon">元</div>
              </Space.Compact>
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
                    上传图标
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传等级图标'}
                </Typography.Text>
                {form.getFieldValue('icon') ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={form.getFieldValue('icon')}
                    alt="会员等级图标"
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
