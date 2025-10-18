// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthed, clearToken } from '../../auth';

const Navbar = () => {
  const nav = useNavigate();
  const authed = isAuthed();

  const doLogout = () => {
    clearToken();
    nav('/login', { replace: true });
  };

  return (
    <nav style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>
      <Link to="/dashboard">Dashboard</Link>
      {authed && (
        <>
          <Link to="/charts/radar">Radar</Link>
        </>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {!authed ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={doLogout} style={{ cursor: 'pointer' }}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
