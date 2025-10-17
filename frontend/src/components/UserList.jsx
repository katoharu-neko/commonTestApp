import React, { useState, useEffect } from "react";
import { getAllUsers, registerUser } from "../api/userApi";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // 初回読み込み時にユーザー取得
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUser(form);
    alert("登録しました");
    setForm({ name: "", email: "", password: "" });
    fetchUsers();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>ユーザー登録</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="名前"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="メール"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">登録</button>
      </form>

      <h3>登録済みユーザー一覧</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} ({u.email})</li>
        ))}
      </ul>
    </div>
  );
}
