import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaStethoscope, FaCalendar, FaPaw, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    pendingDoctors: 0,
    appointments: 0,
    pets: 0,
    doctors: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingDoctors, setPendingDoctors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes, appointmentsRes, petsRes, doctorsRes] = await Promise.all([
        api.get('/api/v1/admin/users'),
        api.get('/api/v1/admin/doctors/pending'),
        api.get('/api/v1/admin/appointments'),
        api.get('/api/v1/owner/pets/admin/all'),
        api.get('/api/v1/admin/users?role=DOCTOR')
      ]);

      setStats({
        users: usersRes.data?.length || 0,
        pendingDoctors: pendingRes.data?.length || 0,
        appointments: appointmentsRes.data?.appointments?.length || 0,
        pets: petsRes.data?.pets?.length || 0,
        doctors: doctorsRes.data?.length || 0
      });
      setPendingDoctors(pendingRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await api.put(`/api/v1/admin/doctors/${doctorId}/approve`);
      setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
      setStats(prev => ({
        ...prev,
        pendingDoctors: prev.pendingDoctors - 1,
        doctors: prev.doctors + 1
      }));
    } catch (error) {
      console.error('Error approving doctor:', error);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await api.delete(`/api/v1/admin/doctors/${doctorId}/reject`);
      setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
      setStats(prev => ({
        ...prev,
        pendingDoctors: prev.pendingDoctors - 1
      }));
    } catch (error) {
      console.error('Error rejecting doctor:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        👑 Welcome, {user?.name}!
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaUsers className="text-2xl text-blue-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.users}</h3>
          <p className="text-xs text-gray-600">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaStethoscope className="text-2xl text-emerald-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.doctors}</h3>
          <p className="text-xs text-gray-600">Doctors</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaUserCheck className="text-2xl text-orange-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold text-orange-600">{stats.pendingDoctors}</h3>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaPaw className="text-2xl text-pink-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.pets}</h3>
          <p className="text-xs text-gray-600">Total Pets</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaCalendar className="text-2xl text-purple-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.appointments}</h3>
          <p className="text-xs text-gray-600">Appointments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/pending-doctors" className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-orange-500">
          <h3 className="font-semibold text-gray-800">📋 Pending Doctors</h3>
          <p className="text-sm text-gray-600">{stats.pendingDoctors} doctors waiting</p>
        </Link>
        <Link to="/admin/users" className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-800">👥 All Users</h3>
          <p className="text-sm text-gray-600">Manage system users</p>
        </Link>
        <Link to="/admin/appointments" className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-purple-500">
          <h3 className="font-semibold text-gray-800">📅 Appointments</h3>
          <p className="text-sm text-gray-600">View all appointments</p>
        </Link>
      </div>

      {/* Pending Doctors List */}
      {pendingDoctors.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">⏳ Pending Doctor Approvals</h3>
          <div className="space-y-3">
            {pendingDoctors.slice(0, 3).map((doctor) => (
              <div key={doctor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{doctor.user?.name}</p>
                  <p className="text-sm text-gray-600">{doctor.specialisation} • {doctor.clinicName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(doctor.id)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(doctor.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingDoctors.length > 3 && (
            <Link to="/admin/pending-doctors" className="text-emerald-600 hover:underline text-sm mt-3 block">
              View all {pendingDoctors.length} pending doctors →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;