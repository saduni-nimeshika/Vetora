import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { FaCalendar } from 'react-icons/fa';
import { formatDoctorName } from '../../utils/doctorName';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const statusTabs = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/appointments');
      setAppointments(res.data?.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const c = { ALL: appointments.length };
    statusTabs.slice(1).forEach((s) => {
      c[s] = appointments.filter((a) => a.status === s).length;
    });
    return c;
  }, [appointments]);

  const filtered = useMemo(
    () => (statusFilter === 'ALL' ? appointments : appointments.filter((a) => a.status === statusFilter)),
    [appointments, statusFilter]
  );

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return 'badge-info';
    if (status === 'PENDING') return 'badge-warning';
    if (status === 'COMPLETED') return 'badge-success';
    if (status === 'REJECTED') return 'badge-danger';
    return 'badge-neutral'; // CANCELLED
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">
          <FaCalendar className="text-primary-600" /> All Appointments
        </h1>
      </motion.div>

      {/* Status filter tabs */}
      {appointments.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-5">
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
          <FaCalendar className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500">No appointments found</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaCalendar className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500">No appointments match this filter</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Pet</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Doctor</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Owner</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Time</th>
                  <th className="p-3 text-left text-sm font-semibold text-ink-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-t border-ink-100 hover:bg-ink-50">
                    <td className="p-3 font-semibold text-ink-800">{app.petName}</td>
                    <td className="p-3 text-ink-600">{formatDoctorName(app.doctorName)}</td>
                    <td className="p-3 text-ink-600">{app.ownerName || 'N/A'}</td>
                    <td className="p-3 text-ink-600">{app.appointmentDate}</td>
                    <td className="p-3 text-ink-600">{app.appointmentTime}</td>
                    <td className="p-3">
                      <span className={getStatusBadge(app.status)}>{app.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AllAppointments;
