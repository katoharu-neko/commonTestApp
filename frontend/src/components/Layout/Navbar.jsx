import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const onLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <nav style={{ padding: "8px 16px", borderBottom: "1px solid #eee" }}>
      <NavLink to="/dashboard" style={{ marginRight: 12 }}>
        ダッシュボード
      </NavLink>
      <NavLink to="/scores/radar" style={{ marginRight: 12 }}>
        レーダーチャート
      </NavLink>
      <span style={{ float: "right" }}>
        {token ? (
          <button onClick={onLogout}>ログアウト</button>
        ) : (
          <>
            <NavLink to="/login" style={{ marginRight: 12 }}>ログイン</NavLink>
            <NavLink to="/register">新規登録</NavLink>
          </>
        )}
      </span>
    </nav>
  );
}
