import React from 'react';
import { Form, Input, InputNumber, Modal, Typography } from 'antd';

export function ResourceModal({
  open,
  form,
  resourceId,
  resourceType,
  submitting,
  onCancel,
  onSubmit,
}) {
  const isGrade = resourceType === 'grade';

  return (
    <Modal
      title={isGrade ? (resourceId ? '编辑年级' : '新增年级') : resourceId ? '编辑教材版本' : '新增教材版本'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={resourceId ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={submitting}
      width={600}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        维护基础资源，供教材管理和后续业务页使用。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="form-grid">
          {resourceId ? (
            <Form.Item label="资源 ID" name="id">
              <InputNumber disabled style={{ width: '100%' }} />
            </Form.Item>
          ) : null}
          <Form.Item
            label={isGrade ? '年级名称' : '教材版本名称'}
            name="name"
            className="form-field--full"
            rules={[{ required: true, message: `请输入${isGrade ? '年级' : '教材版本'}名称` }]}
          >
            <Input placeholder={`请输入${isGrade ? '年级' : '教材版本'}名称`} />
          </Form.Item>
          {isGrade ? (
            <Form.Item label="排序字段" name="sortValue">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
            </Form.Item>
          ) : null}
        </div>
      </Form>
    </Modal>
  );
}
