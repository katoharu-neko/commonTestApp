// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import NavBar from './components/NavBar';

export default function App() {
  return (
    <Router>
      <NavBar />
      <div style={{ padding: '16px' }}>
        <AppRoutes />
      </div>
    </Router>
  );
}
