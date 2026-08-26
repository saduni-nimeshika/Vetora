import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaClock, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DoctorAvailability = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({
    availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30
  });

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // ✅ Format data correctly for backend
      const data = {
        availableDays: availability.availableDays.join(','),  // "MON,TUE,WED,THU,FRI"
        startTime: availability.startTime,
        endTime: availability.endTime,
        slotDuration: availability.slotDuration
      };

      console.log('📤 Sending data:', data);

      const response = await api.put('/api/v1/doctor/availability', data);
      
      console.log('📥 Response:', response.data);
      toast.success('✅ Availability saved successfully!');
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized. Please login as Doctor.');
      } else {
        toast.error(error.response?.data?.message || '❌ Failed to save availability');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaClock className="text-emerald-600" />
        Set Your Availability
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                onClick={() => handleToggleDay(day)}
                className={`px-4 py-2 rounded-lg transition ${
                  availability.availableDays.includes(day)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={availability.startTime}
              onChange={(e) => setAvailability({...availability, startTime: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={availability.endTime}
              onChange={(e) => setAvailability({...availability, endTime: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
          <select
            value={availability.slotDuration}
            onChange={(e) => setAvailability({...availability, slotDuration: parseInt(e.target.value)})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <FaSave />
          {loading ? 'Saving...' : 'Save Availability'}
        </button>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p>👤 Role: {user?.role || 'Not logged in'}</p>
          <p>📧 Email: {user?.email || 'N/A'}</p>
          <p>🔗 API: http://localhost:8080/api/v1/doctor/availability</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;