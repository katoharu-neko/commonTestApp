// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login', { replace: true });
  };

  return (
    <header style={{ borderBottom: '1px solid #eee', padding: '10px 16px', display: 'flex', gap: 12 }}>
      <Link to="/dashboard">ダッシュボード</Link>
      <Link to="/scores">スコア・レーダー</Link> {/* ← ここが ScoresRadarByYear に紐づく */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {token ? (
          <button onClick={handleLogout}>ログアウト</button>
        ) : (
          <>
            <Link to="/login">ログイン</Link>
            <Link to="/register">新規登録</Link>
          </>
        )}
      </div>
    </header>
  );
}
