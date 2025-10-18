// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setToken } from '../auth';

const LoginPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email.trim() || !pw) {
      setErr('メールとパスワードを入力してください');
      return;
    }
    try {
      setBusy(true);
      const { token } = await authApi.login({ email: email.trim(), password: pw });
      setToken(token);
      nav(from, { replace: true });
    } catch (e) {
      if (e?.response?.status === 403) setErr('メール認証が未完了です。メールをご確認ください。');
      else setErr('ログインに失敗しました。メール/パスワードをご確認ください。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>ログイン</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          パスワード
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </label>

        <button disabled={busy} type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db' }}>
          {busy ? '送信中…' : 'ログイン'}
        </button>

        {err && <div style={{ color: 'crimson' }}>{err}</div>}
      </form>

      <div style={{ marginTop: 16 }}>
        アカウントをお持ちでない方は <Link to="/register">新規登録</Link>
      </div>
    </div>
  );
};

export default LoginPage;
