import React from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { EMPTY_TOPIC_FORM, TOPIC_UPLOAD_OPTIONS } from '../utils/forms';

export function TopicModal({
  open,
  form,
  passList,
  subjects,
  submitting,
  uploadState,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title="添加题目"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="创建"
      cancelText="取消"
      confirmLoading={submitting}
      width={820}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        这是旧版 `AddProject` 的轻量迁移版，保留最常用的单题录入能力。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_TOPIC_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="小关卡" name="customsPassId" rules={[{ required: true, message: '请选择小关卡' }]}>
            <Select
              placeholder="请选择小关卡"
              options={passList.map((item) => ({
                value: String(item.id),
                label: item.title,
              }))}
            />
          </Form.Item>
          <Form.Item label="题型" name="subject">
            <Select
              allowClear
              placeholder="请选择题型"
              options={subjects.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="题目内容" name="sourceIds" className="form-field--full" rules={[{ required: true, message: '请输入题目内容' }]}>
            <Input placeholder="请输入题目内容" />
          </Form.Item>
          <Form.Item label="题目顺序" name="sort">
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入题目顺序" />
          </Form.Item>
          <Form.Item label="挖空规则" name="showIndex">
            <Input placeholder="数字之间用空格分隔" />
          </Form.Item>
          {TOPIC_UPLOAD_OPTIONS.map((item) => (
            <Form.Item key={item.field} label={item.label} className="form-field--full">
              <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                <Form.Item name={item.field} noStyle>
                  <Input placeholder={`可直接粘贴${item.label} URL`} />
                </Form.Item>
                <Upload
                  accept={item.accept}
                  maxCount={1}
                  showUploadList={false}
                  customRequest={(options) => onUpload(options, item.field, 'topic')}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传{item.label}
                  </Button>
                </Upload>
              </Space>
            </Form.Item>
          ))}
        </div>
      </Form>
    </Modal>
  );
}
