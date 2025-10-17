// src/routes.jsx
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import ScoreInputPage from "./pages/ScoreInputPage";
import LoginRegisterForm from "./components/LoginRegisterForm";

const isAuthed = () => !!localStorage.getItem("jwt");

const Protected = ({ children }) => {
  return isAuthed() ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/home", element: <Navigate to="/dashboard" replace /> }, // ★追加
      { path: "/login", element: <LoginRegisterForm /> },
      {
        path: "/dashboard",
        element: (
          <Protected>
            <Dashboard />
          </Protected>
        ),
      },
      {
        path: "/scores/input",
        element: (
          <Protected>
            <ScoreInputPage />
          </Protected>
        ),
      },
      { path: "*", element: <Navigate to="/dashboard" replace /> }, // 任意：その他もダッシュボードへ
    ],
  },
]);

export default router;