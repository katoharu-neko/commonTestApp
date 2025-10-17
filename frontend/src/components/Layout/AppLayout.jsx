// src/components/Layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout = () => {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '16px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
