import { Button, Form, Input, Modal, Select, Typography, Upload } from 'antd';
import type { FormInstance, FormProps, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadState } from '@/app/hooks/useUploadState';
import {
  EMPTY_MATERIAL_FORM,
  MATERIAL_UPLOAD_OPTIONS,
} from '../utils/forms';
import type {
  SourceMaterialBookOption,
  SourceMaterialFormValues,
} from '../types';

type UploadField = 'icon' | 'audio';

type SourceMaterialModalProps = {
  open: boolean;
  mode: 'create' | 'edit' | string;
  form: FormInstance<SourceMaterialFormValues>;
  books: SourceMaterialBookOption[];
  submitting: boolean;
  uploadState: UploadState;
  onCancel: () => void;
  onSubmit: FormProps<SourceMaterialFormValues>['onFinish'];
  onUpload: (options: Parameters<NonNullable<UploadProps['customRequest']>>[0], field: UploadField) => void | Promise<void>;
};

export function SourceMaterialModal({
  open,
  mode,
  form,
  books,
  submitting,
  uploadState,
  onCancel,
  onSubmit,
  onUpload,
}: SourceMaterialModalProps) {
  return (
    <Modal
      title={mode === 'create' ? '新增素材' : '编辑素材'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={840}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        维护素材文本、图标、音频和释义信息。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_MATERIAL_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
            <Form.Item label="素材 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : null}
          <Form.Item
            label="教材"
            name="textbookId"
            rules={[{ required: mode === 'create', message: '请选择教材' }]}
          >
            <Select
              placeholder="请选择教材"
              disabled={mode === 'edit'}
              options={books.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="素材内容" name="text" rules={[{ required: true, message: '请输入素材内容' }]}>
            <Input placeholder="请输入素材内容" />
          </Form.Item>
          <Form.Item label="素材图标地址" name="icon" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="素材音频地址" name="audio" className="form-field--full">
            <Input placeholder="可直接粘贴音频 URL" />
          </Form.Item>
          <Form.Item label="单次释义" name="translation" className="form-field--full">
            <Input placeholder="请输入单次释义，例如 [dog]" />
          </Form.Item>
          <Form.Item label="多次释义" name="explainsArray" className="form-field--full">
            <Input.TextArea rows={4} placeholder='请输入多次释义，例如 ["dog","hound"]' />
          </Form.Item>
          {MATERIAL_UPLOAD_OPTIONS.map((item) => (
            <Form.Item key={item.field} label={item.label} className="form-field--full">
              <Upload
                accept={item.accept}
                maxCount={1}
                showUploadList={false}
                customRequest={(options) => onUpload(options, item.field)}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  {item.label}
                </Button>
              </Upload>
            </Form.Item>
          ))}
        </div>
      </Form>
    </Modal>
  );
}
