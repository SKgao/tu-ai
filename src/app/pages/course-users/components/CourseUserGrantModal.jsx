import React from 'react';
import { Form, Input, InputNumber, Modal, Select, Space, Typography } from 'antd';

export function CourseUserGrantModal({
  open,
  form,
  books,
  sexOptions,
  submitting,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal
      title="开通精品课程"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="确认开通"
      cancelText="取消"
      confirmLoading={submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        补齐旧版 `courseUser` 里的开通课程能力。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="用户名" name="realName" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="mobile"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^[1][0-9]{10}$/, message: '请输入合法手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="性别" name="sex" rules={[{ required: true, message: '请选择性别' }]}>
            <Select options={sexOptions} />
          </Form.Item>
          <Form.Item
            label="付款金额"
            name="payAmt"
            rules={[
              { required: true, message: '请输入付款金额' },
              { type: 'number', min: 0, message: '付款金额必须为数字' },
            ]}
          >
            <Space.Compact block>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入付款金额" />
              <div className="compact-addon">元</div>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label="精品课程"
            name="textbookId"
            className="form-field--full"
            rules={[{ required: true, message: '请选择精品课程' }]}
          >
            <Select
              placeholder="请选择精品课程"
              options={books.map((item) => ({
                value: String(item.textbookId),
                label: item.textbookName,
              }))}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
