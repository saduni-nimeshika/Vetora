import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const DoctorSearch = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchParams, setSearchParams] = useState({
    district: '',
    city: '',
    specialisation: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Search logic here
    setTimeout(() => {
      setLoading(false);
      setDoctors([]);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaMapMarkerAlt className="text-emerald-600" />
        Find Doctors Near You
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district"
              value={searchParams.district}
              onChange={(e) => setSearchParams({...searchParams, district: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Districts</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kandy">Kandy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={searchParams.city}
              onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
              placeholder="Enter city"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialisation</label>
            <select
              name="specialisation"
              value={searchParams.specialisation}
              onChange={(e) => setSearchParams({...searchParams, specialisation: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Specialisations</option>
              <option value="Small Animal Medicine">Small Animal Medicine</option>
              <option value="Surgery">Surgery</option>
              <option value="Dermatology">Dermatology</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <FaSearch />
              Search Doctors
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No doctors found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="p-4 border rounded-xl hover:border-emerald-300 transition">
                <h3 className="font-semibold">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialisation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;