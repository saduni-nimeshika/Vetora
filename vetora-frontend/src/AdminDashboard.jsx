import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 💡 React Router Import කළා

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate(); // 💡 Navigation Hook එක

  const [activeTab, setActiveTab] = useState('approvals'); // approvals | doctors | owners | pets | appointments | reports
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Pending Doctors Fetch කිරීම
  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/v1/admin/doctors/pending');
      setPendingDoctors(response.data);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. All Users Fetch කිරීම (Owners tab එක සඳහා)
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/admin/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
    fetchAllUsers();
  }, []);

  // 3. Doctor Approve කිරීම
  const handleApprove = async (doctorId, doctorName) => {
    try {
      await axios.put(`http://localhost:8080/api/v1/admin/doctors/${doctorId}/approve`);
      setMessage({ type: 'success', text: `Dr. ${doctorName} has been approved successfully!` });
      fetchPendingDoctors(); // List එක Refresh කිරීම
    } catch (error) {
      setMessage({ type: 'error', text: 'Approval failed. Please try again.' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // 4. Doctor Reject / Delete කිරීම
  const handleReject = async (doctorId, doctorName) => {
    if (!window.confirm(`Are you sure you want to reject and remove Dr. ${doctorName}?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/doctors/${doctorId}/reject`);
      setMessage({ type: 'success', text: `Dr. ${doctorName}'s request has been rejected.` });
      fetchPendingDoctors(); // List එක Refresh කිරීම
    } catch (error) {
      setMessage({ type: 'error', text: 'Rejection failed. Please try again.' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // 5. Logout Handler with Navigation
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // parent state clean කරන්න
    }
    navigate('/login'); // 💡 Login page එකට redirect වෙනවා
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* 🟢 LEFT SIDEBAR (NAVIGATION) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
              👨‍💼
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight">Vetora Admin</h2>
              <p className="text-xs text-slate-400">System Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'approvals' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span>📋 Doctor Approvals</span>
              {pendingDoctors.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  {pendingDoctors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'doctors' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              🩺 Manage Doctors
            </button>

            <button
              onClick={() => setActiveTab('owners')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'owners' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              🐾 Manage Users / Pet Owners
            </button>

            <button
              onClick={() => setActiveTab('pets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pets' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              🐶 Registered Pets
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'appointments' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              📅 Appointments
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'reports' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              📊 System Reports
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold rounded-xl text-sm transition-all cursor-pointer"
        >
          🚪 Logout
        </button>
      </aside>

      {/* 🔵 RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeTab === 'approvals' && 'Review Doctor Registrations'}
              {activeTab === 'doctors' && 'Manage Approved Doctors'}
              {activeTab === 'owners' && 'Manage Registered Users'}
              {activeTab === 'pets' && 'View Registered Pets'}
              {activeTab === 'appointments' && 'Monitor Appointments'}
              {activeTab === 'reports' && 'System Analytics & Reports'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Welcome back, System Admin</p>
          </div>
        </div>

        {/* Alert Notifications */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* ------------------ TAB 1: DOCTOR APPROVALS ------------------ */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Review pending registrations and approve qualified doctors.</p>
              <button onClick={fetchPendingDoctors} className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer">
                🔄 Refresh List
              </button>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Loading pending doctors...</p>
            ) : pendingDoctors.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                🎉 No pending doctor approval requests right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingDoctors.map((doc) => {
                  const doctorName = doc.user?.name || 'Doctor';
                  const doctorEmail = doc.user?.email || 'N/A';
                  const doctorPhone = doc.user?.phone || 'N/A';

                  return (
                    <div key={doc.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white">Dr. {doctorName}</h3>
                          <p className="text-xs text-emerald-400">{doc.specialisation || 'General Veterinary'}</p>
                        </div>
                        <span className="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold">
                          Pending
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                        <p><strong className="text-slate-500">Email:</strong> {doctorEmail}</p>
                        <p><strong className="text-slate-500">Phone:</strong> {doctorPhone}</p>
                        <p><strong className="text-slate-500">SLVC No:</strong> <span className="text-amber-300 font-mono">{doc.slvcRegistrationNumber}</span></p>
                        <p><strong className="text-slate-500">Experience:</strong> {doc.yearsOfExperience} Yrs</p>
                        <p><strong className="text-slate-500">Clinic:</strong> {doc.clinicName}</p>
                        <p><strong className="text-slate-500">Location:</strong> {doc.city}, {doc.district}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApprove(doc.id, doctorName)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(doc.id, doctorName)}
                          className="flex-1 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------ TAB 3: MANAGE USERS ------------------ */}
        {activeTab === 'owners' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Registered System Users</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30">
                      <td className="p-4 font-mono text-slate-500">#{u.id}</td>
                      <td className="p-4 font-semibold text-white">{u.name}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-lg font-semibold ${
                          u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          u.role === 'DOCTOR' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------ TAB 2, 4, 5, 6 (Placeholders) ------------------ */}
        {activeTab === 'doctors' && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            🩺 Approved Doctors management tab.
          </div>
        )}
        {activeTab === 'pets' && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            🐶 Registered pets tab.
          </div>
        )}
        {activeTab === 'appointments' && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            📅 System appointments tab.
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            📊 System analytics tab.
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;