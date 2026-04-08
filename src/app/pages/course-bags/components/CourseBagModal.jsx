import React from 'react';
import { Button, Form, Image, Input, InputNumber, Modal, Space, Typography, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export function CourseBagModal({
  open,
  mode,
  form,
  emptyForm,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增课程包' : '编辑课程包'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={660}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        维护课程包标题、图标和排序，并保留后续精品课程钻取能力。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={emptyForm} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
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
              placeholder={mode === 'create' ? '创建后可编辑排序' : '请输入排序'}
              disabled={mode === 'create'}
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
                customRequest={onUpload}
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
  );
}
