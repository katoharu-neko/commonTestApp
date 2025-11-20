// src/pages/Dashboard.jsx
import React from 'react';
import OverallDeviationTrend from '../components/dashboard/OverallDeviationTrend';

export default function Dashboard() {
  return (
    <div className="dashboard-grid">
      <OverallDeviationTrend />
    </div>
  );
}
