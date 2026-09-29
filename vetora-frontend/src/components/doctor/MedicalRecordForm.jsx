import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaFileMedical, FaSave, FaPaw, FaArrowLeft, FaUserMd, FaSearch } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const MedicalRecordForm = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const prefilledPetId = searchParams.get('petId') || '';
  const prefilledPetName = searchParams.get('petName') || '';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petId: prefilledPetId,
    diagnosis: '',
    treatment: '',
    notes: '',
    recordDate: new Date().toISOString().split('T')[0],
  });

  // The pet this record is being written for — fetched so we can show a real
  // photo and clear details instead of just the name from the URL.
  const [pet, setPet] = useState(null);
  const [petLoading, setPetLoading] = useState(!!prefilledPetId);

  // If we didn't arrive with a pet already chosen, let the doctor pick from
  // their own patients (derived from their appointments) instead of typing a
  // raw Pet ID — the same approach the "My Patients" page uses.
  const [appointments, setAppointments] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(!prefilledPetId);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (formData.petId) {
      fetchPet(formData.petId);
    } else {
      fetchAppointmentsForPicker();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPet = async (petId) => {
    setPetLoading(true);
    try {
      const res = await api.get(`/api/v1/doctor/pets/${petId}`);
      setPet(res.data?.pet || null);
    } catch (error) {
      setPet(null);
    } finally {
      setPetLoading(false);
    }
  };

  const fetchAppointmentsForPicker = async () => {
    try {
      const res = await api.get('/api/v1/doctor/appointments');
      setAppointments(res.data?.appointments || []);
    } catch (error) {
      // Non-fatal — the doctor can still open a pet from "My Patients" instead
    } finally {
      setPatientsLoading(false);
    }
  };

  // Dedupe pets from the doctor's own appointments — no manual ID entry needed
  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      if (!a.petId || map.has(a.petId)) return;
      map.set(a.petId, {
        id: a.petId,
        name: a.petName,
        species: a.petSpecies,
        profileImage: a.petImage,
        ownerName: a.ownerName,
      });
    });
    return Array.from(map.values());
  }, [appointments]);

  const choosePatient = (p) => {
    setFormData({ ...formData, petId: String(p.id) });
    setPet(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.petId) {
      toast.error('Please choose a pet first');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/doctor/medical-records', formData);
      toast.success('Medical record added successfully');
      setFormData({ ...formData, diagnosis: '', treatment: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add medical record');
    } finally {
      setLoading(false);
    }
  };

  const displayName = pet?.name || prefilledPetName;
  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">
          <FaFileMedical className="text-primary-600" /> Add Medical Record
        </h1>
      </motion.div>

      {/* Recorded by — makes clear which doctor this entry will be attributed to */}
      <motion.div variants={itemVariants} className="mb-4 flex items-center gap-2.5 text-sm text-ink-500">
        <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
          <FaUserMd className="text-xs" />
        </span>
        Recorded by <span className="font-semibold text-ink-700">Dr. {user?.name}</span>
      </motion.div>

      <motion.div variants={itemVariants} className="card">
        {/* Pet picker — shown only when we didn't arrive with a pet already chosen */}
        {!formData.petId && (
          <div className="mb-5">
            <label className="form-label">Choose Pet *</label>
            <div className="input-icon-wrap mb-3">
              <FaSearch className="field-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field-icon"
                placeholder="Search your patients by name..."
              />
            </div>
            {patientsLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-ink-100 rounded-xl" />)}
              </div>
            ) : filteredPatients.length === 0 ? (
              <p className="text-ink-400 text-sm text-center py-6">
                No matching patients yet. You can also open a pet from{' '}
                <Link to="/doctor/patients" className="text-primary-600 hover:underline inline-flex items-center gap-1">
                  <FaArrowLeft className="text-[10px]" />My Patients
                </Link>{' '}
                and add the record from there.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredPatients.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => choosePatient(p)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-ink-100 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                  >
                    {p.profileImage && p.profileImage !== 'default-avatar.png' ? (
                      <img src={p.profileImage} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <span className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        <FaPaw />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-ink-800">{p.name}</p>
                      <p className="text-xs text-ink-400">{p.species}{p.ownerName ? ` • Owner: ${p.ownerName}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pet identity card — real photo + clear details once a pet is chosen */}
        {formData.petId && (
          <div className="mb-5 flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
            {petLoading ? (
              <>
                <span className="w-14 h-14 rounded-xl bg-primary-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-primary-100 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-primary-100 rounded animate-pulse" />
                </div>
              </>
            ) : (
              <>
                {pet?.profileImage && pet.profileImage !== 'default-avatar.png' ? (
                  <img src={pet.profileImage} alt={displayName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <span className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 shrink-0 text-xl">
                    <FaPaw />
                  </span>
                )}
                <div className="flex-1">
                  <p className="text-xs text-primary-600 font-medium">Adding record for</p>
                  <p className="font-bold text-ink-900">{displayName}</p>
                  <p className="text-xs text-ink-500">
                    {[pet?.species, pet?.breed].filter(Boolean).join(' • ')}
                    {pet?.ownerName ? ` • Owner: ${pet.ownerName}` : ''}
                  </p>
                </div>
                {!prefilledPetId && (
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, petId: '' }); setPet(null); }}
                    className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
                  >
                    Change
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Record Date *</label>
            <input
              type="date"
              className="input-field"
              value={formData.recordDate}
              onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <input
              type="text"
              className="input-field"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Severe Skin Allergy"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Treatment</label>
            <input
              type="text"
              className="input-field"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="e.g. Antihistamine + Steroid cream"
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Notes</label>
            <textarea
              className="textarea-field"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="4"
              placeholder="Any additional observations..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.petId}
            className="btn-primary w-full mt-6"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MedicalRecordForm;


