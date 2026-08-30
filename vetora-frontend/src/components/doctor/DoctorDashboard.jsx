import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendar, FaClock, FaCheckCircle, FaUserMd, 
  FaPaw, FaStethoscope, FaUser, FaBell, FaSyringe
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    pending: 0,
    completed: 0,
    reminders: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, pendingRes, remindersRes] = await Promise.all([
        api.get('/api/v1/doctor/appointments'),
        api.get('/api/v1/doctor/appointments/pending'),
        api.get('/api/v1/doctor/reminders/my-reminders').catch(() => ({ data: { reminders: [] } }))
      ]);

      const allAppointments = appointmentsRes.data?.appointments || [];
      const pendingAppointments = pendingRes.data?.appointments || [];
      const allReminders = remindersRes.data?.reminders || [];
      const pendingReminders = allReminders
        .filter((r) => !r.isSent)
        .sort((a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime));

      setStats({
        appointments: allAppointments.length,
        pending: pendingAppointments.length,
        completed: allAppointments.filter(a => a.status === 'COMPLETED').length,
        reminders: pendingReminders.length
      });
      setUpcomingAppointments(pendingAppointments.slice(0, 5));
      setUpcomingReminders(pendingReminders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header with Profile Button */}
      <div className="page-header">
        <h1 className="page-title">
          👨‍⚕️ Welcome, Dr. {user?.name}!
        </h1>
        <div className="flex gap-3">
          <Link to="/doctor/profile" className="btn-secondary">
            <FaUser /> My Profile
          </Link>
          <Link to="/doctor/availability" className="btn-primary">
            <FaClock /> Set Availability
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <span className="stat-icon bg-blue-100 text-blue-600"><FaCalendar /></span>
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
          <span className="stat-icon bg-emerald-100 text-emerald-600"><FaCheckCircle /></span>
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
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link to="/doctor/appointments" className="card-hover border-l-4 border-blue-500">
          <h3 className="font-semibold text-ink-800">📅 Appointments</h3>
          <p className="text-sm text-ink-500">Manage your schedule</p>
        </Link>
        <Link to="/doctor/availability" className="card-hover border-l-4 border-emerald-500">
          <h3 className="font-semibold text-ink-800">⏰ Availability</h3>
          <p className="text-sm text-ink-500">Set your working hours</p>
        </Link>
        <Link to="/doctor/medical-record" className="card-hover border-l-4 border-purple-500">
          <h3 className="font-semibold text-ink-800">💊 Medical Records</h3>
          <p className="text-sm text-ink-500">Add patient records</p>
        </Link>
        <Link to="/doctor/reminders" className="card-hover border-l-4 border-pink-500">
          <h3 className="font-semibold text-ink-800">🔔 Reminders</h3>
          <p className="text-sm text-ink-500">Create patient reminders</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <h3 className="section-title">📅 Upcoming Appointments</h3>
          {upcomingAppointments.length === 0 ? (
            <p className="text-ink-400 text-center py-8">No pending appointments</p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex justify-between items-center p-3 bg-ink-50 rounded-xl">
                  <div>
                    <p className="font-medium text-ink-800">{appointment.petName}</p>
                    <p className="text-sm text-ink-500">
                      {appointment.appointmentDate} at {appointment.appointmentTime}
                    </p>
                  </div>
                  <span className="badge-warning">{appointment.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0">🔔 Upcoming Reminders</h3>
            <Link to="/doctor/reminders" className="text-sm text-primary-600 hover:underline font-medium">
              Manage
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
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
