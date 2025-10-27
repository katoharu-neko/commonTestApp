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
    <div style={{ maxWidth: 380, margin: '40px auto' }}>
      <h2>ログイン</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="you@example.com"
            style={{ padding: 10 }}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          パスワード
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ padding: 10 }}
          />
        </label>
        <button type="submit" disabled={submitting} style={{ padding: '10px 12px' }}>
          {submitting ? '送信中…' : 'ログイン'}
        </button>

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <div>
          アカウントがない方は <NavLink to="/register">新規登録</NavLink>
        </div>
      </form>
    </div>
  );
}
