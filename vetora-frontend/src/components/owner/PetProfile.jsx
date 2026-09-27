import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  FaPaw, FaCalendar, FaFileMedical, FaSyringe, FaPrescription,
  FaWeight, FaVenusMars, FaBirthdayCake, FaStethoscope, FaClipboardList,
  FaChartLine, FaUserMd, FaClock, FaCheckCircle, FaTimesCircle,
  FaArrowLeft, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBell, FaPencilAlt, FaLock, FaTrash, FaPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
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
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightForm, setWeightForm] = useState({ weight: '', recordedDate: '', notes: '' });
  const [editingWeightId, setEditingWeightId] = useState(null);
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightError, setWeightError] = useState('');

  // If we arrive via a link that specifies a tab (e.g. from a reminder on the
  // dashboard), jump straight to it instead of always landing on Overview.
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const [petRes, recordsRes, vaccRes, presRes, appRes, remRes, weightRes] = await Promise.all([
        api.get(`/api/v1/owner/pets/${petId}`),
        api.get(`/api/v1/owner/medical-records/pet/${petId}`),
        api.get(`/api/v1/owner/vaccinations/pet/${petId}`),
        api.get(`/api/v1/owner/prescriptions/pet/${petId}`).catch(() => ({ data: { prescriptions: [] } })),
        api.get(`/api/v1/owner/appointments`),
        api.get(`/api/v1/owner/reminders/pet/${petId}`).catch(() => ({ data: { reminders: [] } })),
        api.get(`/api/v1/owner/pets/${petId}/weight-history`).catch(() => ({ data: { history: [] } }))
      ]);

      setPet(petRes.data);
      setMedicalRecords(recordsRes.data?.records || []);
      setVaccinations(vaccRes.data?.vaccinations || []);
      setPrescriptions(presRes.data?.prescriptions || []);
      setAppointments(appRes.data?.appointments || []);
      const remList = (remRes.data?.reminders || [])
        .sort((a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime));
      setReminders(remList);
      setWeightHistory(weightRes.data?.history || []);
    } catch (error) {
      console.error('Error fetching pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openWeightModal = () => {
    setEditingWeightId(null);
    setWeightForm({
      weight: '',
      recordedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setWeightError('');
    setShowWeightModal(true);
  };

  const openEditWeightModal = (record) => {
    // Owners can only correct their own home-logged entries — a vet-recorded
    // entry needs a vet to correct it.
    if (record.source !== 'OWNER') return;
    setEditingWeightId(record.id);
    setWeightForm({
      weight: String(record.weight),
      recordedDate: record.recordedDate,
      notes: record.notes || ''
    });
    setWeightError('');
    setShowWeightModal(true);
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightForm.weight || parseFloat(weightForm.weight) <= 0) {
      setWeightError('Please enter a valid weight');
      return;
    }
    try {
      setWeightSaving(true);
      setWeightError('');
      const payload = {
        weight: parseFloat(weightForm.weight),
        recordedDate: weightForm.recordedDate || undefined,
        notes: weightForm.notes || undefined
      };
      if (editingWeightId) {
        await api.put(`/api/v1/owner/pets/weight/${editingWeightId}`, payload);
      } else {
        await api.post(`/api/v1/owner/pets/${petId}/weight`, payload);
      }
      setShowWeightModal(false);
      await fetchPetData();
    } catch (error) {
      setWeightError(error.response?.data?.error || 'Failed to save weight. Please try again.');
    } finally {
      setWeightSaving(false);
    }
  };

  const handleDeleteWeight = async (record) => {
    // Same rule as editing — only entries the owner logged themselves can be
    // removed here; a vet-recorded entry needs the vet to remove it.
    if (record.source !== 'OWNER') return;
    if (!window.confirm(`Delete the ${record.weight} kg entry from ${new Date(record.recordedDate).toLocaleDateString()}? This can't be undone.`)) {
      return;
    }
    try {
      await api.delete(`/api/v1/owner/pets/weight/${record.id}`);
      toast.success('✅ Weight entry deleted');
      await fetchPetData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete weight entry');
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'COMPLETED' || status === 'DONE') return 'badge-success';
    if (status === 'PENDING' || status === 'TO_DO') return 'badge-warning';
    if (status === 'CANCELLED' || status === 'REJECTED') return 'badge-danger';
    return 'badge-neutral';
  };

  const getStatusIcon = (status) => {
    if (status === 'COMPLETED' || status === 'DONE') return <FaCheckCircle className="text-[10px]" />;
    if (status === 'PENDING' || status === 'TO_DO') return <FaClock className="text-[10px]" />;
    return <FaTimesCircle className="text-[10px]" />;
  };

  const calcAge = (dob) => {
    if (!dob) return null;
    const years = new Date().getFullYear() - new Date(dob).getFullYear();
    return years;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="empty-state">
        <p className="text-ink-500">Pet not found</p>
        <Link to="/owner/pets" className="text-primary-600 hover:underline mt-2">Back to pets</Link>
      </div>
    );
  }

  // Weight chart data — built from real logged entries, no fabricated history
  const weightData = {
    labels: weightHistory.map((r) =>
      new Date(r.recordedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightHistory.map((r) => r.weight),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        pointRadius: 3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FaClipboardList /> },
    { key: 'medical', label: 'Medical Records', icon: <FaFileMedical />, count: medicalRecords.length },
    { key: 'vaccinations', label: 'Vaccinations', icon: <FaSyringe />, count: vaccinations.length },
    { key: 'prescriptions', label: 'Prescriptions', icon: <FaPrescription />, count: prescriptions.length },
    { key: 'appointments', label: 'Appointments', icon: <FaCalendar />, count: appointments.length },
    {
      key: 'reminders', label: 'Reminders', icon: <FaBell />,
      count: reminders.filter(r => !r.isSent).length,
    },
  ];

  const age = calcAge(pet.dateOfBirth);

  return (
    <div className="max-w-7xl mx-auto animate-slideUp">
      {/* Back Button */}
      <Link to="/owner/pets" className="inline-flex items-center gap-2 text-ink-500 hover:text-ink-800 mb-4 text-sm font-medium transition-colors">
        <FaArrowLeft /> Back to Pets
      </Link>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 !p-0 overflow-hidden">
            {/* Gradient banner + avatar */}
            <div className="relative h-20 bg-gradient-to-r from-primary-600 to-primary-800">
              <div className="absolute -bottom-10 inset-x-0 flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-elevated bg-primary-100">
                  {pet.profileImage ? (
                    <img src={pet.profileImage} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-primary-600">
                      🐾
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-12 pb-5 px-5 text-center">
              <h2 className="text-xl font-bold text-ink-900 font-display">{pet.name}</h2>
              <p className="text-sm text-ink-500">{pet.breed || pet.species}</p>

              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                <span className="badge-neutral"><FaVenusMars className="text-[10px]" /> {pet.gender || 'N/A'}</span>
                <span className="badge-info"><FaBirthdayCake className="text-[10px]" /> {age != null ? `${age} yrs` : 'N/A'}</span>
                <span className="badge-success"><FaWeight className="text-[10px]" /> {pet.weight || 'N/A'} kg</span>
              </div>
            </div>

            <div className="divider !my-0" />

            {/* Navigation */}
            <nav className="p-3 space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={activeTab === t.key
                    ? 'tab-item-active w-full justify-start !border-b-0 !bg-primary-50 rounded-lg'
                    : 'tab-item w-full justify-start !border-b-0 hover:bg-ink-50 rounded-lg'}
                >
                  {t.icon} {t.label}
                  {t.count > 0 && <span className="ml-auto badge-neutral">{t.count}</span>}
                </button>
              ))}
            </nav>

            <div className="divider !mt-0" />

            {/* Quick Actions */}
            <div className="px-5 pb-5 space-y-2">
              <Link to={`/owner/appointments/book?petId=${pet.id}`} className="btn-primary w-full btn-sm">
                <FaCalendar /> Book Appointment
              </Link>
              <Link to={`/owner/pets/edit/${pet.id}`} className="btn-secondary w-full btn-sm">
                <FaEdit /> Edit Profile
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
                <div className="stat-card !p-4">
                  <span className="stat-icon bg-purple-100 text-purple-600 !w-10 !h-10"><FaFileMedical /></span>
                  <div><h3 className="stat-value !text-xl">{medicalRecords.length}</h3><p className="stat-label">Records</p></div>
                </div>
                <div className="stat-card !p-4">
                  <span className="stat-icon bg-blue-100 text-blue-600 !w-10 !h-10"><FaSyringe /></span>
                  <div><h3 className="stat-value !text-xl">{vaccinations.length}</h3><p className="stat-label">Vaccinations</p></div>
                </div>
                <div className="stat-card !p-4">
                  <span className="stat-icon bg-amber-100 text-amber-600 !w-10 !h-10"><FaCalendar /></span>
                  <div><h3 className="stat-value !text-xl">{appointments.filter(a => a.status === 'PENDING').length}</h3><p className="stat-label">Pending Appts</p></div>
                </div>
                <div className="stat-card !p-4">
                  <span className="stat-icon bg-emerald-100 text-emerald-600 !w-10 !h-10"><FaWeight /></span>
                  <div><h3 className="stat-value !text-xl">{pet.weight || 0} kg</h3><p className="stat-label">Current Weight</p></div>
                </div>
              </div>

              {/* Weight Chart */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-title mb-0"><FaChartLine className="text-primary-600" /> Weight Tracking</h3>
                  <button onClick={openWeightModal} className="btn-primary btn-sm">
                    <FaWeight /> Log Weight
                  </button>
                </div>
                {weightHistory.length === 0 ? (
                  <p className="text-ink-400 text-center py-8">
                    No weight entries yet — log the first one to start tracking {pet.name}'s weight over time.
                  </p>
                ) : (
                  <>
                    <div className="h-48">
                      <Line data={weightData} options={chartOptions} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {weightHistory.slice(-6).reverse().map((r) => {
                        const editable = r.source === 'OWNER';
                        return (
                          <div
                            key={r.id}
                            className="text-xs bg-ink-50 border border-ink-100 rounded-full pl-2.5 pr-1 py-1 flex items-center gap-1 transition"
                          >
                            <button
                              type="button"
                              onClick={() => openEditWeightModal(r)}
                              disabled={!editable}
                              title={editable ? 'Click to edit this entry' : "Recorded by a doctor — ask your vet to correct it"}
                              className={`flex items-center gap-1 ${editable ? 'cursor-pointer hover:text-primary-700' : 'cursor-default'}`}
                            >
                              {editable ? (
                                <FaPencilAlt className="text-[9px] text-ink-400" />
                              ) : (
                                <FaLock className="text-[9px] text-ink-400" />
                              )}
                              <span className="text-ink-700 font-medium">{r.weight} kg</span>
                              <span className="text-ink-400">· {new Date(r.recordedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              {' · '}
                              <span className={r.source === 'DOCTOR' ? 'text-primary-600 font-medium' : 'text-ink-500'}>
                                {r.source === 'DOCTOR' ? (r.recordedByName || 'Doctor') : 'You'}
                              </span>
                              {r.editedByName && (
                                <span className="text-amber-600"> (corrected by {r.editedByName})</span>
                              )}
                            </button>
                            {editable && (
                              <button
                                type="button"
                                onClick={() => handleDeleteWeight(r)}
                                title="Delete this entry"
                                className="ml-0.5 p-1 rounded-full text-ink-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <FaTrash className="text-[9px]" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Recent Medical Records */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-title mb-0"><FaFileMedical className="text-primary-600" /> Recent Medical Records</h3>
                  <button onClick={() => setActiveTab('medical')} className="text-sm text-primary-600 hover:underline font-medium">
                    View All
                  </button>
                </div>
                {medicalRecords.slice(0, 3).length === 0 ? (
                  <p className="text-ink-400 text-center py-6">No medical records</p>
                ) : (
                  <div className="space-y-2">
                    {medicalRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                        <div>
                          <p className="font-medium text-ink-800">{record.diagnosis}</p>
                          <p className="text-sm text-ink-500">{record.treatment}</p>
                        </div>
                        <span className="text-xs text-ink-400 shrink-0">{record.recordDate?.split('T')[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'medical' && (
            <div className="card">
              <h3 className="section-title"><FaFileMedical className="text-primary-600" /> Medical History</h3>
              {medicalRecords.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No medical records found</p>
              ) : (
                <div className="space-y-3">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">{record.diagnosis}</h4>
                          <p className="text-sm text-ink-600">{record.treatment}</p>
                          {record.notes && <p className="text-sm text-ink-500 mt-1">{record.notes}</p>}
                        </div>
                        <span className="text-xs text-ink-400 shrink-0">{record.recordDate?.split('T')[0]}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <FaUserMd className="text-ink-400 text-xs" />
                        <span className="text-sm text-ink-500">Dr. {record.doctorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vaccinations Tab */}
          {activeTab === 'vaccinations' && (
            <div className="card">
              <h3 className="section-title"><FaSyringe className="text-primary-600" /> Vaccinations</h3>
              {vaccinations.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No vaccinations found</p>
              ) : (
                <div className="space-y-3">
                  {vaccinations.map((vac) => (
                    <div key={vac.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">{vac.vaccineName}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="text-sm text-ink-500">Given: {vac.vaccinationDate}</span>
                            {vac.nextVaccinationDate && (
                              <span className="text-sm text-amber-600">Next due: {vac.nextVaccinationDate}</span>
                            )}
                          </div>
                        </div>
                        <span className={`${vac.isActive ? 'badge-success' : 'badge-neutral'} shrink-0`}>
                          {vac.isActive ? <FaCheckCircle className="text-[10px]" /> : <FaClock className="text-[10px]" />}
                          {vac.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {vac.notes && <p className="text-sm text-ink-500 mt-2">{vac.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="card">
              <h3 className="section-title"><FaPrescription className="text-primary-600" /> Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No prescriptions found</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((pres) => (
                    <div key={pres.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-ink-800">{pres.medicationName}</h4>
                          <div className="grid sm:grid-cols-3 gap-2 mt-2">
                            <p className="text-sm text-ink-600"><span className="font-medium text-ink-700">Dosage:</span> {pres.dosage}</p>
                            <p className="text-sm text-ink-600"><span className="font-medium text-ink-700">Frequency:</span> {pres.frequency}</p>
                            <p className="text-sm text-ink-600"><span className="font-medium text-ink-700">Duration:</span> {pres.duration}</p>
                          </div>
                          {pres.instructions && (
                            <p className="text-sm text-ink-500 mt-2">{pres.instructions}</p>
                          )}
                          {pres.doctorName && (
                            <p className="text-xs text-ink-400 mt-2">Dr. {pres.doctorName}</p>
                          )}
                        </div>
                        <span className={`${pres.isActive ? 'badge-success' : 'badge-neutral'} shrink-0`}>
                          {pres.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="card">
              <h3 className="section-title"><FaCalendar className="text-primary-600" /> Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No appointments found</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((app) => (
                    <div key={app.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">Dr. {app.doctorName}</h4>
                          <p className="text-sm text-ink-500">{app.appointmentDate} at {app.appointmentTime}</p>
                          {app.notes && <p className="text-sm text-ink-500 mt-1">{app.notes}</p>}
                        </div>
                        <span className={`${getStatusBadgeClass(app.status)} shrink-0`}>
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
            <div className="card">
              <h3 className="section-title"><FaBell className="text-primary-600" /> Reminders</h3>
              {reminders.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No reminders set for this pet</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((r) => (
                    <div key={r.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">{r.message}</h4>
                          <p className="text-sm text-ink-500 mt-1">
                            {new Date(r.reminderDateTime).toLocaleString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          {r.doctorName && (
                            <p className="text-sm text-ink-500 mt-1">Dr. {r.doctorName}</p>
                          )}
                        </div>
                        <span className={r.isSent ? 'badge-success' : 'badge-warning'}>
                          {r.isSent ? <><FaCheckCircle className="text-[10px]" /> Sent</> : <><FaClock className="text-[10px]" /> Pending</>}
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

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-sm">
            <h3 className="section-title"><FaWeight className="text-primary-600" /> {editingWeightId ? 'Edit Weight Entry' : `Log ${pet.name}'s Weight`}</h3>
            <form onSubmit={handleLogWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightForm.weight}
                  onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 4.5"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Date</label>
                <input
                  type="date"
                  value={weightForm.recordedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setWeightForm({ ...weightForm, recordedDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                  className="input-field"
                  placeholder="e.g. After vet visit"
                />
              </div>
              {weightError && <p className="text-sm text-red-600">{weightError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowWeightModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={weightSaving} className="btn-primary flex-1 disabled:opacity-60">
                  {weightSaving ? 'Saving...' : (editingWeightId ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetProfile;
