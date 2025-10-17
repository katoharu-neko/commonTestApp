// frontend/src/components/NavBar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (
    <nav
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        background: '#fafafa',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <strong>Common Test App</strong>
      <Link to="/dashboard">ダッシュボード</Link>
      <Link to="/scores/input">得点入力</Link>
      <div style={{ marginLeft: 'auto' }}>
        {isLoggedIn ? (
          <button onClick={handleLogout}>ログアウト</button>
        ) : (
          <Link to="/">ログイン</Link>
        )}
      </div>
    </nav>
  );
}
