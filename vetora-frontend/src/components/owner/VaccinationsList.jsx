import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaSyringe, FaArrowLeft } from 'react-icons/fa';

const VaccinationsList = () => {
  const { petId } = useParams();
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState([]);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaccinations();
  }, [petId]);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/owner/vaccinations/pet/${petId}`);
      setVaccinations(res.data?.vaccinations || []);
      if (res.data?.vaccinations?.length > 0) {
        setPetName(res.data.vaccinations[0].petName);
      }
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
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

  const isUpcoming = (date) => {
    if (!date) return false;
    const today = new Date();
    const nextDate = new Date(date);
    return nextDate > today;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/owner/pets" className="text-gray-600 hover:text-gray-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaSyringe className="text-emerald-600" />
          Vaccinations {petName && `- ${petName}`}
        </h1>
      </div>

      {vaccinations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
          <FaSyringe className="text-6xl text-gray-300 mx-auto mb-4" />
          <p>No vaccinations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vaccinations.map((vac) => (
            <div key={vac.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{vac.vaccineName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Vaccinated on:</span> {vac.vaccinationDate}
                  </p>
                  {vac.nextVaccinationDate && (
                    <p className={`text-sm mt-1 ${isUpcoming(vac.nextVaccinationDate) ? 'text-orange-600' : 'text-gray-500'}`}>
                      <span className="font-medium">Next due:</span> {vac.nextVaccinationDate}
                      {isUpcoming(vac.nextVaccinationDate) && ' ⏰ Upcoming'}
                    </p>
                  )}
                  {vac.notes && (
                    <p className="text-sm text-gray-500 mt-1">📝 {vac.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Doctor: Dr. {vac.doctorName}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${vac.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                  {vac.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaccinationsList;