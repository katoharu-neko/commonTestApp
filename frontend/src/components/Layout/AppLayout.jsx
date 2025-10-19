// src/components/Layout/AppLayout.jsx
import React from 'react';
import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header>
        <Navbar />
      </header>
      <main style={{ flex: 1, padding: 16 }}>
        {children}
      </main>
    </div>
  );
}
