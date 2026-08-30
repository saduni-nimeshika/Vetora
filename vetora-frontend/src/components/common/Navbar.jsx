import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaPaw, FaUser, FaSignOutAlt, FaBars, FaTimes, FaChevronDown,
  FaHome, FaCalendarAlt, FaClock, FaUserMd, FaUsers, FaClipboardList,
  FaUserClock, FaSearch, FaBell,
} from 'react-icons/fa';

const roleNavLinks = {
  ADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
    { name: 'Pending Doctors', path: '/admin/pending-doctors', icon: <FaUserClock /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <FaClipboardList /> },
  ],
  DOCTOR: [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <FaHome /> },
    { name: 'Appointments', path: '/doctor/appointments', icon: <FaCalendarAlt /> },
    { name: 'Availability', path: '/doctor/availability', icon: <FaClock /> },
    { name: 'Reminders', path: '/doctor/reminders', icon: <FaBell /> },
    { name: 'My Profile', path: '/doctor/profile', icon: <FaUserMd /> },
  ],
  PET_OWNER: [
    { name: 'Dashboard', path: '/owner/dashboard', icon: <FaHome /> },
    { name: 'My Pets', path: '/owner/pets', icon: <FaPaw /> },
    { name: 'Appointments', path: '/owner/appointments', icon: <FaCalendarAlt /> },
    { name: 'Find a Vet', path: '/search-doctors', icon: <FaSearch /> },
  ],
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navLinks = user?.role ? roleNavLinks[user.role] || [] : [];

  // Close mobile menu / profile dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 shadow-lg">
      <div className="page-container">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-white font-display shrink-0">
            <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <FaPaw className="text-lg" />
            </span>
            VETORA
          </Link>

          {/* Desktop nav links (role-based) */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link')}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <span className="avatar w-8 h-8 bg-white/90 text-primary-700 text-xs">
                    {initials}
                  </span>
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <FaChevronDown className={`text-white/70 text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-ink-100 py-2 animate-slideDown">
                    <div className="px-4 py-2 border-b border-ink-100 mb-1">
                      <p className="text-sm font-semibold text-ink-800 truncate">{user?.name}</p>
                      <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                      <span className="badge-info mt-1.5">{user?.role?.replace('_', ' ')}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <FaUser className="text-xs" /> Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-soft"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 -mr-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary-700/98 backdrop-blur-sm border-t border-white/10 animate-slideDown">
          <div className="page-container py-3 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-white/10">
                  <span className="avatar w-10 h-10 bg-white/90 text-primary-700">{initials}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-white/60 truncate">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link')}
                  >
                    {link.icon}
                    {link.name}
                  </NavLink>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <FaUser className="text-xs" /> Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-700 px-3 py-2.5 rounded-lg text-sm font-semibold text-center mt-1"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
