import React from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ACTIVITY_TYPE_OPTIONS, EMPTY_ACTIVITY_FORM } from '../utils/forms';

export function ActivityModal({
  open,
  mode,
  form,
  activityType,
  memberLevels,
  submitting,
  uploadState,
  iconValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增活动' : '编辑活动'}
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
        维护活动标题、时间、金额、参与商品和链接信息。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_ACTIVITY_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="活动标题" name="title" rules={[{ required: true, message: '请输入活动标题' }]}>
            <Input placeholder="请输入活动标题" />
          </Form.Item>
          <Form.Item label="活动类型" name="status" rules={[{ required: true, message: '请选择活动类型' }]}>
            <Select disabled={mode === 'edit'} options={ACTIVITY_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item label="活动开始时间" name="beginAt" rules={[{ required: true, message: '请选择活动开始时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="活动结束时间" name="endAt" rules={[{ required: true, message: '请选择活动结束时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          {mode === 'edit' ? (
            <Form.Item label="活动持续时间" name="activeExpireDays">
              <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入活动持续天数" />
            </Form.Item>
          ) : null}
          {String(activityType) === '1' ? (
            <>
              <Form.Item label="参与活动商品" name="itemId" rules={[{ required: true, message: '请选择会员等级' }]}>
                <Select
                  placeholder="请选择会员等级"
                  options={memberLevels.map((item) => ({
                    value: String(item.userLevel),
                    label: item.levelName,
                  }))}
                />
              </Form.Item>
              <Form.Item label="活动价格" name="activeMoney">
                <Space.Compact block>
                  <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入活动价格" />
                  <div className="compact-addon">元</div>
                </Space.Compact>
              </Form.Item>
            </>
          ) : null}
          <Form.Item label="活动内容" name="content" className="form-field--full">
            <Input.TextArea rows={4} placeholder="请输入活动内容" />
          </Form.Item>
          <Form.Item label="活动图片地址" name="icon" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="上传活动图片" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUpload}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传活动封面
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传活动封面'}
              </Typography.Text>
              {iconValue ? <img src={iconValue} alt="活动图片" className="avatar-preview__image" /> : null}
            </Space>
          </Form.Item>
          <Form.Item label="活动链接" name="url" className="form-field--full">
            <Input placeholder="请输入活动链接" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
