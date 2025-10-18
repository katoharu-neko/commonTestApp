// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/authApi';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { token } = await authApi.login(form);
      if (!token) {
        throw new Error('トークンが取得できませんでした');
      }
      localStorage.setItem('jwt', token);
      // ルーター状態とガードの競合を避けるためハードリダイレクト
      window.location.replace('/dashboard');
    } catch (error) {
      console.error(error);
      setErr('メールアドレスまたはパスワードが正しくありません。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>ログイン</h2>
      <form onSubmit={onSubmit} autoComplete="on">
        <div style={{ marginBottom: 12 }}>
          <label>メールアドレス</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>パスワード</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="input"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {err && <div style={{ color: 'crimson', marginBottom: 12 }}>{err}</div>}

        <button type="submit" disabled={loading}>
          {loading ? '送信中…' : 'ログイン'}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        新規登録は <Link to="/register">こちら</Link>
      </div>
    </div>
  );
}
