import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendar, FaCheck, FaTimes, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // ✅ Check if token exists
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
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    setUpdating(appointmentId);
    try {
      // ✅ Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        setUpdating(null);
        return;
      }

      const response = await api.put(`/api/v1/doctor/appointments/${appointmentId}/status?status=${status}`);
      
      toast.success(`✅ Appointment ${status.toLowerCase()} successfully!`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      
      if (error.response?.status === 403) {
        toast.error('❌ Please login as Doctor to perform this action');
      } else if (error.response?.status === 404) {
        toast.error('❌ Appointment not found');
      } else {
        toast.error(error.response?.data?.message || '❌ Failed to update status');
      }
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700';
    if (status === 'PENDING') return 'bg-orange-100 text-orange-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'CANCELLED') return 'bg-gray-100 text-gray-700';
    if (status === 'COMPLETED') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendar className="text-emerald-600" />
          My Appointments
        </h1>
        <button
          onClick={fetchAppointments}
          className="text-gray-500 hover:text-gray-700 transition"
          disabled={loading}
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Pet</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Owner</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Time</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{app.petName}</td>
                    <td className="p-3 text-gray-600">{app.ownerName || 'N/A'}</td>
                    <td className="p-3 text-gray-600">{app.appointmentDate}</td>
                    <td className="p-3 text-gray-600">{app.appointmentTime}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                            disabled={updating === app.id}
                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
                            title="Approve"
                          >
                            {updating === app.id ? '...' : <FaCheck />}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                            disabled={updating === app.id}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title="Reject"
                          >
                            {updating === app.id ? '...' : <FaTimes />}
                          </button>
                        </div>
                      )}
                      {app.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                          disabled={updating === app.id}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 text-sm"
                        >
                          {updating === app.id ? '...' : '✅ Complete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;