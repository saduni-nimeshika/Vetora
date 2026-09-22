import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarCheck, FaPlus, FaTimes, FaUserMd, FaClock, FaPaw } from 'react-icons/fa';
import toast from 'react-hot-toast';

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

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(appointmentId);
    try {
      await api.put(`/api/v1/owner/appointments/${appointmentId}/cancel`);
      await fetchAppointments();
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return 'badge-success';
    if (status === 'PENDING') return 'badge-warning';
    if (status === 'REJECTED') return 'badge-danger';
    if (status === 'CANCELLED') return 'badge-neutral';
    return 'badge-neutral';
  };

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

      {appointments.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaCalendarCheck className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500 mb-4">No appointments found</p>
          <Link to="/owner/appointments/book" className="btn-primary">
            <FaPlus /> Book Your First Appointment
          </Link>
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
                  {appointments.map((app) => (
                    <motion.tr
                      key={app.id}
                      layout
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="font-semibold text-ink-800">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={app.petImage} fallbackIcon={FaPaw} alt={app.petName} />
                          {app.petName}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar src={app.doctorImage} fallbackIcon={FaUserMd} alt={app.doctorName} />
                          Dr. {app.doctorName}
                        </div>
                      </td>
                      <td>{app.appointmentDate}</td>
                      <td>{app.appointmentTime}</td>
                      <td>
                        <span className={getStatusBadge(app.status)}>{app.status}</span>
                      </td>
                      <td className="text-right">
                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                          <button
                            onClick={() => handleCancel(app.id)}
                            disabled={cancellingId === app.id}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
                            title="Cancel"
                          >
                            <FaTimes className="text-sm" />
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
              {appointments.map((app) => (
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
                        <p className="font-bold text-ink-900">{app.petName}</p>
                        <p className="text-xs text-ink-400 flex items-center gap-1.5 mt-0.5">
                          <Avatar src={app.doctorImage} fallbackIcon={FaUserMd} alt={app.doctorName} size="w-4 h-4" iconClass="text-[8px]" />
                          Dr. {app.doctorName}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(app.status)}>{app.status}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                    <p className="text-sm text-ink-500 flex items-center gap-1.5">
                      <FaClock className="text-primary-400 text-xs" /> {app.appointmentDate} at {app.appointmentTime}
                    </p>
                    {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancel(app.id)}
                        disabled={cancellingId === app.id}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Cancel"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default AppointmentsList;

