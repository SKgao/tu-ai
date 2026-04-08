import React from 'react';
import { Button, Form, Modal, Select, Typography, Upload } from 'antd';
import {
  EMPTY_IMPORT_FORM,
  IMPORT_FIELD_OPTIONS,
} from '../utils/forms';

export function ImportSourceMaterialModal({
  open,
  form,
  books,
  submitting,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal
      title="导入素材"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="开始导入"
      cancelText="取消"
      confirmLoading={submitting}
      width={720}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        兼容旧页的目录导入思路，当前提交文件名数组给后端处理。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_IMPORT_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="教材" name="textbookId" className="form-field--full" rules={[{ required: true, message: '请选择教材' }]}>
            <Select
              placeholder="请选择教材"
              options={books.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          {IMPORT_FIELD_OPTIONS.map((item) => (
            <Form.Item key={item.field} label={item.label} name={item.field} valuePropName="fileList" getValueFromEvent={(event) => event?.fileList || []}>
              <Upload beforeUpload={() => false} multiple>
                <Button>{`选择${item.label}`}</Button>
              </Upload>
            </Form.Item>
          ))}
        </div>
      </Form>
    </Modal>
  );
}
