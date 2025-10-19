// src/App.jsx
import React from 'react';
import AppLayout from './components/Layout/AppLayout';
import AppRoutes from './routes';

export default function App() {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}
