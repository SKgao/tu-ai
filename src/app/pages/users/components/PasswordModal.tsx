import { Form, Input, Modal, Typography } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import type { PasswordFormValues } from '../types';

type PasswordModalProps = {
  open: boolean;
  form: FormInstance<PasswordFormValues>;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: FormProps<PasswordFormValues>['onFinish'];
};

export function PasswordModal({
  open,
  form,
  submitting,
  onCancel,
  onSubmit,
}: PasswordModalProps) {
  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="保存"
      cancelText="取消"
      confirmLoading={submitting}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        为当前选中用户设置新的登录密码。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="form-grid form-grid--single">
          <Form.Item label="用户 ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="新密码" name="password" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入新密码' }]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
