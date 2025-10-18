// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScoresRadarByYear from './pages/ScoresRadarByYear';
import { isAuthed } from './auth';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyResult from './pages/VerifyResult';



const RequireAuth = ({ children }) => {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* 公開ページ */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-result" element={<VerifyResult />} />


        {/* 認証必須ページ */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/charts/radar"
          element={
            <RequireAuth>
              <ScoresRadarByYear />
            </RequireAuth>
          }
        />

        {/* レガシー掃除：古い /home は /dashboard に寄せる */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
