import React from 'react';
import { Form, Input, Modal, Typography } from 'antd';

export function RoleCreateModal({ open, form, submitting, onCancel, onSubmit }) {
  return (
    <Modal
      title="新增角色"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="创建"
      cancelText="取消"
      confirmLoading={submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        创建新的后台角色，后续可继续分配权限菜单。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="form-grid form-grid--single">
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名' }]}>
            <Input placeholder="请输入角色名" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
