import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendar, FaClock, FaCheckCircle, FaUserMd, 
  FaPaw, FaStethoscope, FaUser 
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    pending: 0,
    completed: 0,
    patients: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, pendingRes] = await Promise.all([
        api.get('/api/v1/doctor/appointments'),
        api.get('/api/v1/doctor/appointments/pending')
      ]);

      const allAppointments = appointmentsRes.data?.appointments || [];
      const pendingAppointments = pendingRes.data?.appointments || [];

      setStats({
        appointments: allAppointments.length,
        pending: pendingAppointments.length,
        completed: allAppointments.filter(a => a.status === 'COMPLETED').length,
        patients: 0
      });
      setUpcomingAppointments(pendingAppointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      {/* ✅ Header with Profile Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          👨‍⚕️ Welcome, Dr. {user?.name}!
        </h1>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link 
            to="/doctor/profile" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          >
            <FaUser /> My Profile
          </Link>
          <Link 
            to="/doctor/availability" 
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <FaClock /> Set Availability
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaCalendar className="text-2xl text-blue-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.appointments}</h3>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaClock className="text-2xl text-orange-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold text-orange-600">{stats.pending}</h3>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaCheckCircle className="text-2xl text-emerald-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.completed}</h3>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaUserMd className="text-2xl text-purple-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.patients}</h3>
          <p className="text-xs text-gray-600">Patients</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link 
          to="/doctor/appointments" 
          className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-blue-500"
        >
          <h3 className="font-semibold text-gray-800">📅 Appointments</h3>
          <p className="text-sm text-gray-600">Manage your schedule</p>
        </Link>
        <Link 
          to="/doctor/availability" 
          className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-emerald-500"
        >
          <h3 className="font-semibold text-gray-800">⏰ Availability</h3>
          <p className="text-sm text-gray-600">Set your working hours</p>
        </Link>
        <Link 
          to="/doctor/medical-record" 
          className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-purple-500"
        >
          <h3 className="font-semibold text-gray-800">💊 Medical Records</h3>
          <p className="text-sm text-gray-600">Add patient records</p>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">📅 Upcoming Appointments</h3>
          <div className="space-y-2">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{appointment.petName}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.appointmentDate} at {appointment.appointmentTime}
                  </p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;