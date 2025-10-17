// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/userApi';
import { loginWithToken } from '../auth';

const LoginPage = () => {
  const navi = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { token } = await apiLogin(email, password);
      loginWithToken(token);
      navi('/dashboard', { replace: true });
    } catch (e) {
      console.error(e);
      setErr('ログインに失敗しました。メール・パスワードをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: '#f9fafb', padding: 16
    }}>
      <form onSubmit={doLogin} style={{
        width: '100%', maxWidth: 420, background: '#fff',
        padding: 24, border: '1px solid #e5e7eb', borderRadius: 12
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>ログイン</h2>

        <label style={{ display: 'block', marginBottom: 6 }}>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 16 }}
        />

        {!!err && <div style={{ color:'red', marginBottom: 12 }}>{err}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 12, borderRadius: 8,
            background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer'
          }}
        >
          {loading ? '送信中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
