import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginRequest } from '@/app/lib/http';
import { selectAuthLogin, useAuthStore } from '@/app/stores/auth';
import logo from '@/assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(selectAuthLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  });

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formValues.username || !formValues.password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = await loginRequest(formValues);
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

        {error ? <div className="login-card__alert">{error}</div> : null}

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <label className="form-field">
            <span>用户名</span>
            <input
              value={formValues.username}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="请输入用户名"
            />
          </label>
          <label className="form-field">
            <span>密码</span>
            <input
              type="password"
              value={formValues.password}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="请输入密码"
            />
          </label>
          <button
            type="submit"
            className="app-button app-button--primary login-form__submit"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
