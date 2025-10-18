// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/apiClient';
import { authApi } from '../api/authApi';

const VerifyEmailPage = () => {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [token, setToken] = useState(sp.get('token') || '');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const t = sp.get('token');
    if (t) {
      handleVerify(t);
    }
    // eslint-disable-next-line
  }, []);

  const handleVerify = async (t) => {
    setErr(''); setMsg('');
    try {
      // バックエンドの /api/auth/verify は GET でリダイレクトする設計。
      // ここは直接 GET を叩いて結果の status でフロントに遷移してもOKだが、
      // 単純化のため、ユーザーはメール内リンクから遷移する想定。
      // 手入力時は以下の方法：バックエンドを開く（別タブ）→戻る
      window.location.href = `http://localhost:8080/api/auth/verify?token=${t}`;
    } catch (e) {
      setErr('検証に失敗しました');
    }
  };

  const resend = async () => {
    setErr(''); setMsg('');
    if (!email) return setErr('メールを入力してください');
    try {
      const { message } = await authApi.resend(email);
      setMsg(message || '再送しました。メールをご確認ください。');
    } catch (e) {
      setErr('再送に失敗しました');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>メール認証</h2>
      <p>メールに記載のリンクが開けない場合、以下にトークンを貼り付けてください。</p>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="token" value={token} onChange={e => setToken(e.target.value)} />
        <button onClick={() => handleVerify(token)}>このトークンで認証</button>
        <hr />
        <div>メールが届かない？ 登録メールアドレス宛に再送します</div>
        <input placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <button onClick={resend}>再送する</button>
      </div>
      {msg && <div style={{ color: 'green', marginTop: 12 }}>{msg}</div>}
      {err && <div style={{ color: 'crimson', marginTop: 12 }}>{err}</div>}
      <div style={{ marginTop: 16 }}>
        認証が完了したら <Link to="/login">ログイン</Link> できます。
      </div>
    </div>
  );
};

export default VerifyEmailPage;
