import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

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