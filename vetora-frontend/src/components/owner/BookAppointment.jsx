import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendar, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    petId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [petsRes, doctorsRes] = await Promise.all([
        api.get('/api/v1/owner/pets'),
        api.get('/api/v1/search/doctors')
      ]);
      setPets(petsRes.data?.pets || []);
      setDoctors(doctorsRes.data?.doctors || []);
      
      console.log('📋 Available Doctors:', doctorsRes.data?.doctors);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ doctorId එක parseInt කරන්න
      const data = {
        petId: parseInt(formData.petId),
        doctorId: parseInt(formData.doctorId),  // ✅ මෙය User ID එක විය යුතුයි!
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes || ''
      };

      console.log('📤 Sending:', data);

      const response = await api.post('/api/v1/owner/appointments', data);
      
      toast.success('✅ Appointment booked successfully!');
      navigate('/owner/appointments');
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.error || 'Invalid data. Please check all fields.');
      } else if (error.response?.status === 403) {
        toast.error('Please login again.');
      } else {
        toast.error('❌ Failed to book appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to get user ID from doctor data
  const getDoctorUserId = (doctor) => {
    // doctor.user.id = User ID (Appointment එකට ඕනෙ!)
    return doctor.user?.id || doctor.userId || doctor.id;
  };

  const getDoctorName = (doctor) => {
    return doctor.user?.name || doctor.name || 'Unknown';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/owner/appointments" className="text-gray-600 hover:text-gray-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendar className="text-emerald-600" />
          Book Appointment
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
            <select
              name="petId"
              value={formData.petId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select a pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => {
                // ✅ User ID එක value එකට දාන්න!
                const userId = getDoctorUserId(doctor);
                const doctorName = getDoctorName(doctor);
                const specialisation = doctor.specialisation || 'General';
                const clinicName = doctor.clinicName || '';
                
                return (
                  <option key={userId} value={userId}>
                    Dr. {doctorName} {clinicName ? `- ${clinicName}` : ''} ({specialisation})
                  </option>
                );
              })}
            </select>
            {doctors.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">⚠️ No doctors available. Please try again later.</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
                step="900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Any special notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || doctors.length === 0}
            className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Booking...' : '📅 Book Appointment'}
          </button>
        </form>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p>🔍 Selected Doctor ID: {formData.doctorId || 'None'}</p>
          <p>📋 Available Doctors: {doctors.length}</p>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;