// src/routes/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';

// ページ群（存在するファイル名に合わせてください）
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import ScoresRadarByYear from '../pages/ScoresRadarByYear';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import VerifyResult from '../pages/VerifyResult';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
