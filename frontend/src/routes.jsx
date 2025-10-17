// frontend/src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ScoreInputPage from './pages/ScoreInputPage';
import RequireAuth from './components/RequireAuth';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ログイン（公開） */}
      <Route path="/" element={<LoginPage />} />

      {/* 古い /home ルートが残っていても常に /dashboard に寄せる */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      {/* 認証必須 */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/scores/input"
        element={
          <RequireAuth>
            <ScoreInputPage />
          </RequireAuth>
        }
      />

      {/* それ以外はトップへ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
