import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  FaPaw, FaArrowLeft, FaFileMedical, FaSyringe, FaPrescriptionBottle,
  FaCalendar, FaBell, FaPlus, FaUser, FaPhone, FaEnvelope,
  FaClipboardList, FaCheckCircle, FaClock, FaTimesCircle,
} from 'react-icons/fa';

const PatientProfile = () => {
  const { petId } = useParams();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAll();
  }, [petId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [petRes, recordsRes, vaccRes, presRes, remRes, apptRes] = await Promise.all([
        api.get(`/api/v1/doctor/pets/${petId}`),
        api.get(`/api/v1/doctor/medical-records/pet/${petId}`).catch(() => ({ data: { records: [] } })),
        api.get(`/api/v1/doctor/vaccinations/pet/${petId}`).catch(() => ({ data: { vaccinations: [] } })),
        api.get(`/api/v1/doctor/prescriptions/pet/${petId}`).catch(() => ({ data: { prescriptions: [] } })),
        api.get(`/api/v1/doctor/reminders/pet/${petId}`).catch(() => ({ data: { reminders: [] } })),
        api.get('/api/v1/doctor/appointments').catch(() => ({ data: { appointments: [] } })),
      ]);

      setPet(petRes.data?.pet || petRes.data);
      setMedicalRecords(recordsRes.data?.records || []);
      setVaccinations(vaccRes.data?.vaccinations || []);
      setPrescriptions(presRes.data?.prescriptions || []);
      setReminders(remRes.data?.reminders || []);
      const allAppts = apptRes.data?.appointments || [];
      setAppointments(allAppts.filter((a) => String(a.petId) === String(petId)));
    } catch (error) {
      toast.error('Failed to load patient profile');
    } finally {
      setLoading(false);
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
    </div>
  );
};

export default PatientProfile;

