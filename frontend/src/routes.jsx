import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VerifyResult from "./pages/VerifyResult";
import Dashboard from "./pages/Dashboard";
import ScoresRadarByYear from "./pages/ScoresRadarByYear";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ルートは常にログインへ */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 認証不要ページ（レイアウトは共通でOKなら AppLayout のまま） */}
        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-result" element={<VerifyResult />} />
        </Route>

        {/* 認証必須ページ */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scores/radar" element={<ScoresRadarByYear />} />
        </Route>

        {/* フォールバック */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
