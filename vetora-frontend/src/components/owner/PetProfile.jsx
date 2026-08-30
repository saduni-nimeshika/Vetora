import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FaPaw, FaCalendar, FaFileMedical, FaSyringe, FaPrescription,
  FaWeight, FaRuler, FaHeart, FaStethoscope, FaClipboardList,
  FaChartLine, FaUserMd, FaClock, FaCheckCircle, FaTimesCircle,
  FaArrowLeft, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBell
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PetProfile = () => {
  const { petId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const [petRes, recordsRes, vaccRes, appRes, remRes] = await Promise.all([
        api.get(`/api/v1/owner/pets/${petId}`),
        api.get(`/api/v1/owner/medical-records/pet/${petId}`),
        api.get(`/api/v1/owner/vaccinations/pet/${petId}`),
        api.get(`/api/v1/owner/appointments`),
        api.get(`/api/v1/owner/reminders/pet/${petId}`).catch(() => ({ data: { reminders: [] } }))
      ]);
      
      setPet(petRes.data);
      setMedicalRecords(recordsRes.data?.records || []);
      setVaccinations(vaccRes.data?.vaccinations || []);
      setAppointments(appRes.data?.appointments || []);
      const remList = (remRes.data?.reminders || [])
        .sort((a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime));
      setReminders(remList);
    } catch (error) {
      console.error('Error fetching pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED' || status === 'DONE') return 'text-green-600 bg-green-100';
    if (status === 'PENDING' || status === 'TO_DO') return 'text-orange-600 bg-orange-100';
    if (status === 'CANCELLED' || status === 'REJECTED') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    if (status === 'COMPLETED' || status === 'DONE') return <FaCheckCircle className="text-green-600" />;
    if (status === 'PENDING' || status === 'TO_DO') return <FaClock className="text-orange-600" />;
    return <FaTimesCircle className="text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pet not found</p>
        <Link to="/owner/pets" className="text-emerald-600 hover:underline">Back to pets</Link>
      </div>
    );
  }

  // Weight chart data
  const weightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Weight (kg)',
        data: [2.5, 2.8, 3.0, 3.2, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8, 5.0, 5.2],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Link to="/owner/pets" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
        <FaArrowLeft /> Back to Pets
      </Link>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-20">
            {/* Pet Profile Card */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-4 border-emerald-100 mb-3">
                {pet.profileImage ? (
                  <img src={pet.profileImage} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-4xl text-emerald-600">
                    🐾
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{pet.name}</h2>
              <p className="text-sm text-gray-500">{pet.breed || pet.species}</p>
              <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                <span>🔄 {pet.gender || 'N/A'}</span>
                <span>🎂 {pet.dateOfBirth ? `${new Date().getFullYear() - new Date(pet.dateOfBirth).getFullYear()} years` : 'N/A'}</span>
                <span>⚖️ {pet.weight || 'N/A'} kg</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaClipboardList /> Overview
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === 'medical' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaFileMedical /> Medical Records
              </button>
              <button
                onClick={() => setActiveTab('vaccinations')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === 'vaccinations' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaSyringe /> Vaccinations
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === 'appointments' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaCalendar /> Appointments
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === 'reminders' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaBell /> Reminders
                {reminders.filter(r => !r.isSent).length > 0 && (
                  <span className="ml-auto bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {reminders.filter(r => !r.isSent).length}
                  </span>
                )}
              </button>
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <Link to={`/owner/appointments/book?petId=${pet.id}`} className="block w-full bg-emerald-600 text-white text-center py-2 rounded-lg hover:bg-emerald-700 transition text-sm">
                📅 Book Appointment
              </Link>
              <Link to={`/owner/pets/edit/${pet.id}`} className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-200 transition text-sm">
                ✏️ Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <div className="text-2xl text-emerald-600 mb-1">💊</div>
                  <div className="text-xl font-bold text-gray-800">{medicalRecords.length}</div>
                  <div className="text-xs text-gray-500">Medical Records</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <div className="text-2xl text-blue-600 mb-1">💉</div>
                  <div className="text-xl font-bold text-gray-800">{vaccinations.length}</div>
                  <div className="text-xs text-gray-500">Vaccinations</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <div className="text-2xl text-orange-600 mb-1">📅</div>
                  <div className="text-xl font-bold text-gray-800">{appointments.filter(a => a.status === 'PENDING').length}</div>
                  <div className="text-xs text-gray-500">Pending Appointments</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                  <div className="text-2xl text-purple-600 mb-1">⚖️</div>
                  <div className="text-xl font-bold text-gray-800">{pet.weight || 0} kg</div>
                  <div className="text-xs text-gray-500">Current Weight</div>
                </div>
              </div>

              {/* Weight Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaChartLine className="text-emerald-600" />
                  Weight Tracking
                </h3>
                <div className="h-48">
                  <Line data={weightData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Medical Records */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📋 Recent Medical Records</h3>
                  <button onClick={() => setActiveTab('medical')} className="text-sm text-emerald-600 hover:underline">
                    View All
                  </button>
                </div>
                {medicalRecords.slice(0, 3).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No medical records</p>
                ) : (
                  <div className="space-y-3">
                    {medicalRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{record.diagnosis}</p>
                          <p className="text-sm text-gray-500">{record.treatment}</p>
                        </div>
                        <span className="text-xs text-gray-400">{record.recordDate?.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'medical' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaFileMedical className="text-emerald-600" />
                Medical History
              </h3>
              {medicalRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medical records found</p>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{record.diagnosis}</h4>
                          <p className="text-sm text-gray-600">{record.treatment}</p>
                          {record.notes && <p className="text-sm text-gray-500 mt-1">📝 {record.notes}</p>}
                        </div>
                        <span className="text-sm text-gray-400">{record.recordDate?.split('T')[0]}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <FaUserMd className="text-gray-400" />
                        <span className="text-sm text-gray-500">Dr. {record.doctorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vaccinations Tab */}
          {activeTab === 'vaccinations' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaSyringe className="text-emerald-600" />
                Vaccinations
              </h3>
              {vaccinations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No vaccinations found</p>
              ) : (
                <div className="space-y-4">
                  {vaccinations.map((vac) => (
                    <div key={vac.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{vac.vaccineName}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500">📅 {vac.vaccinationDate}</span>
                            {vac.nextVaccinationDate && (
                              <span className="text-sm text-orange-500">⏰ Next: {vac.nextVaccinationDate}</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(vac.isActive ? 'DONE' : 'TO_DO')}`}>
                          {getStatusIcon(vac.isActive ? 'DONE' : 'TO_DO')}
                          {vac.isActive ? 'Done' : 'Pending'}
                        </span>
                      </div>
                      {vac.notes && <p className="text-sm text-gray-500 mt-2">📝 {vac.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendar className="text-emerald-600" />
                Appointments
              </h3>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <div key={app.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">Dr. {app.doctorName}</h4>
                          <p className="text-sm text-gray-500">📅 {app.appointmentDate} at {app.appointmentTime}</p>
                          {app.notes && <p className="text-sm text-gray-500 mt-1">📝 {app.notes}</p>}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaBell className="text-emerald-600" />
                Reminders
              </h3>
              {reminders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reminders set for this pet</p>
              ) : (
                <div className="space-y-4">
                  {reminders.map((r) => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{r.message}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            📅 {new Date(r.reminderDateTime).toLocaleString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          {r.doctorName && (
                            <p className="text-sm text-gray-500 mt-1">👨‍⚕️ Dr. {r.doctorName}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.isSent ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {r.isSent ? '✅ Sent' : '⏰ Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;