import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaFileMedical, FaArrowLeft } from 'react-icons/fa';

const MedicalRecords = () => {
  const { petId } = useParams();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [petId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/owner/medical-records/pet/${petId}`);
      setRecords(res.data?.records || []);
      if (res.data?.records?.length > 0) {
        setPetName(res.data.records[0].petName);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
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
      <div className="flex items-center gap-4 mb-6">
        <Link to="/owner/pets" className="text-gray-600 hover:text-gray-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaFileMedical className="text-emerald-600" />
          Medical Records {petName && `- ${petName}`}
        </h1>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
          <FaFileMedical className="text-6xl text-gray-300 mx-auto mb-4" />
          <p>No medical records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{record.diagnosis}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {record.recordDate?.split('T')[0]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Treatment:</span> {record.treatment || 'N/A'}
                  </p>
                  {record.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Notes:</span> {record.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Doctor: Dr. {record.doctorName} • {record.createdAt?.split('T')[0]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;