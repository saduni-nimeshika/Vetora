import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  FaPaw, FaArrowLeft, FaFileMedical, FaSyringe, FaPrescriptionBottle,
  FaCalendar, FaBell, FaPlus, FaUser, FaPhone, FaEnvelope,
  FaClipboardList, FaCheckCircle, FaClock, FaTimesCircle, FaWeight, FaChartLine, FaPencilAlt,
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

const PatientProfile = () => {
  const { petId } = useParams();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightForm, setWeightForm] = useState({ weight: '', recordedDate: '', notes: '' });
  const [editingWeightId, setEditingWeightId] = useState(null);
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightError, setWeightError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [petId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [petRes, recordsRes, vaccRes, presRes, remRes, apptRes, weightRes] = await Promise.all([
        api.get(`/api/v1/doctor/pets/${petId}`),
        api.get(`/api/v1/doctor/medical-records/pet/${petId}`).catch(() => ({ data: { records: [] } })),
        api.get(`/api/v1/doctor/vaccinations/pet/${petId}`).catch(() => ({ data: { vaccinations: [] } })),
        api.get(`/api/v1/doctor/prescriptions/pet/${petId}`).catch(() => ({ data: { prescriptions: [] } })),
        api.get(`/api/v1/doctor/reminders/pet/${petId}`).catch(() => ({ data: { reminders: [] } })),
        api.get('/api/v1/doctor/appointments').catch(() => ({ data: { appointments: [] } })),
        api.get(`/api/v1/doctor/pets/${petId}/weight-history`).catch(() => ({ data: { history: [] } })),
      ]);

      setPet(petRes.data?.pet || petRes.data);
      setMedicalRecords(recordsRes.data?.records || []);
      setVaccinations(vaccRes.data?.vaccinations || []);
      setPrescriptions(presRes.data?.prescriptions || []);
      setReminders(remRes.data?.reminders || []);
      const allAppts = apptRes.data?.appointments || [];
      setAppointments(allAppts.filter((a) => String(a.petId) === String(petId)));
      setWeightHistory(weightRes.data?.history || []);
    } catch (error) {
      toast.error('Failed to load patient profile');
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
        await api.put(`/api/v1/doctor/pets/weight/${editingWeightId}`, payload);
        toast.success('Weight entry updated');
      } else {
        await api.post(`/api/v1/doctor/pets/${petId}/weight`, payload);
        toast.success('Weight logged');
      }
      setShowWeightModal(false);
      await fetchAll();
    } catch (error) {
      setWeightError(error.response?.data?.error || 'Failed to save weight. Please try again.');
    } finally {
      setWeightSaving(false);
    }
  };

  const weightChartData = {
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
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FaClipboardList /> },
    { key: 'medical', label: 'Medical Records', icon: <FaFileMedical />, count: medicalRecords.length },
    { key: 'vaccinations', label: 'Vaccinations', icon: <FaSyringe />, count: vaccinations.length },
    { key: 'prescriptions', label: 'Prescriptions', icon: <FaPrescriptionBottle />, count: prescriptions.length },
    { key: 'reminders', label: 'Reminders', icon: <FaBell />, count: reminders.length },
    { key: 'appointments', label: 'Appointments', icon: <FaCalendar />, count: appointments.length },
  ];

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A');

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
        <p className="text-ink-500">Patient not found</p>
        <Link to="/doctor/patients" className="text-primary-600 hover:underline mt-2">Back to Patients</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-slideUp">
      <Link to="/doctor/patients" className="inline-flex items-center gap-2 text-ink-500 hover:text-ink-800 mb-4 text-sm font-medium">
        <FaArrowLeft /> Back to Patients
      </Link>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-primary-100 flex items-center justify-center text-4xl border-4 border-primary-100 mb-3">
                {pet.profileImage ? (
                  <img src={pet.profileImage} alt={pet.name} className="w-full h-full object-cover" />
                ) : '🐾'}
              </div>
              <h2 className="text-xl font-bold text-ink-900 font-display">{pet.name}</h2>
              <p className="text-sm text-ink-500">{pet.breed || pet.species}</p>
              <div className="flex justify-center gap-3 mt-2 text-xs text-ink-500 flex-wrap">
                <span>{pet.gender || 'N/A'}</span>
                <span>{pet.weight || 'N/A'} kg</span>
              </div>
            </div>

            <div className="divider" />

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-ink-700 flex items-center gap-2">
                <FaUser className="text-ink-400" /> Owner
              </p>
              <p className="text-ink-600">{pet.ownerName || 'N/A'}</p>
              {pet.ownerEmail && (
                <p className="text-ink-400 text-xs flex items-center gap-1">
                  <FaEnvelope className="text-[10px]" /> {pet.ownerEmail}
                </p>
              )}
            </div>

            <div className="divider" />

            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={activeTab === t.key ? 'tab-item-active w-full justify-start !border-b-0 !bg-primary-50 rounded-lg' : 'tab-item w-full justify-start !border-b-0 hover:bg-ink-50 rounded-lg'}
                >
                  {t.icon} {t.label}
                  {t.count > 0 && <span className="ml-auto badge-neutral">{t.count}</span>}
                </button>
              ))}
            </nav>

            <div className="divider" />

            <div className="space-y-2">
              <Link to={`/doctor/medical-record?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}`} className="btn-primary w-full">
                <FaPlus /> Add Medical Record
              </Link>
              <Link to={`/doctor/vaccinations/new?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}`} className="btn-secondary w-full">
                <FaSyringe /> Add Vaccination
              </Link>
              <Link to={`/doctor/prescriptions/new?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}`} className="btn-secondary w-full">
                <FaPrescriptionBottle /> Add Prescription
              </Link>
              <Link to={`/doctor/reminders?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}`} className="btn-secondary w-full">
                <FaBell /> Add Reminder
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'overview' && (
            <>
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
                  <div><h3 className="stat-value !text-xl">{appointments.length}</h3><p className="stat-label">Appointments</p></div>
                </div>
                <div className="stat-card !p-4">
                  <span className="stat-icon bg-pink-100 text-pink-600 !w-10 !h-10"><FaBell /></span>
                  <div><h3 className="stat-value !text-xl">{reminders.filter(r => !r.isSent).length}</h3><p className="stat-label">Pending Reminders</p></div>
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-title mb-0"><FaChartLine className="text-primary-600" /> Weight Tracking</h3>
                  <button onClick={openWeightModal} className="btn-primary btn-sm">
                    <FaWeight /> Log Weight
                  </button>
                </div>
                {weightHistory.length === 0 ? (
                  <p className="text-ink-400 text-center py-6">No weight entries yet</p>
                ) : (
                  <>
                    <div className="h-48">
                      <Line data={weightChartData} options={weightChartOptions} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {weightHistory.slice(-6).reverse().map((r) => (
                        <button
                          key={r.id}
                          onClick={() => openEditWeightModal(r)}
                          title="Click to edit this entry"
                          className="text-xs bg-ink-50 hover:bg-ink-100 border border-ink-100 rounded-full px-2.5 py-1 text-ink-600 flex items-center gap-1 transition"
                        >
                          <FaPencilAlt className="text-[9px] text-ink-400" />
                          {r.weight} kg · {formatDate(r.recordedDate)}
                          {' · '}
                          <span className={r.source === 'DOCTOR' ? 'text-primary-600 font-medium' : 'text-ink-500'}>
                            {r.source === 'DOCTOR' ? (r.recordedByName || 'You') : (r.recordedByName || 'Owner')}
                          </span>
                          {r.editedByName && (
                            <span className="text-amber-600"> (edited by {r.editedByName})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="card">
                <h3 className="section-title"><FaFileMedical className="text-primary-600" /> Recent Medical Records</h3>
                {medicalRecords.length === 0 ? (
                  <p className="text-ink-400 text-center py-6">No records yet</p>
                ) : (
                  <div className="space-y-2">
                    {medicalRecords.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex justify-between items-center p-3 bg-ink-50 rounded-xl">
                        <div><p className="font-medium text-ink-800">{r.diagnosis}</p><p className="text-sm text-ink-500">{r.treatment}</p></div>
                        <span className="text-xs text-ink-400">{formatDate(r.recordDate)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'medical' && (
            <div className="card">
              <h3 className="section-title"><FaFileMedical className="text-primary-600" /> Medical History</h3>
              {medicalRecords.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No medical records found</p>
              ) : (
                <div className="space-y-3">
                  {medicalRecords.map((r) => (
                    <div key={r.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">{r.diagnosis}</h4>
                          <p className="text-sm text-ink-600">{r.treatment}</p>
                          {r.notes && <p className="text-sm text-ink-500 mt-1">{r.notes}</p>}
                        </div>
                        <span className="text-xs text-ink-400 shrink-0">{formatDate(r.recordDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vaccinations' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title mb-0"><FaSyringe className="text-primary-600" /> Vaccinations</h3>
                <Link to={`/doctor/vaccinations/new?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}`} className="btn-primary btn-sm">
                  <FaPlus /> Add
                </Link>
              </div>
              {vaccinations.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No vaccinations found</p>
              ) : (
                <div className="space-y-3">
                  {vaccinations.map((v) => (
                    <div key={v.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">{v.vaccineName}</h4>
                          <p className="text-sm text-ink-500">Given: {formatDate(v.vaccinationDate)}</p>
                          {v.nextVaccinationDate && (
                            <p className="text-sm text-amber-600">Next due: {formatDate(v.nextVaccinationDate)}</p>
                          )}
                        </div>
                        <span className={v.isActive ? 'badge-success' : 'badge-neutral'}>
                          {v.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title mb-0"><FaPrescriptionBottle className="text-primary-600" /> Prescriptions</h3>
                <Link to={`/doctor/prescriptions/new?petId=${pet.id}&petName=${encodeURIComponent(pet.name)}`} className="btn-primary btn-sm">
                  <FaPlus /> Add
                </Link>
              </div>
              {prescriptions.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No prescriptions found</p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="card-hover !shadow-none border !p-4">
                      <h4 className="font-semibold text-ink-800">{p.medicationName}</h4>
                      <p className="text-sm text-ink-600">{p.dosage} — {p.frequency}</p>
                      {p.instructions && <p className="text-sm text-ink-500 mt-1">{p.instructions}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="card">
              <h3 className="section-title"><FaBell className="text-primary-600" /> Reminders</h3>
              {reminders.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No reminders set</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((r) => (
                    <div key={r.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-ink-800">{r.message}</h4>
                          <p className="text-sm text-ink-500">{formatDate(r.reminderDateTime)}</p>
                        </div>
                        <span className={r.isSent ? 'badge-success' : 'badge-neutral'}>
                          {r.isSent ? <><FaCheckCircle className="text-[10px]" /> Sent</> : <><FaClock className="text-[10px]" /> Pending</>}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="card">
              <h3 className="section-title"><FaCalendar className="text-primary-600" /> Appointment History</h3>
              {appointments.length === 0 ? (
                <p className="text-ink-400 text-center py-8">No appointments found</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((a) => (
                    <div key={a.id} className="card-hover !shadow-none border !p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-ink-800">{formatDate(a.appointmentDate)} at {a.appointmentTime}</p>
                          {a.notes && <p className="text-sm text-ink-500 mt-1">{a.notes}</p>}
                        </div>
                        <span className="badge-info">{a.status}</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm">
            <h3 className="section-title"><FaWeight className="text-primary-600" /> {editingWeightId ? `Edit Weight Entry` : `Log ${pet.name}'s Weight`}</h3>
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
                  placeholder="e.g. Measured during checkup"
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

export default PatientProfile;





