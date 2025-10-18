// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authApi from '../api/authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('トークンが見つかりません。');
      return;
    }
    (async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus('ok');
        setMessage(res?.message || 'メール認証が完了しました。ログインしてください。');
      } catch (e) {
        console.error(e);
        setStatus('error');
        setMessage('メール認証に失敗しました。リンクの有効期限切れか、無効なトークンです。');
      }
    })();
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>メール認証</h2>
      {status === 'loading' && <p>確認中です…</p>}
      {status === 'ok' && (
        <>
          <p style={{ color: 'green' }}>{message}</p>
          <p><Link to="/login">ログインへ</Link></p>
        </>
      )}
      {status === 'error' && (
        <>
          <p style={{ color: 'crimson' }}>{message}</p>
          <p><Link to="/">トップへ戻る</Link></p>
        </>
      )}
    </div>
  );
}
