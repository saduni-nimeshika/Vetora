import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import Home from './Home'; // 1. Home Component එක Import කිරීම

// Local Storage එකෙන් User ගන්න Helper එක
const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

// 💡 Security Enhanced Protected Route
const ProtectedRoute = ({ children, allowedRole }) => {
  const currentUser = getStoredUser();

  // User කෙනෙක් නැත්නම් Login එකට යවනවා
  if (!currentUser) {
    return <Navigate to="/login" replace={true} />;
  }

  // Admin විතරක් යන්න ඕන තැනකට වෙන කෙනෙක් ආවොත් Login එකට යවනවා
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};

function App() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  // 💡 Security Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user'); // LocalStorage එකෙන් user අයින් කරනවා
    localStorage.clear();            // LocalStorage ඔක්කොම clear කරනවා
    navigate('/login', { replace: true }); // History එක replace කරනවා
  };

  return (
    <Routes>
      {/* 💡 Main Landing Page (Home Page) */}
      <Route path="/" element={<Home />} />

      {/* 💡 Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* 💡 Protected Admin Dashboard */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />

      {/* 💡 Protected User Dashboard */}
      <Route 
        path="/user-dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard user={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />

      {/* 💡 Fallback Route - වෙනත් ඕනෑම නොදන්නා Path එකකට ගියොත් Home එකට යවනවා */}
      <Route path="*" element={<Navigate to="/" replace={true} />} />
    </Routes>
  );
}

export default App;