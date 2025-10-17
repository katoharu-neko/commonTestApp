// src/pages/LoginPage.jsx
import React, { useState } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await apiClient.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      nav("/");
    } catch (error) {
      console.error(error);
      setErr("ログインに失敗しました");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "64px auto" }}>
      <h2>ログイン</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
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
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}
