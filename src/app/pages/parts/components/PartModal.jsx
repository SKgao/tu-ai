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
import { EMPTY_PART_FORM, PART_LOCK_OPTIONS } from '../utils/forms';

export function PartModal({
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
      title={mode === 'create' ? '新增 Part' : '编辑 Part'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={700}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        维护 part 名称、图片、描述、排序和锁定状态。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_PART_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
            <Form.Item label="Part ID" name="id">
              <InputNumber disabled style={{ width: '100%' }} />
            </Form.Item>
          ) : null}
          <Form.Item label="Part 名称" name="title" rules={[{ required: true, message: '请输入 Part 名称' }]}>
            <Input placeholder="请输入 Part 名称" />
          </Form.Item>
          <Form.Item label="单元 ID" name="unitsId" rules={[{ required: true, message: '请输入单元 ID' }]}>
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入单元 ID" />
          </Form.Item>
          <Form.Item label="排序字段" name="sort">
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
          </Form.Item>
          {mode === 'edit' ? (
            <Form.Item label="锁定状态" name="canLock">
              <Select options={PART_LOCK_OPTIONS} />
            </Form.Item>
          ) : null}
          <Form.Item label="Part 描述" name="tips" className="form-field--full">
            <Input.TextArea rows={4} placeholder="请输入 Part 描述" />
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
                  上传 Part 图片
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传 Part 图片'}
              </Typography.Text>
              {iconValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={iconValue}
                  alt="Part 图片"
                />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
