// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/authApi';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: 2, // 2: 一般, 3: 教職
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'roleId' ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setMsg(res?.message || '仮登録が完了しました。メールをご確認ください。');
    } catch (error) {
      console.error(error);
      setErr('登録に失敗しました。入力内容をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card">
      <h2 className="form-card__title">新規登録</h2>
      <form onSubmit={onSubmit} autoComplete="on" className="form-stack">
        <label className="form-field">
          <span>お名前</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="山田 太郎"
            required
          />
        </label>

        <label className="form-field">
          <span>メールアドレス</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="form-field">
          <span>パスワード</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </label>

        <label className="form-field">
          <span>ユーザー区分</span>
          <select name="roleId" value={form.roleId} onChange={onChange}>
            <option value={2}>一般ユーザー</option>
            <option value={3}>教職ユーザー</option>
          </select>
        </label>

        {err && <div className="form-error">{err}</div>}
        {msg && <div className="form-success">{msg}</div>}

        <button type="submit" disabled={loading} className="button-primary">
          {loading ? '送信中…' : '登録する'}
        </button>
      </form>

      <div className="form-footnote">
        すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
      </div>
    </div>
  );
}
