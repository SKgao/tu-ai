import React from 'react';
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export function BookModal({
  open,
  mode,
  form,
  grades,
  versions,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增教材' : '编辑教材'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={720}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        统一维护教材名称、封面、年级和教材版本。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
            <Form.Item label="教材 ID" name="id">
              <InputNumber disabled style={{ width: '100%' }} />
            </Form.Item>
          ) : null}
          <Form.Item label="教材名称" name="name" rules={[{ required: true, message: '请输入教材名称' }]}>
            <Input placeholder="请输入教材名称" />
          </Form.Item>
          <Form.Item label="年级" name="gradeId" rules={[{ required: true, message: '请选择年级' }]}>
            <Select
              placeholder="请选择年级"
              options={grades.map((item) => ({
                value: String(item.id),
                label: item.gradeName,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="教材版本"
            name="bookVersionId"
            rules={[{ required: true, message: '请选择教材版本' }]}
          >
            <Select
              placeholder="请选择教材版本"
              options={versions.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          {mode === 'edit' ? (
            <Form.Item label="年级顺序" name="status">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
            </Form.Item>
          ) : null}
          <Form.Item label="封面图地址" name="icon" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="上传封面" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUpload}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传教材封面
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传教材封面'}
              </Typography.Text>
              {iconValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={iconValue}
                  alt="教材封面"
                />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
