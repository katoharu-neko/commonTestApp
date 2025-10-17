// frontend/src/layouts/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <NavBar />
      <main style={{ padding: 16, maxWidth: 1080, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
