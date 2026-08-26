import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaPaw, FaCalendar, FaFileMedical, FaPrescription, FaBell, FaPlus } from 'react-icons/fa';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pets: 0,
    appointments: 0,
    records: 0,
    prescriptions: 0,
    reminders: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [petsRes, appointmentsRes] = await Promise.all([
        api.get('/api/v1/owner/pets'),
        api.get('/api/v1/owner/appointments')
      ]);

      const pets = petsRes.data?.pets || [];
      const appointments = appointmentsRes.data?.appointments || [];

      setStats({
        pets: pets.length,
        appointments: appointments.length,
        records: 0,
        prescriptions: 0,
        reminders: 0
      });
      setUpcomingAppointments(appointments.slice(0, 5));
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🐾 Welcome, {user?.name}!
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaPaw className="text-2xl text-emerald-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.pets}</h3>
          <p className="text-xs text-gray-600">My Pets</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaCalendar className="text-2xl text-blue-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.appointments}</h3>
          <p className="text-xs text-gray-600">Appointments</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaFileMedical className="text-2xl text-purple-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.records}</h3>
          <p className="text-xs text-gray-600">Records</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaPrescription className="text-2xl text-pink-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.prescriptions}</h3>
          <p className="text-xs text-gray-600">Prescriptions</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
          <FaBell className="text-2xl text-orange-600 mx-auto mb-1" />
          <h3 className="text-xl font-bold">{stats.reminders}</h3>
          <p className="text-xs text-gray-600">Reminders</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link to="/owner/pets" className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-emerald-500">
          <h3 className="font-semibold text-gray-800">🐕 My Pets</h3>
          <p className="text-sm text-gray-600">View and manage your pets</p>
        </Link>
        <Link to="/owner/appointments/book" className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-800">📅 Book Appointment</h3>
          <p className="text-sm text-gray-600">Schedule a new appointment</p>
        </Link>
        <Link to="/search-doctors" className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition border-l-4 border-purple-500">
          <h3 className="font-semibold text-gray-800">🔍 Find Doctors</h3>
          <p className="text-sm text-gray-600">Search for veterinarians</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/owner/pets/add" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
          <FaPlus /> Add Pet
        </Link>
        <Link to="/owner/appointments/book" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <FaCalendar /> Book Appointment
        </Link>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">📅 Upcoming Appointments</h3>
          <div className="space-y-2">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{appointment.petName}</p>
                  <p className="text-sm text-gray-600">
                    Dr. {appointment.doctorName} • {appointment.appointmentDate} at {appointment.appointmentTime}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  appointment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                  appointment.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
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

export default OwnerDashboard;