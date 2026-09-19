import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FaPaw, FaCalendarCheck, FaBell, FaFileMedicalAlt, FaSyringe,
  FaPlus, FaSearch, FaArrowRight, FaWeight, FaBirthdayCake,
  FaVenusMars, FaIdBadge, FaUserMd, FaCheckCircle, FaClock,
  FaChartBar, FaEdit,
} from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const speciesEmoji = { DOG: '🐕', CAT: '🐈', BIRD: '🐦', RABBIT: '🐰' };

const OwnerDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [remindersTotal, setRemindersTotal] = useState(0);

  const [activePetId, setActivePetId] = useState(null);
  const [petLoading, setPetLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [petReminders, setPetReminders] = useState([]);

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activePetId) fetchPetWidgets(activePetId);
  }, [activePetId]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [petsRes, appointmentsRes] = await Promise.all([
        api.get('/api/v1/owner/pets'),
        api.get('/api/v1/owner/appointments'),
      ]);

      const petsData = petsRes.data?.pets || [];
      const appointmentsData = appointmentsRes.data?.appointments || [];

      setPets(petsData);
      setAppointments(appointmentsData);
      if (petsData.length > 0) setActivePetId(petsData[0].id);

      if (petsData.length > 0) {
        const reminderCounts = await Promise.all(
          petsData.map((p) =>
            api.get(`/api/v1/owner/reminders/upcoming/${p.id}`)
              .then((res) => (res.data?.reminders || []).length)
              .catch(() => 0)
          )
        );
        setRemindersTotal(reminderCounts.reduce((sum, n) => sum + n, 0));
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetWidgets = async (petId) => {
    try {
      setPetLoading(true);
      const [recordsRes, vaccRes, remRes] = await Promise.all([
        api.get(`/api/v1/owner/medical-records/pet/${petId}`).catch(() => ({ data: { records: [] } })),
        api.get(`/api/v1/owner/vaccinations/pet/${petId}`).catch(() => ({ data: { vaccinations: [] } })),
        api.get(`/api/v1/owner/reminders/upcoming/${petId}`).catch(() => ({ data: { reminders: [] } })),
      ]);
      setMedicalRecords(recordsRes.data?.records || []);
      setVaccinations(vaccRes.data?.vaccinations || []);
      setPetReminders(remRes.data?.reminders || []);
    } catch (error) {
      console.error('Error fetching pet widgets:', error);
    } finally {
      setPetLoading(false);
    }
  };

  const activePet = pets.find((p) => p.id === activePetId) || null;

  const filteredPets = useMemo(() => {
    if (!search.trim()) return pets;
    const q = search.trim().toLowerCase();
    return pets.filter((p) => p.name?.toLowerCase().includes(q) || p.species?.toLowerCase().includes(q));
  }, [pets, search]);

  const petAppointments = useMemo(() => {
    if (!activePet) return [];
    return appointments.filter((a) => a.petName === activePet.name);
  }, [appointments, activePet]);

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return 'badge-success';
    if (status === 'PENDING') return 'badge-warning';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'badge-danger';
    return 'badge-neutral';
  };

  const isVaccineUpcoming = (date) => {
    if (!date) return false;
    return new Date(date) > new Date();
  };

  // Real weight comparison across all of the owner's pets — no fabricated history,
  // just the current weight each pet record actually has.
  const weightChartData = {
    labels: pets.map((p) => p.name),
    datasets: [
      {
        label: 'Weight (kg)',
        data: pets.map((p) => parseFloat(p.weight) || 0),
        backgroundColor: pets.map((p) => (p.id === activePetId ? '#059669' : '#a7f3d0')),
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };
  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 font-display">
            Welcome back, {user?.name?.split(' ')[0]} 🐾
          </h1>
          <p className="text-ink-400 mt-1 text-sm">Here&rsquo;s what&rsquo;s happening with your pets today</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="input-icon-wrap flex-1 lg:w-64">
            <FaSearch className="field-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field-icon"
              placeholder="Search your pets..."
            />
          </div>
          <Link to="/owner/appointments/book" className="btn-primary shrink-0 whitespace-nowrap">
            <FaCalendarCheck /> Book
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Link to="/owner/pets" className="stat-card">
          <span className="stat-icon bg-primary-100 text-primary-600"><FaPaw /></span>
          <div>
            <p className="stat-value">{pets.length}</p>
            <p className="stat-label">My Pets</p>
          </div>
        </Link>
        <Link to="/owner/appointments" className="stat-card">
          <span className="stat-icon bg-blue-100 text-blue-600"><FaCalendarCheck /></span>
          <div>
            <p className="stat-value">{appointments.length}</p>
            <p className="stat-label">Appointments</p>
          </div>
        </Link>
        <div className="stat-card col-span-2 md:col-span-1">
          <span className="stat-icon bg-accent-100 text-accent-600"><FaBell /></span>
          <div>
            <p className="stat-value">{remindersTotal}</p>
            <p className="stat-label">Upcoming Reminders</p>
          </div>
        </div>
      </motion.div>

      {pets.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaPaw className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500 mb-4">You haven&rsquo;t added a pet yet</p>
          <Link to="/owner/pets/add" className="btn-primary">
            <FaPlus /> Add Your First Pet
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Pet switcher + active pet summary */}
          <motion.div variants={itemVariants} className="card mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {filteredPets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setActivePetId(pet.id)}
                  className="flex flex-col items-center gap-1.5 group"
                  title={pet.name}
                >
                  <span
                    className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                      pet.id === activePetId
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-ink-200 group-hover:border-primary-300'
                    }`}
                  >
                    {pet.profileImage ? (
                      <img src={pet.profileImage} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl bg-primary-50">
                        {speciesEmoji[pet.species?.toUpperCase()] || '🐾'}
                      </span>
                    )}
                  </span>
                  <span className={`text-xs font-semibold truncate max-w-[64px] ${pet.id === activePetId ? 'text-primary-700' : 'text-ink-500'}`}>
                    {pet.name}
                  </span>
                </button>
              ))}
              <Link
                to="/owner/pets/add"
                className="flex flex-col items-center gap-1.5"
                title="Add a pet"
              >
                <span className="w-14 h-14 rounded-full border-2 border-dashed border-ink-300 text-ink-400 hover:border-primary-400 hover:text-primary-500 flex items-center justify-center transition-colors">
                  <FaPlus />
                </span>
                <span className="text-xs font-medium text-ink-400">Add Pet</span>
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {activePet && (
                <motion.div
                  key={activePet.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-ink-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center text-3xl shrink-0">
                      {activePet.profileImage ? (
                        <img src={activePet.profileImage} alt={activePet.name} className="w-full h-full object-cover" />
                      ) : (
                        speciesEmoji[activePet.species?.toUpperCase()] || '🐾'
                      )}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-ink-900 font-display">{activePet.name}</h2>
                      <p className="text-sm text-ink-500">{activePet.breed || activePet.species}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-ink-400">
                        <span className="flex items-center gap-1"><FaVenusMars className="text-primary-400" /> {activePet.gender || 'N/A'}</span>
                        <span className="flex items-center gap-1"><FaBirthdayCake className="text-primary-400" /> {activePet.age || 'N/A'}</span>
                        <span className="flex items-center gap-1"><FaWeight className="text-primary-400" /> {activePet.weight ? `${activePet.weight} kg` : 'N/A'}</span>
                        <span className="flex items-center gap-1"><FaIdBadge className="text-primary-400" /> ID {activePet.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/owner/pets/${activePet.id}`} className="btn-outline btn-sm">
                      View Profile
                    </Link>
                    <Link to={`/owner/appointments/book?petId=${activePet.id}`} className="btn-primary btn-sm">
                      <FaCalendarCheck /> Book
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Medical Card + Vaccinations */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-ink-900 flex items-center gap-2">
                  <FaFileMedicalAlt className="text-primary-600" /> Medical Card
                </h3>
                {activePet && (
                  <Link to={`/owner/pets/${activePet.id}?tab=medical`} className="text-xs font-semibold text-primary-600 hover:underline">
                    View All
                  </Link>
                )}
              </div>
              {petLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-ink-100 rounded-lg" />)}
                </div>
              ) : medicalRecords.length === 0 ? (
                <p className="text-ink-400 text-sm text-center py-8">No medical records yet</p>
              ) : (
                <div className="table-wrap !shadow-none !border-0">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecords.slice(0, 5).map((r) => (
                        <tr key={r.id}>
                          <td className="font-semibold text-ink-800">{r.diagnosis}</td>
                          <td className="text-ink-500 max-w-[160px] truncate">{r.treatment || 'N/A'}</td>
                          <td className="text-ink-400 whitespace-nowrap">{r.recordDate?.split('T')[0] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-ink-900 flex items-center gap-2">
                  <FaSyringe className="text-primary-600" /> Vaccinations
                </h3>
                {activePet && (
                  <Link to={`/owner/pets/${activePet.id}?tab=vaccinations`} className="text-xs font-semibold text-primary-600 hover:underline">
                    View All
                  </Link>
                )}
              </div>
              {petLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-ink-100 rounded-lg" />)}
                </div>
              ) : vaccinations.length === 0 ? (
                <p className="text-ink-400 text-sm text-center py-8">No vaccinations recorded yet</p>
              ) : (
                <div className="table-wrap !shadow-none !border-0">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Vaccine</th>
                        <th>Status</th>
                        <th>Next Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vaccinations.slice(0, 5).map((v) => (
                        <tr key={v.id}>
                          <td className="font-semibold text-ink-800">{v.vaccineName}</td>
                          <td>
                            {v.isActive ? (
                              <span className="badge-success"><FaCheckCircle className="text-[10px]" /> Done</span>
                            ) : (
                              <span className="badge-warning"><FaClock className="text-[10px]" /> To do</span>
                            )}
                          </td>
                          <td className={`whitespace-nowrap ${isVaccineUpcoming(v.nextVaccinationDate) ? 'text-accent-600 font-semibold' : 'text-ink-400'}`}>
                            {v.nextVaccinationDate || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>

          {/* Weight overview + Clinic visits */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-ink-900 flex items-center gap-2 mb-4">
                <FaChartBar className="text-primary-600" /> Pet Weight Overview
              </h3>
              {pets.filter((p) => p.weight).length === 0 ? (
                <p className="text-ink-400 text-sm text-center py-8">No weight data recorded for your pets yet</p>
              ) : (
                <div className="h-56">
                  <Bar data={weightChartData} options={weightChartOptions} />
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-ink-900 flex items-center gap-2">
                  <FaCalendarCheck className="text-primary-600" /> {activePet?.name}&rsquo;s Clinic Visits
                </h3>
                <Link to="/owner/appointments" className="text-xs font-semibold text-primary-600 hover:underline">
                  View All
                </Link>
              </div>
              {petAppointments.length === 0 ? (
                <p className="text-ink-400 text-sm text-center py-8">No appointments booked for {activePet?.name} yet</p>
              ) : (
                <div className="space-y-3">
                  {petAppointments.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                          <FaUserMd className="text-sm" />
                        </span>
                        <div>
                          <p className="font-semibold text-ink-800 text-sm">Dr. {a.doctorName}</p>
                          <p className="text-xs text-ink-400">{a.appointmentDate} at {a.appointmentTime}</p>
                        </div>
                      </div>
                      <span className={getStatusBadge(a.status)}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {petReminders.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ink-100">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Upcoming Reminders</p>
                  <div className="space-y-2">
                    {petReminders.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-sm text-ink-600">
                        <FaBell className="text-accent-500 text-xs shrink-0" />
                        <span className="truncate">{r.message}</span>
                        <span className="ml-auto text-xs text-ink-400 shrink-0">
                          {new Date(r.reminderDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default OwnerDashboard;
