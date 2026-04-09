import { Button, Form, Image, Input, InputNumber, Modal, Space, Typography, Upload } from 'antd';
import type { FormInstance, FormProps, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadState } from '@/app/hooks/useUploadState';
import type { MemberLevelFormValues } from '../types';
import { EMPTY_LEVEL_FORM } from '../utils/forms';

type MemberLevelModalProps = {
  open: boolean;
  mode: 'create' | 'edit' | string;
  form: FormInstance<MemberLevelFormValues>;
  submitting: boolean;
  uploadState: UploadState;
  iconValue?: string;
  onCancel: () => void;
  onSubmit: FormProps<MemberLevelFormValues>['onFinish'];
  onUpload: NonNullable<UploadProps['customRequest']>;
};

export function MemberLevelModal({
  open,
  mode,
  form,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}: MemberLevelModalProps) {
  return (
    <Modal
      title={mode === 'create' ? '新增会员等级' : '编辑会员等级'}
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
        维护会员等级名称、有效期、价格与图标。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_LEVEL_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item
            label="会员等级 ID"
            name="userLevel"
            rules={[
              { required: true, message: '请填写会员等级 ID' },
              { type: 'number', min: 0, message: '会员等级 ID 必须为数字' },
            ]}
          >
            <InputNumber
              min={0}
              precision={0}
              disabled={mode === 'edit'}
              style={{ width: '100%' }}
              placeholder="请输入会员等级 ID"
            />
          </Form.Item>

          <Form.Item
            label="会员等级名称"
            name="levelName"
            rules={[{ required: true, message: '请填写会员等级名称' }]}
          >
            <Input placeholder="请输入会员等级名称" />
          </Form.Item>

          <Form.Item label="等级描述" name="explainInfo" className="form-field--full">
            <Input placeholder="请输入等级描述" />
          </Form.Item>

          <Form.Item
            label="过期天数"
            name="exprieDays"
            rules={[{ type: 'number', min: 0, message: '过期天数必须为数字' }]}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: '100%' }}
              placeholder="0 表示永久有效"
            />
          </Form.Item>

          <Form.Item
            label="原始价格"
            name="orgMoney"
            rules={[{ type: 'number', min: 0, message: '原始价格必须是数字' }]}
          >
            <Space.Compact block>
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入原始价格"
              />
              <div className="compact-addon">元</div>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="需充值金额"
            name="needMoney"
            rules={[{ type: 'number', min: 0, message: '需充值金额必须是数字' }]}
          >
            <Space.Compact block>
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="请输入需充值金额"
              />
              <div className="compact-addon">元</div>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="图标地址" name="icon" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>

          <Form.Item label="上传图标" className="form-field--full">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUpload}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传图标
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传等级图标'}
              </Typography.Text>
              {iconValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={iconValue}
                  alt="会员等级图标"
                />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
