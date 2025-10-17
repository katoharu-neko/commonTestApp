// src/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ScoresRadarByYear from './pages/ScoresRadarByYear';
import LoginPage from './pages/LoginPage';

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated()
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/login" replace />
      } />

      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      <Route element={
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/charts/radar" element={<ScoresRadarByYear />} />
      </Route>

      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={
        isAuthenticated()
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

export default AppRoutes;
