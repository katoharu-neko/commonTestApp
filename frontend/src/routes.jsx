// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Dashboard from './pages/Dashboard';

// ★ 実在のページ名に合わせる（ScoreRadarPage → ScoresRadarByYear）
import ScoresRadarByYear from './pages/ScoresRadarByYear';

export default function AppRoutes() {
  const hasToken = !!localStorage.getItem('jwt');

  return (
    <Routes>
      {/* 認可不要 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* 認可必須領域 */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        {/* /scores に ScoresRadarByYear を割り当て */}
        <Route path="/scores" element={<ScoresRadarByYear />} />
      </Route>

      {/* ルートはログイン状態に応じて誘導 */}
      <Route path="/" element={<Navigate to={hasToken ? '/dashboard' : '/login'} replace />} />

      {/* /home 互換 */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
