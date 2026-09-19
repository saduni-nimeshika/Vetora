import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  FaCalendarCheck, FaClock, FaCheckCircle, FaUserMd,
  FaBell, FaFileMedicalAlt, FaCalendarDay, FaPaw,
  FaChartBar, FaArrowRight,
} from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const quickActions = [
  { to: '/doctor/appointments', icon: FaCalendarCheck, title: 'Appointments', desc: 'Manage your schedule', color: 'blue' },
  { to: '/doctor/availability', icon: FaClock, title: 'Availability', desc: 'Set your working hours', color: 'primary' },
  { to: '/doctor/medical-record', icon: FaFileMedicalAlt, title: 'Medical Records', desc: 'Add patient records', color: 'purple' },
  { to: '/doctor/reminders', icon: FaBell, title: 'Reminders', desc: 'Create patient reminders', color: 'pink' },
];

const colorMap = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
  primary: { border: 'border-primary-500', bg: 'bg-primary-100', text: 'text-primary-600' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
  pink: { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600' },
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, pending: 0, completed: 0, reminders: 0 });
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, pendingRes, remindersRes] = await Promise.all([
        api.get('/api/v1/doctor/appointments'),
        api.get('/api/v1/doctor/appointments/pending'),
        api.get('/api/v1/doctor/reminders/my-reminders').catch(() => ({ data: { reminders: [] } })),
      ]);

      const allAppointments = appointmentsRes.data?.appointments || [];
      const pendingAppointments = pendingRes.data?.appointments || [];
      const allReminders = remindersRes.data?.reminders || [];
      const pendingReminders = allReminders
        .filter((r) => !r.isSent)
        .sort((a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime));

      const todayISO = new Date().toISOString().split('T')[0];

      setStats({
        appointments: allAppointments.length,
        pending: pendingAppointments.length,
        completed: allAppointments.filter((a) => a.status === 'COMPLETED').length,
        reminders: pendingReminders.length,
      });
      setTodayCount(allAppointments.filter((a) => a.appointmentDate === todayISO).length);
      setUpcomingAppointments(pendingAppointments.slice(0, 5));
      setUpcomingReminders(pendingReminders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => ({
    labels: ['Total', 'Pending', 'Completed'],
    datasets: [
      {
        data: [stats.appointments, stats.pending, stats.completed],
        backgroundColor: ['#3b82f6', '#f59e0b', '#059669'],
        borderRadius: 8,
        maxBarThickness: 56,
      },
    ],
  }), [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const initials = (user?.name || 'Dr')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-glow shrink-0">
            {initials}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900 font-display">Welcome, Dr. {user?.name}</h1>
            <p className="text-ink-400 text-sm mt-0.5">
              {todayCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-primary-600 font-semibold">
                  <FaCalendarDay className="text-xs" /> {todayCount} appointment{todayCount !== 1 ? 's' : ''} today
                </span>
              ) : (
                'No appointments scheduled for today'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/doctor/profile" className="btn-secondary">
            <FaUserMd /> My Profile
          </Link>
          <Link to="/doctor/availability" className="btn-primary">
            <FaClock /> Set Availability
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <span className="stat-icon bg-blue-100 text-blue-600"><FaCalendarCheck /></span>
          <div>
            <h3 className="stat-value">{stats.appointments}</h3>
            <p className="stat-label">Total</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon bg-amber-100 text-amber-600"><FaClock /></span>
          <div>
            <h3 className="stat-value">{stats.pending}</h3>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon bg-primary-100 text-primary-600"><FaCheckCircle /></span>
          <div>
            <h3 className="stat-value">{stats.completed}</h3>
            <p className="stat-label">Completed</p>
          </div>
        </div>
        <Link to="/doctor/reminders" className="stat-card">
          <span className="stat-icon bg-pink-100 text-pink-600"><FaBell /></span>
          <div>
            <h3 className="stat-value">{stats.reminders}</h3>
            <p className="stat-label">Reminders</p>
          </div>
        </Link>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map(({ to, icon: Icon, title, desc, color }) => {
          const c = colorMap[color];
          return (
            <motion.div key={to} whileHover={{ y: -4 }}>
              <Link to={to} className={`card-hover border-l-4 ${c.border} flex items-start gap-3`}>
                <span className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center text-lg shrink-0`}>
                  <Icon />
                </span>
                <div>
                  <h3 className="font-semibold text-ink-800">{title}</h3>
                  <p className="text-sm text-ink-500">{desc}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Appointment overview chart */}
      <motion.div variants={itemVariants} className="card mb-6">
        <h3 className="section-title flex items-center gap-2">
          <FaChartBar className="text-primary-600" /> Appointments Overview
        </h3>
        <div className="h-48">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0 flex items-center gap-2">
              <FaCalendarCheck className="text-primary-600" /> Upcoming Appointments
            </h3>
            <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-ink-400 text-center py-8">No pending appointments</p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex justify-between items-center p-3 bg-ink-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                      <FaPaw className="text-sm" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-800 truncate">{appointment.petName}</p>
                      <p className="text-sm text-ink-500">
                        {appointment.appointmentDate} at {appointment.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <span className="badge-warning shrink-0">{appointment.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Reminders */}
        <motion.div variants={itemVariants} className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0 flex items-center gap-2">
              <FaBell className="text-primary-600" /> Upcoming Reminders
            </h3>
            <Link to="/doctor/reminders" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
              Manage <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-ink-400 text-center py-8">No pending reminders</p>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.map((r) => (
                <div key={r.id} className="flex justify-between items-center p-3 bg-ink-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-800 truncate">{r.petName} — {r.message}</p>
                    <p className="text-sm text-ink-500">
                      {new Date(r.reminderDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="badge-info shrink-0">{r.type}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;

