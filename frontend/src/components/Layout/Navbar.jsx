// src/components/Layout/Navbar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';
<<<<<<< ours
<<<<<<< ours

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem('token');
=======
import { clearToken, getToken } from '../../auth';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthed = !!getToken();
>>>>>>> theirs
=======
import { clearToken, getToken } from '../../auth';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthed = !!getToken();
>>>>>>> theirs
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isAuthed) {
      setUserName('');
      return;
    }

    let active = true;

    const loadUser = async () => {
      try {
        const profile = await userApi.fetchCurrentUser();
        if (active) {
          setUserName(profile?.name || profile?.email || '');
        }
      } catch (err) {
        console.error('ユーザー情報の取得に失敗しました', err);
        if (active) {
          setUserName('');
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [isAuthed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  const handleMenuNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const linkStyle = ({ isActive }) => ({
    padding: '8px 12px',
    textDecoration: 'none',
    color: isActive ? '#111' : '#444',
    fontWeight: isActive ? 700 : 400,
    borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
  });

  const menuButtonStyle = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 14px',
    background: 'transparent',
    border: 'none',
    fontSize: 15,
    cursor: 'pointer',
  };

  const dividerStyle = {
    margin: 0,
    border: 0,
    borderTop: '1px solid #e5e7eb',
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 600, color: '#222' }}>
            {userName ? `${userName} さん` : 'ユーザー'}
          </span>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: 6,
                padding: '6px 10px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ☰
            </button>
            {menuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 220,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: '#fff',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  style={menuButtonStyle}
                  onClick={() => handleMenuNavigate('/')}
                >
                  ダッシュボード
                </button>
                <hr style={dividerStyle} />
                <button
                  type="button"
                  style={menuButtonStyle}
                  onClick={() => handleMenuNavigate('/scores/radar/year')}
                >
                  チャート表示入力画面
                </button>
                <hr style={dividerStyle} />
                <button
                  type="button"
                  style={menuButtonStyle}
                  onClick={() => handleMenuNavigate('/user')}
                >
                  ユーザー情報
                </button>
                <hr style={dividerStyle} />
                <button
                  type="button"
                  style={{
                    ...menuButtonStyle,
                    color: '#b91c1c',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <NavLink to="/login" style={linkStyle}>ログイン</NavLink>
          <NavLink to="/register" style={linkStyle}>新規登録</NavLink>
        </>
      )}
    </nav>
  );
}
