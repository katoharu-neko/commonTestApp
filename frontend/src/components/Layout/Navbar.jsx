// src/components/Layout/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../auth';

const linkStyle = ({ isActive }) => ({
  padding: '8px 12px',
  borderRadius: 6,
  textDecoration: 'none',
  color: isActive ? '#fff' : '#111',
  background: isActive ? '#2563eb' : 'transparent',
});

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10, background: '#fff',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between'
      }}>
        <div style={{ fontWeight: 700 }}>Common Test App</div>

        <nav style={{ display: 'flex', gap: 8 }}>
          <NavLink to="/dashboard" style={linkStyle}>ダッシュボード</NavLink>
          <NavLink to="/charts/radar" style={linkStyle}>レーダーチャート（年度）</NavLink>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 12px', borderRadius: 6,
            border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Navbar;
