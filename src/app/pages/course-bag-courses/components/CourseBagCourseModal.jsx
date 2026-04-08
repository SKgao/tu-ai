import React from 'react';
import { Button, Form, Image, Input, InputNumber, Modal, Space, Typography, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export function CourseBagCourseModal({
  open,
  mode,
  form,
  emptyForm,
  bagTitle,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增课程包课程' : '编辑课程包课程'}
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
        {bagTitle ? `当前课程包：${bagTitle}` : '维护课程包里的精品课程。'}
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={emptyForm} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
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
          {mode === 'edit' ? (
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
                customRequest={onUpload}
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
  );
}
