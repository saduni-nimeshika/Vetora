import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendar } from 'react-icons/fa';

const AllAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700';
    if (status === 'PENDING') return 'bg-orange-100 text-orange-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    if (status === 'CANCELLED') return 'bg-gray-100 text-gray-700';
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaCalendar className="text-emerald-600" />
        All Appointments
      </h1>

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
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Doctor</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Owner</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Time</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{app.petName}</td>
                    <td className="p-3 text-gray-600">Dr. {app.doctorName}</td>
                    <td className="p-3 text-gray-600">{app.ownerName || 'N/A'}</td>
                    <td className="p-3 text-gray-600">{app.appointmentDate}</td>
                    <td className="p-3 text-gray-600">{app.appointmentTime}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
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

export default AllAppointments;