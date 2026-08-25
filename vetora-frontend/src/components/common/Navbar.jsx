import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-emerald-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <span>🐾 VETORA</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm hidden md:inline">{user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-emerald-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;