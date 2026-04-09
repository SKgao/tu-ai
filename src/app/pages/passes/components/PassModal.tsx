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
import type { FormInstance, FormProps, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FormModalMode } from '@/app/hooks/useFormModal';
import type { UploadState } from '@/app/hooks/useUploadState';
import { EMPTY_PASS_FORM } from '../utils/forms';
import type { PassFormValues, PassSubjectOption } from '../types';

type PassModalProps = {
  open: boolean;
  mode: FormModalMode;
  form: FormInstance<PassFormValues>;
  subjects: PassSubjectOption[];
  submitting: boolean;
  uploadState: UploadState;
  iconValue?: string;
  onCancel: () => void;
  onSubmit: FormProps<PassFormValues>['onFinish'];
  onUpload: NonNullable<UploadProps['customRequest']>;
};

export function PassModal({
  open,
  mode,
  form,
  subjects,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}: PassModalProps) {
  return (
    <Modal
      title={mode === 'create' ? '新增关卡' : '编辑关卡'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={700}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      forceRender
    >
      <Typography.Paragraph type="secondary">
        维护关卡标题、图片、归属 part、排序和题型。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_PASS_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
            <Form.Item label="关卡 ID" name="id">
              <InputNumber disabled style={{ width: '100%' }} />
            </Form.Item>
          ) : null}
          <Form.Item label="关卡标题" name="title" rules={[{ required: true, message: '请输入关卡标题' }]}>
            <Input placeholder="请输入关卡标题" />
          </Form.Item>
          <Form.Item label="Part ID" name="partsId" rules={[{ required: true, message: '请输入 Part ID' }]}>
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入 Part ID" />
          </Form.Item>
          <Form.Item label="关卡顺序" name="sort">
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入关卡顺序" />
          </Form.Item>
          <Form.Item label="题型" name="subject" rules={[{ required: true, message: '请选择题型' }]}>
            <Select
              placeholder="请选择题型"
              options={subjects.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="关卡图片地址" name="icon" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="上传关卡图片" className="form-field--full">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUpload}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传关卡图片
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传关卡图片'}
              </Typography.Text>
              {iconValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={iconValue}
                  alt="关卡图片"
                />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
