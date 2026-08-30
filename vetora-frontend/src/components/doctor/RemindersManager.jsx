import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  FaBell, FaPlus, FaTrash, FaSyringe, FaPills, FaCalendarCheck,
  FaClock, FaCheckCircle, FaTimes,
} from 'react-icons/fa';

const typeConfig = {
  VACCINATION: { label: 'Vaccination', icon: <FaSyringe />, badge: 'badge-info', iconBg: 'bg-blue-100 text-blue-600' },
  MEDICATION: { label: 'Medication', icon: <FaPills />, badge: 'badge-warning', iconBg: 'bg-amber-100 text-amber-600' },
  APPOINTMENT: { label: 'Appointment', icon: <FaCalendarCheck />, badge: 'badge-success', iconBg: 'bg-emerald-100 text-emerald-600' },
};

const RemindersManager = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    petId: '',
    type: 'VACCINATION',
    reminderDateTime: '',
    message: '',
    isRecurring: false,
    recurrenceInterval: '',
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/doctor/reminders/my-reminders');
      const list = res.data?.reminders || [];
      list.sort((a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime));
      setReminders(list);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      type: 'VACCINATION',
      reminderDateTime: '',
      message: '',
      isRecurring: false,
      recurrenceInterval: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        petId: Number(formData.petId),
        recurrenceInterval: formData.isRecurring
          ? Number(formData.recurrenceInterval) || null
          : null,
      };
      await api.post('/api/v1/doctor/reminders', payload);
      toast.success('Reminder created successfully!');
      resetForm();
      setShowForm(false);
      fetchReminders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.delete(`/api/v1/doctor/reminders/${id}`);
      toast.success('Reminder deleted');
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-slideUp">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaBell className="text-primary-600" /> Reminders
          </h1>
          <p className="page-subtitle">Create and manage reminders for your patients</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className={showForm ? 'btn-secondary' : 'btn-primary'}
        >
          {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> New Reminder</>}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-scaleIn">
          <h2 className="section-title">
            <FaPlus className="text-primary-600" /> Create Reminder
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Pet ID</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  placeholder="e.g. 12"
                  required
                />
                <p className="form-hint">Find the Pet ID on the pet's profile page</p>
              </div>

              <div className="form-group">
                <label className="form-label">Reminder Type</label>
                <select
                  className="select-field"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="VACCINATION">Vaccination</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="APPOINTMENT">Appointment</option>
                </select>
              </div>

              <div className="form-group sm:col-span-2">
                <label className="form-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={formData.reminderDateTime}
                  onChange={(e) => setFormData({ ...formData, reminderDateTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group sm:col-span-2">
                <label className="form-label">Message</label>
                <textarea
                  className="textarea-field"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Rabies booster due"
                  required
                />
              </div>

              <div className="form-group flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  className="checkbox-field"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-ink-700">
                  Recurring reminder
                </label>
              </div>

              {formData.isRecurring && (
                <div className="form-group">
                  <label className="form-label">Repeat every (days)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.recurrenceInterval}
                    onChange={(e) => setFormData({ ...formData, recurrenceInterval: e.target.value })}
                    placeholder="e.g. 30"
                    min="1"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className="btn-ghost" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Reminder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-10 h-10" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="empty-state">
          <FaBell className="text-4xl text-ink-300 mb-3" />
          <p className="text-ink-500 font-medium">No reminders yet</p>
          <p className="text-ink-400 text-sm mt-1">Create your first reminder for a patient above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const cfg = typeConfig[r.type] || typeConfig.APPOINTMENT;
            return (
              <div key={r.id} className="card-hover flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`stat-icon ${cfg.iconBg} shrink-0`}>
                    {cfg.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-ink-800">{r.petName}</h3>
                      <span className={cfg.badge}>{cfg.label}</span>
                      {r.isSent ? (
                        <span className="badge-success"><FaCheckCircle className="text-[10px]" /> Sent</span>
                      ) : (
                        <span className="badge-neutral"><FaClock className="text-[10px]" /> Pending</span>
                      )}
                    </div>
                    <p className="text-sm text-ink-600 mt-1">{r.message}</p>
                    <p className="text-xs text-ink-400 mt-1">{formatDate(r.reminderDateTime)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="btn-icon text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0 self-end sm:self-center"
                  aria-label="Delete reminder"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemindersManager;
