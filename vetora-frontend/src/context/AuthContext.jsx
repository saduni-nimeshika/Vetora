import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/v1/users/login', { email, password });
      const { token, id, name, email: userEmail, role } = res.data;
      
      localStorage.setItem('token', token);
      const userData = { id, name, email: userEmail, role };
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      toast.success('✅ Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/api/v1/users/register', userData);
      toast.success('✅ Registration successful! Please verify your email.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, loading, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isDoctor: user?.role === 'DOCTOR',
      isPetOwner: user?.role === 'PET_OWNER',
    }}>
      {children}
    </AuthContext.Provider>
  );
};