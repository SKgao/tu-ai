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
import { EMPTY_UNIT_FORM } from '../utils/forms';

export function UnitModal({
  open,
  mode,
  form,
  books,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增单元' : '编辑单元'}
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
        维护单元名称、封面、教材归属和排序字段。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_UNIT_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
            <Form.Item label="单元 ID" name="id">
              <InputNumber disabled style={{ width: '100%' }} />
            </Form.Item>
          ) : null}
          <Form.Item label="单元名称" name="text" rules={[{ required: true, message: '请输入单元名称' }]}>
            <Input placeholder="请输入单元名称" />
          </Form.Item>
          <Form.Item label="教材" name="textBookId" rules={[{ required: true, message: '请选择教材' }]}>
            <Select
              placeholder="请选择教材"
              options={books.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="排序字段" name="sort">
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
          </Form.Item>
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
                  上传单元封面
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传单元封面'}
              </Typography.Text>
              {iconValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={iconValue}
                  alt="单元封面"
                />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
