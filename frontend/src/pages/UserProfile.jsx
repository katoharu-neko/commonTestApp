// src/pages/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchCurrentUser();
        if (active) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        if (active) {
          setError('ユーザー情報の取得に失敗しました。時間をおいて再度お試しください。');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div>読み込み中…</div>;
  }

  if (error) {
    return <div style={{ color: 'crimson' }}>{error}</div>;
  }

  if (!profile) {
    return <div>ユーザー情報が見つかりません。</div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', display: 'grid', gap: 16 }}>
      <h2>ユーザー情報</h2>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
        <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 12, columnGap: 16, margin: 0 }}>
          <dt style={{ fontWeight: 600 }}>ユーザー名</dt>
          <dd style={{ margin: 0 }}>{profile.name || '未設定'}</dd>
          <dt style={{ fontWeight: 600 }}>メールアドレス</dt>
          <dd style={{ margin: 0 }}>{profile.email}</dd>
          <dt style={{ fontWeight: 600 }}>ロール</dt>
          <dd style={{ margin: 0 }}>{profile.role || '未設定'}</dd>
          <dt style={{ fontWeight: 600 }}>メール認証</dt>
          <dd style={{ margin: 0 }}>{profile.verified ? '完了' : '未完了'}</dd>
        </dl>
      </div>
    </div>
  );
}
