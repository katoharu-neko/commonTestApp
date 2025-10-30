// src/components/Layout/AppLayout.jsx
import React from 'react';
import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header>
        <Navbar />
      </header>
      <main className="app-shell__main">
        {children}
      </main>
    </div>
  );
}
