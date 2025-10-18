// src/components/Layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // ← 大小文字を実体に合わせる

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
