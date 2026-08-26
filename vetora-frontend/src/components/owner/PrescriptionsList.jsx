import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaPrescription, FaArrowLeft } from 'react-icons/fa';

const PrescriptionsList = () => {
  const { petId } = useParams();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [petId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/owner/prescriptions/pet/${petId}`);
      setPrescriptions(res.data?.prescriptions || []);
      if (res.data?.prescriptions?.length > 0) {
        setPetName(res.data.prescriptions[0].petName);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
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
          <FaPrescription className="text-emerald-600" />
          Prescriptions {petName && `- ${petName}`}
        </h1>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
          <FaPrescription className="text-6xl text-gray-300 mx-auto mb-4" />
          <p>No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((pres) => (
            <div key={pres.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{pres.medicationName}</h3>
                  <div className="grid md:grid-cols-3 gap-2 mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Dosage:</span> {pres.dosage}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Frequency:</span> {pres.frequency}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span> {pres.duration}
                    </p>
                  </div>
                  {pres.instructions && (
                    <p className="text-sm text-gray-500 mt-2">📋 {pres.instructions}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Doctor: Dr. {pres.doctorName} • {pres.prescribedDate?.split('T')[0]}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${pres.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                  {pres.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionsList;