// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ScoresRadarByYear from './pages/ScoresRadarByYear';
import UserProfile from './pages/UserProfile';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyResult from './pages/VerifyResult';

import ProtectedRoute from './routes/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ローカル検証（JSON API版） */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* B案：バックエンドの302リダイレクト先（本番） */}
      <Route path="/verify-email/success" element={<VerifyResult />} />
      <Route path="/verify-email/failed" element={<VerifyResult />} />

      {/* 互換：旧の結果ページ（?status=） */}
      <Route path="/verify-result" element={<VerifyResult />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scores/radar/year"
        element={
          <ProtectedRoute>
            <ScoresRadarByYear />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
