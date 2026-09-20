import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  FaCalendarCheck, FaCheck, FaTimes, FaSync, FaSearch,
  FaPaw, FaUser, FaClock, FaCheckCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const statusTabs = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        return;
      }
      const res = await api.get('/api/v1/doctor/appointments');
      setAppointments(res.data?.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 403) {
        toast.error('Please login as Doctor');
      } else {
        toast.error('Failed to load appointments');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    setUpdating(appointmentId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        setUpdating(null);
        return;
      }
      await api.put(`/api/v1/doctor/appointments/${appointmentId}/status?status=${status}`);
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments(true);
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 403) {
        toast.error('Please login as Doctor to perform this action');
      } else if (error.response?.status === 404) {
        toast.error('Appointment not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return 'badge-success';
    if (status === 'PENDING') return 'badge-warning';
    if (status === 'REJECTED') return 'badge-danger';
    if (status === 'CANCELLED') return 'badge-neutral';
    if (status === 'COMPLETED') return 'badge-info';
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
    let list = appointments;
    if (statusFilter !== 'ALL') list = list.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.petName?.toLowerCase().includes(q) || a.ownerName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [appointments, statusFilter, search]);

  const ActionButtons = ({ app }) => (
    <div className="flex gap-2 items-center justify-end">
      {app.status === 'PENDING' && (
        <>
          <button
            onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
            disabled={updating === app.id}
            className="p-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
            title="Approve"
          >
            <FaCheck className="text-sm" />
          </button>
          <button
            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
            disabled={updating === app.id}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            title="Reject"
          >
            <FaTimes className="text-sm" />
          </button>
        </>
      )}
      {app.status === 'APPROVED' && (
        <button
          onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
          disabled={updating === app.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 text-xs font-semibold"
        >
          <FaCheckCircle className="text-xs" /> Complete
        </button>
      )}
    </div>
  );

  const PetIdentity = ({ app, size = 'md' }) => {
    const dims = size === 'sm' ? 'w-10 h-10' : 'w-9 h-9';
    const avatar = app.petImage ? (
      <img src={app.petImage} alt={app.petName} className={`${dims} rounded-xl object-cover shrink-0`} />
    ) : (
      <span className={`${dims} rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0`}>
        <FaPaw className="text-sm" />
      </span>
    );
    const content = (
      <div className="flex items-center gap-2.5">
        {avatar}
        <span className="font-semibold text-ink-800 hover:text-primary-600 transition-colors">{app.petName}</span>
      </div>
    );
    return app.petId ? (
      <Link to={`/doctor/patients/${app.petId}`} title="View patient profile">
        {content}
      </Link>
    ) : (
      content
    );
  };

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
        <h1 className="page-title">
          <FaCalendarCheck className="text-primary-600" /> My Appointments
        </h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="input-icon-wrap flex-1 sm:w-56">
            <FaSearch className="field-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field-icon"
              placeholder="Search pet or owner..."
            />
          </div>
          <motion.button
            whileTap={{ rotate: 180 }}
            onClick={() => fetchAppointments(true)}
            disabled={refreshing}
            className="btn-icon border border-ink-200 shrink-0"
            title="Refresh"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </motion.div>

      {/* Status filter tabs */}
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

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="empty-state">
          <FaCalendarCheck className="text-5xl text-ink-300 mb-3" />
          <p className="text-ink-500">
            {appointments.length === 0 ? 'No appointments found' : 'No appointments match your filters'}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.div variants={itemVariants} className="hidden md:block table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((app) => (
                    <motion.tr key={app.id} layout exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <td><PetIdentity app={app} /></td>
                      <td className="text-ink-500">{app.ownerName || 'N/A'}</td>
                      <td className="text-ink-500">{app.appointmentDate}</td>
                      <td className="text-ink-500">{app.appointmentTime}</td>
                      <td>
                        <span className={getStatusBadge(app.status)}>{app.status}</span>
                      </td>
                      <td>
                        <ActionButtons app={app} />
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
                <motion.div key={app.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95 }} className="card-hover">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <PetIdentity app={app} size="sm" />
                      <p className="text-xs text-ink-400 flex items-center gap-1 mt-1 ml-0.5">
                        <FaUser className="text-[10px]" /> {app.ownerName || 'N/A'}
                      </p>
                    </div>
                    <span className={getStatusBadge(app.status)}>{app.status}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                    <p className="text-sm text-ink-500 flex items-center gap-1.5">
                      <FaClock className="text-primary-400 text-xs" /> {app.appointmentDate} at {app.appointmentTime}
                    </p>
                    <ActionButtons app={app} />
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

export default DoctorAppointments;
