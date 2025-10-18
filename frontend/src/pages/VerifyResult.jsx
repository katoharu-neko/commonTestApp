// src/pages/VerifyResult.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const messages = {
  success: { title: '認証が完了しました', body: 'ログインしてはじめましょう。' },
  expired: { title: 'トークンの有効期限が切れています', body: '再送して再度お試しください。' },
  used:    { title: 'このトークンはすでに使用済みです', body: 'ログインできるかお試しください。' },
  invalid: { title: '無効なトークンです', body: 'メールのリンクを再度ご確認ください。' },
};

const VerifyResult = () => {
  const [sp] = useSearchParams();
  const status = sp.get('status') || 'invalid';
  const m = messages[status] || messages.invalid;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>{m.title}</h2>
      <p>{m.body}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/login">ログインへ</Link>
        <Link to="/verify-email">認証ページへ</Link>
      </div>
    </div>
  );
};

export default VerifyResult;
