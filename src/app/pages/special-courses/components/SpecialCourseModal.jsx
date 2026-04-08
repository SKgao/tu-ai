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
  COURSE_STATUS_OPTIONS,
  COURSE_TYPE_OPTIONS,
  EMPTY_FORM,
} from '../utils/forms';

export function SpecialCourseModal({
  open,
  mode,
  form,
  books,
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
      title={mode === 'create' ? '新增精品课程' : '编辑精品课程'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'create' ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={submitting}
      width={860}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        保留旧版 `specialCourse` 的课程配置、上下架和已购课程查看能力。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          <Form.Item label="课程 ID" name="textbookId" rules={[{ required: true, message: '请选择课程' }]}>
            <Select
              disabled={mode === 'edit'}
              placeholder="请选择课程"
              options={books.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="课程名称" name="textbookName" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input placeholder="请输入课程名称" />
          </Form.Item>
          <Form.Item label="辅导老师" name="teacher" rules={[{ required: true, message: '请输入辅导老师' }]}>
            <Input placeholder="请输入辅导老师" />
          </Form.Item>
          <Form.Item label="课程状态" name="status" rules={[{ required: true, message: '请选择课程状态' }]}>
            <Select options={COURSE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item label="预售开始时间" name="saleBeginAt" rules={[{ required: true, message: '请选择预售开始时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="预售结束时间" name="saleEndAt" rules={[{ required: true, message: '请选择预售结束时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="开课方式" name="type" rules={[{ required: true, message: '请选择开课方式' }]}>
            <Select options={COURSE_TYPE_OPTIONS} />
          </Form.Item>
          {Number(courseType) === 1 ? (
            <>
              <Form.Item label="开课时间" name="beginAt" rules={[{ required: true, message: '请选择开课时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="结课时间" name="endAt" rules={[{ required: true, message: '请选择结课时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
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
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入课程数量" />
          </Form.Item>
          <Form.Item label="微信号" name="chatNo">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item label="详情图片地址" name="iconDetail">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>
          <Form.Item label="优惠券图地址" name="iconTicket">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>

          <Form.Item label="上传详情图片" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={(options) => onUpload('iconDetail', options)}
                disabled={uploadState.iconDetail.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.iconDetail.uploading}>
                  上传详情图片
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.iconDetail.uploading ? '上传中...' : uploadState.iconDetail.message || '支持上传图片'}
              </Typography.Text>
              {detailValue ? (
                <Image width={96} height={96} style={{ borderRadius: 20, objectFit: 'cover' }} src={detailValue} alt="详情图片" />
              ) : null}
            </Space>
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
                {uploadState.iconTicket.uploading ? '上传中...' : uploadState.iconTicket.message || '支持上传图片'}
              </Typography.Text>
              {ticketValue ? (
                <Image width={96} height={96} style={{ borderRadius: 20, objectFit: 'cover' }} src={ticketValue} alt="优惠券图" />
              ) : null}
            </Space>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
