import { Form, Input, Modal, Select, Typography } from 'antd';
import type { FormInstance, FormProps } from 'antd';
import type { MemberLevelSelectOption, VipGrantFormValues } from '../types';

type VipGrantModalProps = {
  open: boolean;
  form: FormInstance<VipGrantFormValues>;
  submitting: boolean;
  levelOptions: MemberLevelSelectOption[];
  /**
   * 目标会员的显示名，由父组件传入。
   *
   * 不能在渲染期用 `form.getFieldValue()` 读取：弹窗关闭时内部的 `<Form>`
   * 并未挂载，此时读 form 会触发 antd 的
   * "Instance created by useForm is not connected to any Form element" 警告。
   */
  targetName?: string;
  onCancel: () => void;
  onSubmit: FormProps<VipGrantFormValues>['onFinish'];
};

export function VipGrantModal({
  open,
  form,
  submitting,
  levelOptions,
  targetName,
  onCancel,
  onSubmit,
}: VipGrantModalProps) {
  return (
    <Modal
      title="开通会员"
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
        给 {targetName || '当前用户'} 开通会员等级。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="userId" hidden>
          <Input />
        </Form.Item>
        <div className="form-grid form-grid--single">
          <Form.Item
            label="会员等级"
            name="userLevel"
            rules={[{ required: true, message: '请选择会员等级' }]}
          >
            <Select placeholder="请选择会员等级" options={levelOptions} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
