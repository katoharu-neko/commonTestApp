// src/components/Layout/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const linkStyle = ({ isActive }) => ({
    padding: '8px 12px',
    textDecoration: 'none',
    color: isActive ? '#111' : '#444',
    fontWeight: isActive ? 700 : 400,
    borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
  });

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px',
      borderBottom: '1px solid #e5e7eb',
      background: '#fafafa'
    }}>
      <div style={{ marginRight: 'auto', fontWeight: 700 }}>Common Test App</div>

      {isAuthed ? (
        <>
          <NavLink to="/" style={linkStyle} end>ダッシュボード</NavLink>
          <NavLink to="/scores/radar/year" style={linkStyle}>レーダー（年度）</NavLink>
          <button onClick={handleLogout} style={{ marginLeft: 8, padding: '6px 10px' }}>
            ログアウト
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" style={linkStyle}>ログイン</NavLink>
          <NavLink to="/register" style={linkStyle}>新規登録</NavLink>
        </>
      )}
    </nav>
  );
}
