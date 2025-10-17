// src/components/NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{
      padding: "10px 16px",
      display: "flex",
      gap: 16,
      alignItems: "center",
      borderBottom: "1px solid #eee",
      position: "sticky",
      top: 0,
      background: "#fff",
      zIndex: 10
    }}>
      <Link to="/">Home</Link>
      <Link to="/scores/input">得点入力</Link>
      <button onClick={logout} style={{ marginLeft: "auto" }}>
        ログアウト
      </button>
    </nav>
  );
}
