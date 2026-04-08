import React from 'react';
import {
  Button,
  DatePicker,
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
import { UploadOutlined } from '@ant-design/icons';
import {
  COURSE_BAG_ACTIVITY_STATUS_OPTIONS,
  COURSE_BAG_ACTIVITY_TYPE_OPTIONS,
  EMPTY_FORM,
} from '../utils/forms';

export function CourseBagActivityModal({
  open,
  mode,
  form,
  courseOptions,
  courseType,
  detailValue,
  ticketValue,
  submitting,
  uploadState,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增课程活动' : '编辑课程活动'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={920}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        对齐旧版 `courseBag/activity` 的活动配置字段和课程挂接能力。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="活动 ID" name="id" rules={[{ required: true, message: '请输入活动 ID' }]}>
            <InputNumber disabled={mode !== 'create'} precision={0} style={{ width: '100%' }} placeholder="请输入活动 ID" />
          </Form.Item>
          <Form.Item label="课程" name={mode === 'create' ? 'textbookId' : 'textbookName'}>
            {mode === 'create' ? (
              <Select
                placeholder="请选择课程"
                options={courseOptions.map((item) => ({
                  value: String(item.textbookId),
                  label: item.textbookName,
                }))}
              />
            ) : (
              <Input placeholder="请输入课程名称" />
            )}
          </Form.Item>
          <Form.Item label="辅导老师" name="teacher" rules={[{ required: true, message: '请输入辅导老师' }]}>
            <Input placeholder="请输入辅导老师" />
          </Form.Item>
          <Form.Item label="课程状态" name="status">
            <Select options={COURSE_BAG_ACTIVITY_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item label="开课方式" name="type">
            <Select options={COURSE_BAG_ACTIVITY_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item label="预售开始时间" name="saleBeginAt" rules={[{ required: true, message: '请选择预售开始时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          {mode === 'create' ? (
            <Form.Item label="预售持续天数" name="presaleDays">
              <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入持续天数" />
            </Form.Item>
          ) : (
            <Form.Item label="预售结束时间" name="saleEndAt" rules={[{ required: true, message: '请选择预售结束时间' }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          )}
          {Number(courseType) === 1 ? (
            <>
              <Form.Item label="开课时间" name="beginAt" rules={[{ required: true, message: '请选择开课时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              {mode === 'create' ? (
                <Form.Item label="开课持续天数" name="courseDays">
                  <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入持续天数" />
                </Form.Item>
              ) : (
                <Form.Item label="结课时间" name="endAt" rules={[{ required: true, message: '请选择结课时间' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              )}
            </>
          ) : null}
          <Form.Item label="原始金额" name="orgAmt" rules={[{ required: true, message: '请输入原始金额' }]}>
            <Space.Compact block>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="单位元" />
              <div className="compact-addon">元</div>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="实际金额" name="amt" rules={[{ required: true, message: '请输入实际金额' }]}>
            <Space.Compact block>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="单位元" />
              <div className="compact-addon">元</div>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="课程数量" name="num" rules={[{ required: true, message: '请输入课程数量' }]}>
            <InputNumber precision={0} style={{ width: '100%' }} placeholder="请输入课程数量" />
          </Form.Item>
          <Form.Item label="微信号" name="chatNo">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item label="详情图地址" name="iconDetail" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="上传详情图" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={(options) => onUpload('iconDetail', options)}
                disabled={uploadState.iconDetail.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.iconDetail.uploading}>
                  上传详情图
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.iconDetail.uploading ? '上传中...' : uploadState.iconDetail.message || '支持上传详情图'}
              </Typography.Text>
              {detailValue ? (
                <Image width={108} height={108} style={{ borderRadius: 20, objectFit: 'cover' }} src={detailValue} alt="详情图" />
              ) : null}
            </Space>
          </Form.Item>
          <Form.Item label="优惠券图地址" name="iconTicket" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="上传优惠券图" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={(options) => onUpload('iconTicket', options)}
                disabled={uploadState.iconTicket.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.iconTicket.uploading}>
                  上传优惠券图
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.iconTicket.uploading ? '上传中...' : uploadState.iconTicket.message || '支持上传优惠券图'}
              </Typography.Text>
              {ticketValue ? (
                <Image width={108} height={108} style={{ borderRadius: 20, objectFit: 'cover' }} src={ticketValue} alt="优惠券图" />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
