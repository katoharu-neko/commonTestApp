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
    <div className="card form-card">
      <h2 className="form-card__title">メール認証</h2>
      {status === 'loading' && <p className="status-message">確認中です…</p>}
      {status === 'ok' && (
        <div className="status-message status-message--ok">
          <p>{message}</p>
          <p><Link to="/login">ログインへ</Link></p>
        </div>
      )}
      {status === 'error' && (
        <div className="status-message status-message--error">
          <p>{message}</p>
          <p><Link to="/">トップへ戻る</Link></p>
        </div>
      )}
    </div>
  );
}
