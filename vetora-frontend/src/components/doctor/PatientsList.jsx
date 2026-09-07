import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaPaw, FaSearch, FaArrowRight, FaUser } from 'react-icons/fa';

const PatientsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/doctor/appointments');
      setAppointments(res.data?.appointments || []);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Dedupe pets from the doctor's own appointments — no manual ID entry needed
  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      if (!a.petId) return;
      const existing = map.get(a.petId);
      const isNewer = !existing || new Date(a.appointmentDate) > new Date(existing.lastVisit);
      if (!existing) {
        map.set(a.petId, {
          petId: a.petId,
          petName: a.petName,
          petSpecies: a.petSpecies,
          ownerName: a.ownerName,
          lastVisit: a.appointmentDate,
          visitCount: 1,
        });
      } else {
        existing.visitCount += 1;
        if (isNewer) existing.lastVisit = a.appointmentDate;
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
  }, [appointments]);

  const filtered = patients.filter((p) =>
    p.petName?.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    p.petSpecies?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto animate-slideUp">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaPaw className="text-primary-600" /> My Patients
          </h1>
          <p className="page-subtitle">Pets you've had appointments with — no need to remember Pet IDs</p>
        </div>
      </div>

      <div className="input-icon-wrap mb-6">
        <FaSearch className="field-icon" />
        <input
          type="text"
          className="input-field-icon"
          placeholder="Search by pet name, owner, or species..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaPaw className="text-4xl text-ink-300 mb-3" />
          <p className="text-ink-500 font-medium">
            {patients.length === 0 ? 'No patients yet' : 'No matches found'}
          </p>
          <p className="text-ink-400 text-sm mt-1">
            {patients.length === 0 ? 'Patients appear here once you have appointments' : 'Try a different search term'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Link key={p.petId} to={`/doctor/patients/${p.petId}`} className="card-hover flex items-center gap-4">
              <span className="avatar w-14 h-14 bg-primary-100 text-primary-700 text-xl shrink-0">
                🐾
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink-800 truncate">{p.petName}</h3>
                <p className="text-sm text-ink-500 truncate">{p.petSpecies}</p>
                <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
                  <FaUser className="text-[10px]" /> {p.ownerName || 'Owner N/A'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="badge-neutral">{p.visitCount} visit{p.visitCount > 1 ? 's' : ''}</span>
                <FaArrowRight className="text-ink-300 mt-2 ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsList;
