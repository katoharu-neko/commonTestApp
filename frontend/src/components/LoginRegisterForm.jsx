// src/components/LoginRegisterForm.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function LoginRegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // 新規登録用
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");

  // すでにログイン済みなら自動でダッシュボードへ
  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await apiClient.post("/api/auth/login", { email, password });
      if (data?.token) {
        localStorage.setItem("jwt", data.token);
        navigate("/dashboard", { replace: true }); // ★ここが重要
      } else {
        setError("トークンが取得できませんでした");
      }
    } catch (err) {
      console.error(err);
      setError("ログインに失敗しました");
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await apiClient.post("/api/auth/register", { name, email, password });
      if (data?.token) {
        localStorage.setItem("jwt", data.token);
        navigate("/dashboard", { replace: true }); // 登録後も即ログイン扱い
      } else {
        setError("トークンが取得できませんでした");
      }
    } catch (err) {
      console.error(err);
      setError("新規登録に失敗しました");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 16 }}>{mode === "login" ? "ログイン" : "新規登録"}</h2>
      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
      <form onSubmit={mode === "login" ? onLogin : onRegister} style={{ display: "grid", gap: 12 }}>
        {mode === "register" && (
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === "login" ? "ログイン" : "登録する"}</button>
      </form>

      <div style={{ marginTop: 12 }}>
        {mode === "login" ? (
          <button onClick={() => setMode("register")}>新規登録へ</button>
        ) : (
          <button onClick={() => setMode("login")}>ログインへ戻る</button>
        )}
      </div>
    </div>
  );
}
