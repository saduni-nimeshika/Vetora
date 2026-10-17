import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarCheck, FaPlus, FaTimes, FaUserMd, FaClock, FaPaw } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDoctorName } from '../../utils/doctorName';

const statusTabs = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const AppointmentsList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/owner/appointments');
      setAppointments(res.data?.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load your appointments');
    } finally {
      setLoading(false);
    }
  };

  // ---- Cancel flow: button -> confirmation window (with optional reason) -> API ----
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const quickReasons = ['Change of plans', 'My pet is feeling better', 'Found another vet', 'Booked by mistake'];

  // Only PENDING or APPROVED appointments that have not happened yet can be cancelled
  const canCancel = (app) =>
    (app.status === 'PENDING' || app.status === 'APPROVED') &&
    new Date(`${app.appointmentDate}T${app.appointmentTime}`) > new Date();

  const openCancel = (app) => {
    setCancelTarget(app);
    setCancelReason('');
  };

  const closeCancel = () => {
    if (cancellingId) return;
    setCancelTarget(null);
    setCancelReason('');
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancellingId(cancelTarget.id);
    try {
      const reason = cancelReason.trim();
      const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      await api.put(`/api/v1/owner/appointments/${cancelTarget.id}/cancel${query}`);
      toast.success('Appointment cancelled. The doctor has been notified.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
      setCancelTarget(null);
      setCancelReason('');
      fetchAppointments();
    }
  };

  // Short note shown under the status when the doctor/owner gave a reason
  const reasonText = (app) => {
    if (app.status === 'CANCELLED' && app.cancellationReason) return `Reason: ${app.cancellationReason}`;
    if (app.status === 'REJECTED' && app.rejectionReason && app.rejectionReason !== 'No reason provided') {
      return `Reason: ${app.rejectionReason}`;
    }
    return null;
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return 'badge-success';
    if (status === 'PENDING') return 'badge-warning';
    if (status === 'REJECTED') return 'badge-danger';
    if (status === 'CANCELLED') return 'badge-neutral';
    return 'badge-neutral';
  };

  const counts = useMemo(() => {
    const c = { ALL: appointments.length };
    statusTabs.slice(1).forEach((s) => {
      c[s] = appointments.filter((a) => a.status === s).length;
    });
    return c;
  }, [appointments]);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const Avatar = ({ src, fallbackIcon: Icon, alt, size = 'w-9 h-9', iconClass = 'text-sm' }) => (
    <span className={`${size} rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 overflow-hidden`}>
      {src && src !== 'default-avatar.png' ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <Icon className={iconClass} />
      )}
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="text-2xl font-extrabold text-ink-900 font-display flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <FaCalendarCheck />
          </span>
          My Appointments
        </h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/owner/appointments/book" className="btn-primary">
            <FaPlus /> Book New
          </Link>
        </motion.div>
      </motion.div>

      {/* Status filter tabs */}
      {appointments.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === tab
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className="ml-1 opacity-70">({counts[tab] ?? 0})</span>
            </button>
          ))}
        </motion.div>
      )}

      {appointments.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaCalendarCheck className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500 mb-4">No appointments found</p>
          <Link to="/owner/appointments/book" className="btn-primary">
            <FaPlus /> Book Your First Appointment
          </Link>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaCalendarCheck className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500">No appointments match this filter</p>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.div variants={itemVariants} className="hidden md:block table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((app) => (
                    <motion.tr
                      key={app.id}
                      layout
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="font-semibold text-ink-800">
                        {app.petId ? (
                          <Link
                            to={`/owner/pets/${app.petId}`}
                            className="flex items-center gap-2.5 hover:text-primary-600 transition-colors"
                          >
                            <Avatar src={app.petImage} fallbackIcon={FaPaw} alt={app.petName} />
                            {app.petName}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <Avatar src={app.petImage} fallbackIcon={FaPaw} alt={app.petName} />
                            {app.petName}
                          </div>
                        )}
                      </td>
                      <td>
                        {app.doctorProfileId ? (
                          <Link
                            to={`/owner/doctors/${app.doctorProfileId}`}
                            className="flex items-center gap-2.5 hover:text-primary-600 transition-colors"
                          >
                            <Avatar src={app.doctorImage} fallbackIcon={FaUserMd} alt={app.doctorName} />
                            {formatDoctorName(app.doctorName)}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <Avatar src={app.doctorImage} fallbackIcon={FaUserMd} alt={app.doctorName} />
                            {formatDoctorName(app.doctorName)}
                          </div>
                        )}
                      </td>
                      <td>{app.appointmentDate}</td>
                      <td>{app.appointmentTime}</td>
                      <td>
                        <span className={getStatusBadge(app.status)}>{app.status}</span>
                        {reasonText(app) && (
                          <p className="text-xs text-ink-400 mt-1 max-w-[220px] leading-snug">{reasonText(app)}</p>
                        )}
                      </td>
                      <td className="text-right">
                        {canCancel(app) && (
                          <button
                            onClick={() => openCancel(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <FaTimes className="text-[10px]" /> Cancel
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Mobile cards */}
          <motion.div variants={containerVariants} className="md:hidden space-y-3">
            <AnimatePresence>
              {filtered.map((app) => (
                <motion.div
                  key={app.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={app.petImage} fallbackIcon={FaPaw} alt={app.petName} size="w-10 h-10" />
                      <div>
                        {app.petId ? (
                          <Link to={`/owner/pets/${app.petId}`} className="font-bold text-ink-900 hover:text-primary-600 transition-colors">
                            {app.petName}
                          </Link>
                        ) : (
                          <p className="font-bold text-ink-900">{app.petName}</p>
                        )}
                        {app.doctorProfileId ? (
                          <Link
                            to={`/owner/doctors/${app.doctorProfileId}`}
                            className="text-xs text-ink-400 flex items-center gap-1.5 mt-0.5 hover:text-primary-600 transition-colors"
                          >
                            <Avatar src={app.doctorImage} fallbackIcon={FaUserMd} alt={app.doctorName} size="w-4 h-4" iconClass="text-[8px]" />
                            {formatDoctorName(app.doctorName)}
                          </Link>
                        ) : (
                          <p className="text-xs text-ink-400 flex items-center gap-1.5 mt-0.5">
                            <Avatar src={app.doctorImage} fallbackIcon={FaUserMd} alt={app.doctorName} size="w-4 h-4" iconClass="text-[8px]" />
                            {formatDoctorName(app.doctorName)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={getStatusBadge(app.status)}>{app.status}</span>
                  </div>
                  {reasonText(app) && (
                    <p className="text-xs text-ink-400 mb-3 leading-snug">{reasonText(app)}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                    <p className="text-sm text-ink-500 flex items-center gap-1.5">
                      <FaClock className="text-primary-400 text-xs" /> {app.appointmentDate} at {app.appointmentTime}
                    </p>
                    {canCancel(app) && (
                      <button
                        onClick={() => openCancel(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <FaTimes className="text-[10px]" /> Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* Cancel confirmation window */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            key="cancel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={closeCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-elevated w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-ink-900">Cancel this appointment?</h3>

              <div className="mt-4 rounded-xl bg-ink-50 p-3 text-sm text-ink-600 space-y-1">
                <p><span className="text-ink-400">Pet:</span> <b className="text-ink-800">{cancelTarget.petName}</b></p>
                <p><span className="text-ink-400">Doctor:</span> <b className="text-ink-800">{formatDoctorName(cancelTarget.doctorName)}</b></p>
                <p><span className="text-ink-400">When:</span> <b className="text-ink-800">{cancelTarget.appointmentDate} at {cancelTarget.appointmentTime}</b></p>
                <p><span className="text-ink-400">Status:</span> <b className="text-ink-800">{cancelTarget.status}</b></p>
              </div>

              <p className="mt-3 text-xs text-ink-500">
                {cancelTarget.status === 'APPROVED'
                  ? 'The doctor has already accepted this appointment. Cancelling will free the time slot and notify the doctor.'
                  : 'Cancelling will withdraw your request and free the time slot.'}
                {' '}This cannot be undone. You can book a new appointment at any time.
              </p>

              <label className="form-label mt-4">Reason (optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {quickReasons.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setCancelReason(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      cancelReason === r ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                className="textarea-field"
                rows="2"
                maxLength={250}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tell the doctor why (optional)"
              />

              <div className="mt-5 flex gap-3 justify-end">
                <button type="button" onClick={closeCancel} disabled={!!cancellingId} className="btn-secondary">
                  Keep appointment
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  disabled={!!cancellingId}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {cancellingId ? 'Cancelling...' : 'Yes, cancel appointment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppointmentsList;









