import React from 'react';
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Space,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { EMPTY_SESSION_FORM } from '../utils/forms';

export function SessionModal({
  open,
  mode,
  form,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增大关卡' : '编辑大关卡'}
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
        维护大关卡的教材归属、标题、图片与顺序。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_SESSION_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="教材 ID" name="textbookId" rules={[{ required: true, message: '请输入教材 ID' }]}>
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入教材 ID" />
          </Form.Item>
          <Form.Item label="大关卡 ID" name="id" rules={[{ required: true, message: '请输入大关卡 ID' }]}>
            <InputNumber
              precision={0}
              style={{ width: '100%' }}
              placeholder="请输入大关卡 ID"
              disabled={mode === 'edit'}
            />
          </Form.Item>
          <Form.Item label="大关卡标题" name="title" rules={[{ required: true, message: '请输入大关卡标题' }]}>
            <Input placeholder="请输入大关卡标题" />
          </Form.Item>
          <Form.Item label="排序字段" name="sort">
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
          </Form.Item>
          <Form.Item label="图片地址" name="icon" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="上传图片" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUpload}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传大关卡图片
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传大关卡图片'}
              </Typography.Text>
              {iconValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={iconValue}
                  alt="大关卡图片"
                />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
