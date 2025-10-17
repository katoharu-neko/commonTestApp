// frontend/src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ScoreInputPage from './pages/ScoreInputPage';
import RequireAuth from './components/RequireAuth';
import AppLayout from './layouts/AppLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 公開ルート */}
      <Route path="/" element={<LoginPage />} />

      {/* 古い /home 参照は全て /dashboard に寄せる */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      {/* 認証が必要なルートは共通レイアウト(AppLayout)で包む */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scores/input" element={<ScoreInputPage />} />
      </Route>

      {/* 不明パスはトップへ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
