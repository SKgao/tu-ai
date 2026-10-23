import { Button, Form, Input, InputNumber, Modal, Select, Typography, Upload } from 'antd';
import type { FormInstance, FormProps, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FormModalMode } from '@/app/hooks/useFormModal';
import type { UploadState } from '@/app/hooks/useUploadState';
import { EMPTY_SUBJECT_FORM, isScenePassId } from '../utils/forms';
import type {
  SubjectFormValues,
  SubjectTypeOption,
  SubjectUploadField,
} from '../types';

type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

type SubjectModalProps = {
  open: boolean;
  mode: FormModalMode;
  form: FormInstance<SubjectFormValues>;
  routeCustomsPassId: string;
  currentCustomsPassId?: string;
  subjectTypes: SubjectTypeOption[];
  submitting: boolean;
  uploadState: UploadState;
  onCancel: () => void;
  onSubmit: FormProps<SubjectFormValues>['onFinish'];
  onUpload: (options: UploadRequestOptions, field: SubjectUploadField) => void | Promise<void>;
};

export function SubjectModal({
  open,
  mode,
  form,
  routeCustomsPassId,
  currentCustomsPassId,
  subjectTypes,
  submitting,
  uploadState,
  onCancel,
  onSubmit,
  onUpload,
}: SubjectModalProps) {
  const uploadItems = [
    ...(mode === 'create'
      ? [
          { field: 'icon', label: '题目图片', accept: 'image/*' },
          { field: 'audio', label: '题目音频', accept: 'audio/*' },
          { field: 'sentenceAudio', label: '句子音频', accept: 'audio/*' },
        ]
      : []),
    ...(isScenePassId(currentCustomsPassId) ? [{ field: 'sceneGraph', label: '场景图', accept: 'image/*' }] : []),
  ];

  return (
    <Modal
      title={mode === 'create' ? '新增题目' : '编辑题目'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={840}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
      forceRender
    >
      <Typography.Paragraph type="secondary">
        {mode === 'create' ? '保留新架构下最常用的单题录入能力。' : '维护题目内容、顺序、关卡名和场景图。'}
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_SUBJECT_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'edit' ? (
            <Form.Item label="题目 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : null}
          <Form.Item label="关卡 ID" name="customsPassId" rules={[{ required: true, message: '请输入关卡 ID' }]}>
            <Input disabled={Boolean(routeCustomsPassId) || mode === 'edit'} placeholder="请输入关卡 ID" />
          </Form.Item>
          {mode === 'create' ? (
            <Form.Item label="题型" name="subject">
              <Select
                allowClear
                placeholder="可选"
                options={subjectTypes.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
          ) : (
            <Form.Item label="关卡名称" name="customsPassName">
              <Input placeholder="请输入关卡名称" />
            </Form.Item>
          )}
          <Form.Item label="题目内容" name="sourceIds" className="form-field--full" rules={[{ required: true, message: '请输入题目内容' }]}>
            <Input placeholder="请输入题目内容" />
          </Form.Item>
          <Form.Item label="题目顺序" name="sort">
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入题目顺序" />
          </Form.Item>
          {mode === 'create' ? (
            <Form.Item label="挖空规则" name="showIndex">
              <Input placeholder="数字之间用空格分隔" />
            </Form.Item>
          ) : null}

          {mode === 'create' ? (
            <>
              <Form.Item label="题目图片地址" name="icon" className="form-field--full">
                <Input placeholder="可直接粘贴图片 URL" />
              </Form.Item>
              <Form.Item label="题目音频地址" name="audio" className="form-field--full">
                <Input placeholder="可直接粘贴音频 URL" />
              </Form.Item>
              <Form.Item label="句子音频地址" name="sentenceAudio" className="form-field--full">
                <Input placeholder="可直接粘贴句子音频 URL" />
              </Form.Item>
            </>
          ) : null}

          {isScenePassId(currentCustomsPassId) ? (
            <>
              <Form.Item label="场景图地址" name="sceneGraph" className="form-field--full">
                <Input placeholder="可直接粘贴场景图 URL" />
              </Form.Item>
              <Form.Item name="originalSceneGraph" hidden>
                <Input />
              </Form.Item>
            </>
          ) : null}

          {uploadItems.map((item) => (
            <Form.Item key={item.field} label={`上传${item.label}`} className="form-field--full">
              <Upload
                accept={item.accept}
                maxCount={1}
                showUploadList={false}
                customRequest={(options) => onUpload(options, item.field as SubjectUploadField)}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传{item.label}
                </Button>
              </Upload>
            </Form.Item>
          ))}

          {uploadState.message ? (
            <Form.Item className="form-field--full">
              <Typography.Text type={uploadState.uploading ? 'secondary' : 'success'}>
                {uploadState.message}
              </Typography.Text>
            </Form.Item>
          ) : null}
        </div>
      </Form>
    </Modal>
  );
}
