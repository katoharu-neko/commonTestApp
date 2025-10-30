// src/pages/VerifyResult.jsx
import React from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';

const messages = {
  success: { title: '認証が完了しました', body: 'ログインしてはじめましょう。' },
  failed:  { title: '認証に失敗しました', body: 'リンクの有効期限切れ、または無効なトークンです。' },
  expired: { title: 'トークンの有効期限が切れています', body: '再送して再度お試しください。' },
  used:    { title: 'このトークンはすでに使用済みです', body: 'ログインできるかお試しください。' },
  invalid: { title: '無効なトークンです', body: 'メールのリンクを再度ご確認ください。' },
};

const VerifyResult = () => {
  const location = useLocation();
  const [sp] = useSearchParams();

  // 1) /verify-email/success | /verify-email/failed を優先
  const path = location.pathname.toLowerCase();
  let statusFromPath = null;
  if (path.endsWith('/success')) statusFromPath = 'success';
  else if (path.endsWith('/failed')) statusFromPath = 'failed';

  // 2) 互換：/verify-result?status=... でもOK
  const statusFromQuery = sp.get('status');

  const status = statusFromPath || statusFromQuery || 'invalid';
  const m = messages[status] || messages.invalid;

  return (
    <div className="card form-card">
      <h2 className="form-card__title">{m.title}</h2>
      <p className="status-message">{m.body}</p>
      <div className="scores-form-actions" style={{ justifyContent: 'flex-start' }}>
        <Link to="/login">ログインへ</Link>
        <Link to="/">トップへ</Link>
      </div>
    </div>
  );
};

export default VerifyResult;
