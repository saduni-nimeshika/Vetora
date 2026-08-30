import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaPaw, FaCalendar, FaFileMedical, FaPrescription, 
  FaBell, FaPlus, FaSearch, FaUserMd, FaArrowRight 
} from 'react-icons/fa';

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
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPets, setRecentPets] = useState([]);

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

      // Reminders are fetched per-pet, so tally them across all pets
      let reminderCount = 0;
      let allReminders = [];
      if (pets.length > 0) {
        const reminderResults = await Promise.all(
          pets.map((p) =>
            api.get(`/api/v1/owner/reminders/upcoming/${p.id}`)
              .then((res) => (res.data?.reminders || []).map((r) => ({ ...r, petName: r.petName || p.name })))
              .catch(() => [])
          )
        );
        allReminders = reminderResults.flat();
        reminderCount = allReminders.length;
      }

      setStats({
        pets: pets.length,
        appointments: appointments.length,
        records: 0,
        prescriptions: 0,
        reminders: reminderCount
      });
      
      setRecentPets(pets.slice(0, 3));
      setRecentAppointments(appointments.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name}! 🐾
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your pets</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link to="/owner/pets/add" className="btn-primary flex items-center gap-2">
            <FaPlus /> Add Pet
          </Link>
          <Link to="/owner/appointments/book" className="btn-secondary flex items-center gap-2">
            <FaCalendar /> Book
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Link to="/owner/pets" className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition border-t-4 border-emerald-500">
          <div className="text-2xl text-emerald-600 mx-auto mb-1">🐕</div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.pets}</h3>
          <p className="text-xs text-gray-500">My Pets</p>
        </Link>
        <Link to="/owner/appointments" className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition border-t-4 border-blue-500">
          <div className="text-2xl text-blue-600 mx-auto mb-1">📅</div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.appointments}</h3>
          <p className="text-xs text-gray-500">Appointments</p>
        </Link>
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center border-t-4 border-purple-500">
          <div className="text-2xl text-purple-600 mx-auto mb-1">💊</div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.records}</h3>
          <p className="text-xs text-gray-500">Records</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center border-t-4 border-pink-500">
          <div className="text-2xl text-pink-600 mx-auto mb-1">📋</div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.prescriptions}</h3>
          <p className="text-xs text-gray-500">Prescriptions</p>
        </div>
        <Link to="/owner/pets" className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition border-t-4 border-orange-500">
          <div className="text-2xl text-orange-600 mx-auto mb-1">⏰</div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.reminders}</h3>
          <p className="text-xs text-gray-500">Reminders</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link to="/owner/pets" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">🐕 My Pets</h3>
              <p className="text-sm text-gray-500">View and manage your pets</p>
            </div>
            <FaArrowRight className="text-emerald-600" />
          </div>
        </Link>
        <Link to="/owner/appointments/book" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">📅 Book Appointment</h3>
              <p className="text-sm text-gray-500">Schedule a new appointment</p>
            </div>
            <FaArrowRight className="text-blue-600" />
          </div>
        </Link>
        <Link to="/search-doctors" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">🔍 Find Doctors</h3>
              <p className="text-sm text-gray-500">Search for veterinarians</p>
            </div>
            <FaArrowRight className="text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Pets */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🐕 Recent Pets</h2>
            <Link to="/owner/pets" className="text-sm text-emerald-600 hover:underline">
              View All
            </Link>
          </div>
          {recentPets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pets added yet</p>
          ) : (
            <div className="space-y-3">
              {recentPets.map((pet) => (
                <Link key={pet.id} to={`/owner/pets/${pet.id}`} className="block">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
                      {pet.profileImage ? (
                        <img src={pet.profileImage} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-emerald-600">
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{pet.name}</h4>
                      <p className="text-sm text-gray-500">{pet.species} • {pet.weight || 'N/A'} kg</p>
                    </div>
                    <FaArrowRight className="text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📅 Recent Appointments</h2>
            <Link to="/owner/appointments" className="text-sm text-emerald-600 hover:underline">
              View All
            </Link>
          </div>
          {recentAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments found</p>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-800">{app.petName}</h4>
                    <p className="text-sm text-gray-500">
                      Dr. {app.doctorName} • {app.appointmentDate} at {app.appointmentTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;