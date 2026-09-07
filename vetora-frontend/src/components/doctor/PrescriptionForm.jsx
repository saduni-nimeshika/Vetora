import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaPrescriptionBottle, FaSave, FaPaw, FaArrowLeft } from 'react-icons/fa';

const PrescriptionForm = () => {
  const [searchParams] = useSearchParams();
  const prefilledPetId = searchParams.get('petId') || '';
  const prefilledPetName = searchParams.get('petName') || '';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petId: prefilledPetId,
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const resetForm = () => {
    setFormData({
      petId: prefilledPetId,
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        petId: Number(formData.petId),
        prescribedDate: new Date().toISOString(),
      };
      await api.post('/api/v1/doctor/prescriptions', payload);
      toast.success('✅ Prescription added!');
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slideUp">
      <h1 className="page-title mb-6">
        <FaPrescriptionBottle className="text-primary-600" /> Add Prescription
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {prefilledPetName ? (
            <div className="mb-4 flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
              <span className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                <FaPaw />
              </span>
              <div>
                <p className="text-xs text-primary-600 font-medium">Prescribing for</p>
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
            <label className="form-label">Medication Name *</label>
            <input
              type="text"
              className="input-field"
              value={formData.medicationName}
              onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
              placeholder="e.g. Amoxicillin"
              required
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Dosage *</label>
              <input
                type="text"
                className="input-field"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 250mg"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Frequency *</label>
              <input
                type="text"
                className="input-field"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g. Twice daily"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration *</label>
              <input
                type="text"
                className="input-field"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 7 days"
                required
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Instructions</label>
            <textarea
              className="textarea-field"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="e.g. Give with food, avoid dairy..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            <FaSave /> {loading ? 'Saving...' : 'Save Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
