import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  FaUsers, FaStethoscope, FaCalendar, FaPaw, FaUserClock,
  FaUserCheck, FaUserTimes, FaArrowRight, FaCrown,
} from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
      toast.success('Doctor approved successfully!');
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Failed to approve doctor');
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
      toast.success('Doctor rejected successfully!');
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Failed to reject doctor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  const statCards = [
    { icon: <FaUsers />, value: stats.users, label: 'Total Users', color: 'bg-blue-100 text-blue-600' },
    { icon: <FaStethoscope />, value: stats.doctors, label: 'Doctors', color: 'bg-primary-100 text-primary-600' },
    { icon: <FaUserClock />, value: stats.pendingDoctors, label: 'Pending', color: 'bg-amber-100 text-amber-600' },
    { icon: <FaPaw />, value: stats.pets, label: 'Total Pets', color: 'bg-pink-100 text-pink-600' },
    { icon: <FaCalendar />, value: stats.appointments, label: 'Appointments', color: 'bg-purple-100 text-purple-600' },
  ];

  const quickActions = [
    {
      to: '/admin/pending-doctors',
      icon: <FaUserClock />,
      iconColor: 'bg-amber-100 text-amber-600',
      title: 'Pending Doctors',
      desc: `${stats.pendingDoctors} doctor${stats.pendingDoctors === 1 ? '' : 's'} waiting for review`,
    },
    {
      to: '/admin/users',
      icon: <FaUsers />,
      iconColor: 'bg-blue-100 text-blue-600',
      title: 'All Users',
      desc: 'Manage system users',
    },
    {
      to: '/admin/appointments',
      icon: <FaCalendar />,
      iconColor: 'bg-purple-100 text-purple-600',
      title: 'Appointments',
      desc: 'View all appointments',
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 font-display flex items-center gap-2.5">
          <FaCrown className="text-accent-500" /> Welcome, {user?.name}
        </h1>
        <p className="text-ink-400 mt-1 text-sm">Here&rsquo;s an overview of the whole Vetora system</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <span className={`stat-icon ${s.color}`}>{s.icon}</span>
            <div>
              <h3 className="stat-value">{s.value}</h3>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} className="card-hover flex items-center gap-4">
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${a.iconColor}`}>
              {a.icon}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-ink-900">{a.title}</h3>
              <p className="text-sm text-ink-500">{a.desc}</p>
            </div>
            <FaArrowRight className="text-ink-300 shrink-0" />
          </Link>
        ))}
      </motion.div>

      {/* Pending Doctors List */}
      {pendingDoctors.length > 0 && (
        <motion.div variants={itemVariants} className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0"><FaUserClock className="text-amber-500" /> Pending Doctor Approvals</h3>
            <span className="badge-warning">{pendingDoctors.length} waiting</span>
          </div>
          <div className="space-y-3">
            {pendingDoctors.slice(0, 3).map((doctor) => (
              <div key={doctor.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-ink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <FaStethoscope />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-800">{doctor.user?.name}</p>
                    <p className="text-sm text-ink-500">{doctor.specialisation} · {doctor.clinicName}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(doctor.id)}
                    className="btn-primary btn-sm"
                  >
                    <FaUserCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(doctor.id)}
                    className="btn-danger btn-sm"
                  >
                    <FaUserTimes /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pendingDoctors.length > 3 && (
            <Link to="/admin/pending-doctors" className="inline-flex items-center gap-1.5 text-primary-600 hover:underline text-sm mt-4 font-medium">
              View all {pendingDoctors.length} pending doctors <FaArrowRight className="text-xs" />
            </Link>
          )}
        </motion.div>
      )}

      {pendingDoctors.length === 0 && (
        <motion.div variants={itemVariants} className="empty-state">
          <FaUserCheck className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500">No pending doctor approvals right now — all caught up!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
