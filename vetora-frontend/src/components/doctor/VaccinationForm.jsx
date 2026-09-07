import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaSyringe, FaSave, FaPaw, FaArrowLeft } from 'react-icons/fa';

const VaccinationForm = () => {
  const [searchParams] = useSearchParams();
  const prefilledPetId = searchParams.get('petId') || '';
  const prefilledPetName = searchParams.get('petName') || '';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petId: prefilledPetId,
    vaccineName: '',
    vaccinationDate: new Date().toISOString().split('T')[0],
    nextVaccinationDate: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        petId: Number(formData.petId),
        nextVaccinationDate: formData.nextVaccinationDate || null,
      };
      await api.post('/api/v1/doctor/vaccinations', payload);
      toast.success('✅ Vaccination record added!');
      setFormData({
        petId: prefilledPetId,
        vaccineName: '',
        vaccinationDate: new Date().toISOString().split('T')[0],
        nextVaccinationDate: '',
        notes: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Failed to add vaccination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slideUp">
      <h1 className="page-title mb-6">
        <FaSyringe className="text-primary-600" /> Add Vaccination Record
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {prefilledPetName ? (
            <div className="mb-4 flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
              <span className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                <FaPaw />
              </span>
              <div>
                <p className="text-xs text-primary-600 font-medium">Adding vaccination for</p>
                <p className="font-semibold text-ink-800">{prefilledPetName}</p>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Pet ID</label>
              <input
                type="number"
                className="input-field"
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                required
              />
              <p className="form-hint">
                Tip: open a pet from <Link to="/doctor/patients" className="text-primary-600 hover:underline inline-flex items-center gap-1"><FaArrowLeft className="text-[10px]" />My Patients</Link> to skip this
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vaccine Name *</label>
            <input
              type="text"
              className="input-field"
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              placeholder="e.g. Rabies, DHPP, Bordetella"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Vaccination Date *</label>
              <input
                type="date"
                className="input-field"
                value={formData.vaccinationDate}
                onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input
                type="date"
                className="input-field"
                value={formData.nextVaccinationDate}
                onChange={(e) => setFormData({ ...formData, nextVaccinationDate: e.target.value })}
              />
              <p className="form-hint">Leave blank if this is a one-time vaccine</p>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Notes</label>
            <textarea
              className="textarea-field"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Batch number, reaction observed, etc."
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            <FaSave /> {loading ? 'Saving...' : 'Save Vaccination Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VaccinationForm;
