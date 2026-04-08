import React from 'react';
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Space,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  EMPTY_CREATE_FORM,
  USER_EDIT_STATUS_OPTIONS,
  USER_SEX_OPTIONS,
  USER_STATUS_OPTIONS,
} from '../utils/forms';

export function UserModal({
  open,
  mode,
  form,
  roles,
  rolesLoading,
  submitting,
  uploadState,
  avatarValue,
  onCancel,
  onSubmit,
  onUpload,
}) {
  return (
    <Modal
      title={mode === 'create' ? '新增用户' : '编辑用户'}
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
        {mode === 'create' ? '创建后台用户并分配角色。' : '更新用户基础资料与状态。'}
      </Typography.Paragraph>
      <Form form={form} layout="vertical" initialValues={EMPTY_CREATE_FORM} onFinish={onSubmit}>
        <div className="form-grid">
          {mode === 'create' ? (
            <>
              <Form.Item label="用户名" name="account" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item label="状态" name="status">
                <Select options={USER_STATUS_OPTIONS} />
              </Form.Item>
              <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true, message: '请再次输入密码' }]}>
                <Input.Password placeholder="请再次输入密码" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item label="用户 ID" name="id">
                <Input disabled />
              </Form.Item>
              <Form.Item label="手机号" name="phone">
                <Input placeholder="请输入手机号" />
              </Form.Item>
              <Form.Item label="邮箱" name="email">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item label="姓名" name="name">
                <Input placeholder="请输入姓名" />
              </Form.Item>
              <Form.Item label="性别" name="sex">
                <Select allowClear placeholder="未知" options={USER_SEX_OPTIONS} />
              </Form.Item>
              <Form.Item label="状态" name="status">
                <Select options={USER_EDIT_STATUS_OPTIONS} />
              </Form.Item>
            </>
          )}

          <Form.Item label="角色" name="roleid">
            <Select
              allowClear
              placeholder="请选择角色"
              loading={rolesLoading}
              options={roles.map((role) => ({
                value: String(role.id),
                label: role.name,
              }))}
            />
          </Form.Item>

          <Form.Item label="头像地址" name="avatar" className="form-field--full">
            <Input placeholder="可直接粘贴图片 URL" />
          </Form.Item>

          <Form.Item label="上传头像" className="form-field--full">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUpload}
                disabled={uploadState.uploading}
              >
                <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                  上传头像
                </Button>
              </Upload>
              <Typography.Text type="secondary">
                {uploadState.uploading ? '上传中...' : uploadState.message || '支持直接上传图片文件'}
              </Typography.Text>
              {avatarValue ? (
                <Image
                  width={96}
                  height={96}
                  style={{ borderRadius: 20, objectFit: 'cover' }}
                  src={avatarValue}
                  alt="头像预览"
                />
              ) : null}
            </Space>
          </Form.Item>

          {mode === 'create' ? (
            <>
              <Form.Item label="邮箱" name="email">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item label="手机号" name="phone">
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </>
          ) : null}
        </div>
      </Form>
    </Modal>
  );
}
