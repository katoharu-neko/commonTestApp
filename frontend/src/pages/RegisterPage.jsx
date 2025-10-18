import React, { useState } from "react";
import { register } from "../api/authApi";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: 2, // デフォルト: 一般ユーザー
  });
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "roleId" ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await register(form.name, form.email, form.password, form.roleId);
      const token = res?.data?.token;
      if (token) {
        localStorage.setItem("jwt", token);
      }
      // 開発モードではメール検証URLはバックエンドのコンソールに出ます。
      alert("仮登録しました。バックエンドのコンソールに出た確認URLを開いて本登録してください。");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "登録に失敗しました");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 40 }}>
      <h2>新規ユーザー登録</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">お名前</label>
          <input
            name="name"
            className="form-control"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">メールアドレス</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">パスワード</label>
          <input
            name="password"
            type="password"
            className="form-control"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
        </div>

        {/* ロール選択（ADMIN は UI には出さない） */}
        <div className="mb-3">
          <label className="form-label">ロール</label>
          <select
            name="roleId"
            className="form-select"
            value={form.roleId}
            onChange={onChange}
          >
            <option value={2}>一般ユーザー</option>
            <option value={3}>教職ユーザー</option>
          </select>
          <div className="form-text">
            管理者ロールは UI からは選択できません。
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button className="btn btn-primary" type="submit">
          登録する
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
