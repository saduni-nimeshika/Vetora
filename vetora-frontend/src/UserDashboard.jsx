import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 💡 React Router Import කළා

const UserDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate(); // 💡 Navigation Hook එක
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Sample Static Data
  const stats = [
    { title: 'Total Pets', value: '3', icon: '🐾', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { title: 'Upcoming Appointment', value: 'Today, 4:00 PM', sub: 'Dr. Perera (Dog Checkup)', icon: '📅', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { title: 'Recent Notifications', value: '2 New', sub: 'Lab results ready', icon: '🔔', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { title: 'Reminder Alerts', value: '1 Active', sub: 'Rabies Vaccine due in 3 days', icon: '⚠️', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ];

  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'My Pets', icon: '🐾' },
    { name: 'Find Veterinarian', icon: '🔍' },
    { name: 'Appointments', icon: '📅' },
    { name: 'Medical Records', icon: '📜' },
    { name: 'Prescriptions', icon: '💊' },
    { name: 'Notifications', icon: '🔔' },
    { name: 'Profile', icon: '👤' },
  ];

  // 💡 Logout Handler with Navigation
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // Parent state එක clear කිරීමට
    }
    navigate('/login'); // Login page එකට Redirect වීම
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* 🟢 SIDEBAR MENU */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-400">
              🐾
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">VETORA</h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider">PET CARE PORTAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === item.name
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors mt-6 cursor-pointer"
        >
          <span>🚪</span>
          Logout
        </button>
      </aside>

      {/* 🔵 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white">{activeTab}</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Welcome, <strong className="text-white">{user?.name || 'Pet Owner'}</strong></span>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-300">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <div className="p-8 space-y-8">
          
          {/* 1. Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col justify-between ${stat.color}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-300">{stat.title}</span>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  {stat.sub && <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* 2. Middle Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Box: Upcoming Appointments Schedule */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold text-white">Upcoming Appointments</h3>
                <button className="text-xs text-emerald-400 hover:underline cursor-pointer">View All</button>
              </div>

              <div className="space-y-3">
                {/* Appointment Card Item */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">
                      🐕
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Buddy - Annual Vaccination</h4>
                      <p className="text-xs text-slate-400">Dr. Nimal Perera • VetCare Animal Hospital</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                      Today, 4:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Quick Actions & Reminders */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-md font-bold text-white">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>📅</span> Book New Appointment
                </button>
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>🐾</span> Add New Pet Profile
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
};

export default UserDashboard;