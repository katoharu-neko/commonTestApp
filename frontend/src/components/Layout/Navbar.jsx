// src/components/Layout/Navbar.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';
import { clearToken, getToken } from '../../auth';

import logoSvg from '../../assets/images/logo.svg';
import dashboardIcon from '../../assets/images/menu/dashboard.svg';
import chartIcon from '../../assets/images/menu/chart.svg';
import userIcon from '../../assets/images/menu/user.svg';
import logoutIcon from '../../assets/images/menu/logout.svg';

function Navbar() {
  const navigate = useNavigate();
  const isAuthed = !!getToken();

  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ユーザー名取得
  useEffect(function () {
    if (!isAuthed) {
      setUserName('');
      return;
    }

    var alive = true;

    (async function load() {
      try {
        const profile = await userApi.fetchCurrentUser();
        if (alive) {
          // optional chaining は使わない
          const name = profile && (profile.name || profile.email) ? (profile.name || profile.email) : '';
          setUserName(name);
        }
      } catch (e) {
        console.error('ユーザー情報の取得に失敗しました', e);
        if (alive) setUserName('');
      }
    })();

    return function cleanup() { alive = false; };
  }, [isAuthed]);

  // 認証切れ時にログインへ戻す
  useEffect(function () {
    function handleUnauthorized() {
      setMenuOpen(false);
      navigate('/login', { replace: true });
    }

    window.addEventListener('app:unauthorized', handleUnauthorized);
    return function cleanup() {
      window.removeEventListener('app:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  // メニュー外クリックで閉じる
  useEffect(function () {
    function handleClickOutside(ev) {
      if (menuRef.current && !menuRef.current.contains(ev.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function cleanup() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    clearToken();
    navigate('/login', { replace: true });
  }

  function handleMenuNavigate(path) {
    setMenuOpen(false);
    navigate(path);
  }

  function linkStyle(args) {
    const isActive = args && args.isActive;
    return {
      padding: '8px 12px',
      textDecoration: 'none',
      color: isActive ? '#111' : '#444',
      fontWeight: isActive ? 700 : 400,
      borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
    };
  }

  const menuButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
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

  const menuItems = useMemo(
    function () {
      return [
        {
          key: 'dashboard',
          label: 'ダッシュボード',
          icon: dashboardIcon,
          onClick: function () {
            handleMenuNavigate('/');
          },
        },
        {
          key: 'chart',
          label: 'チャート表示入力画面',
          icon: chartIcon,
          onClick: function () {
            handleMenuNavigate('/scores/radar/year');
          },
        },
        {
          key: 'profile',
          label: 'ユーザー情報',
          icon: userIcon,
          onClick: function () {
            handleMenuNavigate('/user');
          },
        },
      ];
    },
    []
  );

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fafafa',
      }}
    >
      <NavLink
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginRight: 'auto',
          textDecoration: 'none',
          color: '#1f2937',
          fontWeight: 700,
        }}
        onClick={function () {
          setMenuOpen(false);
        }}
      >
        <img
          src={logoSvg}
          alt="Test Adviser ロゴ"
          style={{ width: 42, height: 42, display: 'block' }}
        />
        <span style={{ fontSize: 18 }}>Common Test Adviser</span>
      </NavLink>

      {isAuthed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 600, color: '#222' }}>
            {userName ? userName + ' さん' : 'ユーザー'}
          </span>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={function () { setMenuOpen(function (p) { return !p; }); }}
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
                  width: 240,
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  background: '#fff',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                {menuItems.map(function (item, index) {
                  return (
                    <React.Fragment key={item.key}>
                      <button type="button" style={menuButtonStyle} onClick={item.onClick}>
                        <img src={item.icon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
                        <span>{item.label}</span>
                      </button>
                      {index < menuItems.length - 1 && <hr style={dividerStyle} />}
                    </React.Fragment>
                  );
                })}
                <hr style={dividerStyle} />
                <button
                  type="button"
                  style={Object.assign({}, menuButtonStyle, { color: '#b91c1c', fontWeight: 600 })}
                  onClick={function () {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <img src={logoutIcon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
                  <span>ログアウト</span>
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

export default Navbar;
