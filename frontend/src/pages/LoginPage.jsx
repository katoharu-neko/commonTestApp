// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import api from '../api/apiClient';
import { setToken, isAuthenticated } from '../auth';
import { useNavigate, Navigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setErr('ログイン失敗：メールまたはパスワードを確認してください');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>ログイン</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <label>
          パスワード
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        {err && <div style={{ color: 'crimson' }}>{err}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
        >
          {loading ? '送信中…' : 'ログイン'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
