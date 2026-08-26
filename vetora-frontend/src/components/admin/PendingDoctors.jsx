import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaUserCheck, FaUserTimes, FaStethoscope } from 'react-icons/fa';

const PendingDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/admin/doctors/pending');
      setDoctors(res.data || []);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await api.put(`/api/v1/admin/doctors/${doctorId}/approve`);
      setDoctors(doctors.filter(d => d.id !== doctorId));
      alert('✅ Doctor approved successfully!');
    } catch (error) {
      alert('❌ Failed to approve doctor');
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await api.delete(`/api/v1/admin/doctors/${doctorId}/reject`);
      setDoctors(doctors.filter(d => d.id !== doctorId));
      alert('✅ Doctor rejected successfully!');
    } catch (error) {
      alert('❌ Failed to reject doctor');
    }
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
        <FaStethoscope className="text-emerald-600" />
        Pending Doctor Approvals
      </h1>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
          <p>No pending doctors</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{doctor.user?.name}</h3>
                  <p className="text-gray-600">{doctor.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Specialisation:</span> {doctor.specialisation}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Clinic:</span> {doctor.clinicName}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Location:</span> {doctor.city}, {doctor.district}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Qualifications:</span> {doctor.qualifications}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(doctor.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                  >
                    <FaUserCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(doctor.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <FaUserTimes /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingDoctors;