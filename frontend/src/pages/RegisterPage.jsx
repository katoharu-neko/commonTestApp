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
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>新規登録</h2>
      <form onSubmit={onSubmit} autoComplete="on">
        <div style={{ marginBottom: 12 }}>
          <label>お名前</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="山田 太郎"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>メールアドレス</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>パスワード</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>ユーザー区分</label>
          <select name="roleId" value={form.roleId} onChange={onChange}>
            <option value={2}>一般ユーザー</option>
            <option value={3}>教職ユーザー</option>
          </select>
        </div>

        {err && <div style={{ color: 'crimson', marginBottom: 12 }}>{err}</div>}
        {msg && <div style={{ color: 'green', marginBottom: 12 }}>{msg}</div>}

        <button type="submit" disabled={loading}>
          {loading ? '送信中…' : '登録する'}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
      </div>
    </div>
  );
}
