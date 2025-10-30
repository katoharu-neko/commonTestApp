// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import api from '../api/apiClient';
import { setToken as storeToken } from '../auth';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/auth/login', { email, password });
      // ← バックエンドのキー名に合わせる
      const token = res?.data?.token || res?.data?.accessToken || res?.data?.jwt;
      if (!token) {
        console.log('login response:', res?.data);
        setError('サーバーからトークンが返りませんでした。レスポンス形式を確認してください。');
        return;
      }
      storeToken(token);
      nav('/', { replace: true });
    } catch (err) {
      setError('ログインに失敗しました。メール・パスワードをご確認ください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card form-card form-card--narrow">
      <h2 className="form-card__title">ログイン</h2>
      <form onSubmit={onSubmit} className="form-stack">
        <label className="form-field">
          <span>メールアドレス</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="you@example.com"
          />
        </label>
        <label className="form-field">
          <span>パスワード</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>
        <button type="submit" disabled={submitting} className="button-primary">
          {submitting ? '送信中…' : 'ログイン'}
        </button>

        {error && <div className="form-error">{error}</div>}

        <div className="form-footnote">
          アカウントがない方は <NavLink to="/register">新規登録</NavLink>
        </div>
      </form>
    </div>
  );
}
