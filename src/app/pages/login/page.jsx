import React, { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginRequest } from '@/app/lib/http';
import { selectAuthLogin, useAuthStore } from '@/app/stores/auth';
import logo from '@/assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(selectAuthLogin);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values) {
    setLoading(true);
    setError('');

    try {
      const payload = await loginRequest(values);
      const result = payload?.data || {};
      const token =
        result.token ||
        result.accessToken ||
        result.jwt ||
        payload?.token ||
        '';

      if (!token) {
        throw new Error('登录成功，但接口未返回 token');
      }

      login(token, result);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__backdrop" />
      <div className="login-card">
        <div className="login-card__brand">
          <img src={logo} alt="图图" />
          <div>
            <h1>图图管理后台</h1>
            <p>新架构迁移入口</p>
          </div>
        </div>

        {error ? <Alert className="login-card__alert" type="error" showIcon message={error} /> : null}

        <Form
          form={form}
          className="login-form"
          layout="horizontal"
          autoComplete="off"
          colon={false}
          labelCol={{ flex: '68px' }}
          wrapperCol={{ flex: '1 1 auto' }}
          initialValues={{
            username: '',
            password: '',
          }}
          onValuesChange={() => {
            if (error) {
              setError('');
            }
          }}
          onFinish={handleSubmit}
        >
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item label=" " className="login-form__submit-row">
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
