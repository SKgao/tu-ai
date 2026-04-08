import React from 'react';
import { Form, Input, InputNumber, Modal, Select, Typography } from 'antd';

export function MenuModal({
  open,
  mode,
  form,
  emptyForm,
  menuScopeOptions,
  statusOptions,
  submitting,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增菜单' : '编辑菜单'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={800}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        {mode === 'create' ? '新增权限菜单或按钮/接口定义。' : '统一修改菜单字段。'}
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={emptyForm} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="菜单名称" name="menuName" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item label="父级 ID" name="parentId" rules={[{ required: true, message: '请输入父级 ID' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="一级菜单传 0" />
          </Form.Item>
          <Form.Item label="排序字段" name="sortValue" rules={[{ required: true, message: '请输入排序字段' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入排序数字" />
          </Form.Item>
          <Form.Item label="作用" name="menuScope" rules={[{ required: true, message: '请选择作用' }]}>
            <Select options={menuScopeOptions} />
          </Form.Item>
          <Form.Item label="路径" name="path" rules={[{ required: true, message: '请输入路径' }]}>
            <Input placeholder="请输入路径" />
          </Form.Item>
          <Form.Item label="图标" name="icon" rules={[{ required: true, message: '请输入图标标识' }]}>
            <Input placeholder="请输入 icon 类名" />
          </Form.Item>
          <Form.Item label="接口地址" name="url" className="form-field--full">
            <Input placeholder="请输入接口地址" />
          </Form.Item>
          {mode === 'edit' ? (
            <Form.Item label="状态" name="status">
              <Select options={statusOptions} />
            </Form.Item>
          ) : null}
        </div>
      </Form>
    </Modal>
  );
}
