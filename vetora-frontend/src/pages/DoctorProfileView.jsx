import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserMd, FaStethoscope, FaHospital, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaClock, FaCalendar, FaArrowLeft,
  FaEdit, FaShareAlt, FaHeart, FaGraduationCap, FaBriefcase,
  FaMapPin, FaDirections, FaCalendarCheck, FaInfoCircle,
  FaCheckCircle, FaUser, FaCamera, FaSave, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DoctorProfileView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/doctor/profile');
      setDoctor(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      setFormData(doctor);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/api/v1/doctor/profile', formData);
      setDoctor(formData);
      setEditing(false);
      toast.success('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('❌ Failed to update profile');
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

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        </div>
        <button
          onClick={handleEditToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            editing 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {editing ? <FaTimes /> : <FaEdit />}
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start">
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                {doctor.profileImage ? (
                  <img src={doctor.profileImage} alt={doctor.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-emerald-600 bg-emerald-50">
                    <FaUserMd />
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-2 right-2 bg-emerald-600 text-white p-1.5 rounded-full hover:bg-emerald-700 transition"
                onClick={() => toast.info('Upload photo feature coming soon!')}
              >
                <FaCamera size={14} />
              </button>
            </div>
            <div className="mt-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                <FaCheckCircle className="text-green-600" /> Active
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Dr. {doctor.user?.name || doctor.name}
            </h2>
            <p className="text-emerald-600 font-medium">{doctor.specialisation || 'General Practitioner'}</p>
            <p className="text-sm text-gray-500 mt-1">{doctor.user?.email}</p>
          </div>

          {/* Profile Details - Read Mode */}
          {!editing ? (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-emerald-600" /> About
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Specialisation</span>
                    <span className="font-medium">{doctor.specialisation || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium">{doctor.yearsOfExperience || 0} years</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Qualifications</span>
                    <span className="font-medium">{doctor.qualifications || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">SLVC Registration</span>
                    <span className="font-medium">{doctor.slvcRegistrationNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaHospital className="text-emerald-600" /> Clinic Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Clinic Name</span>
                    <span className="font-medium">{doctor.clinicName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{doctor.city}, {doctor.district}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Address</span>
                    <span className="font-medium">{doctor.clinicAddress || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{doctor.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialisation</label>
                  <input
                    type="text"
                    name="specialisation"
                    value={formData.specialisation || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience || 0}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SLVC Registration</label>
                  <input
                    type="text"
                    name="slvcRegistrationNumber"
                    value={formData.slvcRegistrationNumber || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                  <input
                    type="text"
                    name="clinicAddress"
                    value={formData.clinicAddress || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <FaSave /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileView;