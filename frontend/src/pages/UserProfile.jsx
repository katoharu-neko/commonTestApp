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
    return (
      <div className="card placeholder-card">
        <p>読み込み中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card placeholder-card">
        <p className="form-error" style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card placeholder-card">
        <p>ユーザー情報が見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="card profile-card">
      <h2 className="section-title">ユーザー情報</h2>
      <dl className="profile-card__list">
        <dt>ユーザー名</dt>
        <dd>{profile.name || '未設定'}</dd>
        <dt>メールアドレス</dt>
        <dd>{profile.email}</dd>
        <dt>ロール</dt>
        <dd>{profile.role || '未設定'}</dd>
        <dt>メール認証</dt>
        <dd>{profile.verified ? '完了' : '未完了'}</dd>
      </dl>
    </div>
  );
}
