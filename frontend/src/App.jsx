// src/App.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  return (
    <div>
      {/* 最低限のメニューバー */}
      <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
        <Link to="/dashboard">ダッシュボード</Link>
        <Link to="/scores/input">得点入力</Link>
        <button onClick={logout}>ログアウト</button>
      </nav>

      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
