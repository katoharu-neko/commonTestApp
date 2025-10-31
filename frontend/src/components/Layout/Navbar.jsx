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

  function linkClassName(args) {
    const isActive = args && args.isActive;
    return 'navbar__auth-link' + (isActive ? ' navbar__auth-link--active' : '');
  }

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
    <nav className="navbar">
      <NavLink
        to="/"
        className="navbar__brand"
        onClick={function () {
          setMenuOpen(false);
        }}
      >
        <img
          src={logoSvg}
          alt="Test Adviser ロゴ"
          style={{ width: 45, height: 45, display: 'block' }}
        />
      </NavLink>

      {isAuthed ? (
        <div className="navbar__actions">
          <span className="navbar__user">
            {userName ? userName + ' さん' : 'ユーザー'}
          </span>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={function () { setMenuOpen(function (p) { return !p; }); }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="navbar__menu-trigger"
            >
              ☰
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="menu-panel"
              >
                {menuItems.map(function (item, index) {
                  return (
                    <React.Fragment key={item.key}>
                      <button type="button" className="menu-panel__item" onClick={item.onClick}>
                        <img src={item.icon} alt="" aria-hidden="true" className="menu-panel__icon" />
                        <span>{item.label}</span>
                      </button>
                      {index < menuItems.length - 1 && <hr className="menu-divider" />}
                    </React.Fragment>
                  );
                })}
                <hr className="menu-divider" />
                <button
                  type="button"
                  className="menu-panel__item menu-panel__item--danger"
                  onClick={function () {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <img src={logoutIcon} alt="" aria-hidden="true" className="menu-panel__icon" />
                  <span>ログアウト</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <NavLink to="/login" className={linkClassName}>ログイン</NavLink>
          <NavLink to="/register" className={linkClassName}>新規登録</NavLink>
        </>
      )}
    </nav>
  );
}

export default Navbar;
