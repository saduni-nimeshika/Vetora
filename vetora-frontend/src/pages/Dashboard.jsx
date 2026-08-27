import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner w-10 h-10" />
        <p className="text-ink-400 text-sm font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else if (user?.role === 'DOCTOR') {
    return <Navigate to="/doctor/dashboard" />;
  } else if (user?.role === 'PET_OWNER') {
    return <Navigate to="/owner/dashboard" />;
  }

  return <Navigate to="/" />;
};

export default Dashboard;