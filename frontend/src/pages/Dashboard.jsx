// src/pages/Dashboard.jsx
import React from 'react';
import RecentScoresRadar from '../components/dashboard/RecentScoresRadar';

export default function Dashboard() {
  return (
    <div className="dashboard-grid">
      <RecentScoresRadar />
    </div>
  );
}
