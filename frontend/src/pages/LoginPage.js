// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setLoading(true);
    try {
      // バックエンド: POST /api/auth/login {email, password} -> {token}
      const res = await api.post('/api/auth/login', { email, password });
      const token = res?.data?.token;
      if (!token) {
        throw new Error('トークンが取得できませんでした。');
      }
      localStorage.setItem('token', token);

      // ★ ここを "from" ではなく固定で /dashboard に
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setErrMsg('ログインに失敗しました。メール/パスワードをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '48px auto' }}>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{ width: '100%' }}
          />
        </label>
        <label>
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="******"
            style={{ width: '100%' }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
        {errMsg && <div style={{ color: 'red' }}>{errMsg}</div>}
      </form>
    </div>
  );
}
