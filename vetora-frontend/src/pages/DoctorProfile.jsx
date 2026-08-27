import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserMd, FaStethoscope, FaHospital, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaClock, FaCalendar, FaArrowLeft,
  FaStar, FaStarHalfAlt, FaRegStar, FaShareAlt, FaHeart,
  FaGraduationCap, FaBriefcase, FaMapPin, FaDirections,
  FaCalendarCheck, FaInfoCircle, FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: 6.9271, lng: 79.8612 });
        }
      );
    } else {
      setUserLocation({ lat: 6.9271, lng: 79.8612 });
    }
  }, []);

  // Fetch doctor details
  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/search/doctors/${doctorId}`);
      const doctorData = response.data;
      setDoctor(doctorData);
      
      // Calculate distance
      if (userLocation && doctorData.latitude && doctorData.longitude) {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          doctorData.latitude,
          doctorData.longitude
        );
        setDistance(dist);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Doctor not found');
      navigate('/search-doctors');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (dist) => {
    if (dist === null) return 'N/A';
    if (dist < 1) {
      return `${(dist * 1000).toFixed(0)} m`;
    }
    return `${dist.toFixed(1)} km`;
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
        <p className="text-gray-500">Doctor not found</p>
        <Link to="/search-doctors" className="text-emerald-600 hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-emerald-100 border-4 border-emerald-100 mb-4">
              {doctor.profileImage ? (
                <img src={doctor.profileImage} alt={doctor.user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl text-emerald-600">
                  <FaUserMd />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <h1 className="text-xl font-bold text-gray-800 text-center">
              Dr. {doctor.user?.name || doctor.name}
            </h1>
            <p className="text-sm text-emerald-600 text-center font-medium">
              {doctor.specialisation || 'General Practitioner'}
            </p>

            {/* Rating */}
            <div className="flex justify-center items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-sm" />
              ))}
              <span className="text-xs text-gray-500 ml-1">(4.8)</span>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Experience</span>
                <span className="font-medium">{doctor.yearsOfExperience || 0} years</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Patients</span>
                <span className="font-medium">150+</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Distance</span>
                <span className="font-medium text-emerald-600">
                  📍 {formatDistance(distance)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <FaCheckCircle className="text-green-600" /> Available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                to={`/owner/appointments/book?doctorId=${doctor.user?.id}`}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <FaCalendarCheck /> Book Appointment
              </Link>
              {doctor.latitude && doctor.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <FaDirections /> Get Directions
                </a>
              )}
              <button
                onClick={() => {
                  toast.success('Profile shared!');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <FaShareAlt /> Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-emerald-600" />
              About
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Dr. {doctor.user?.name || doctor.name} is a {doctor.specialisation || 'veterinary'} 
              specialist with {doctor.yearsOfExperience || 0} years of experience. 
              Dedicated to providing the best care for your beloved pets.
            </p>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaHospital className="text-emerald-600" />
              Clinic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Clinic Name</p>
                <p className="font-medium text-gray-800">{doctor.clinicName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
                <p className="font-medium text-gray-800">{doctor.city}, {doctor.district}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Address</p>
                <p className="font-medium text-gray-800">{doctor.clinicAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="font-medium text-gray-800">{doctor.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-800">{doctor.user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Qualifications & Specialisations */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-emerald-600" />
              Qualifications & Specialisations
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Qualifications</p>
                <p className="font-medium text-gray-800">{doctor.qualifications || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Specialisation</p>
                <p className="font-medium text-gray-800">{doctor.specialisation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">SLVC Registration</p>
                <p className="font-medium text-gray-800">{doctor.slvcRegistrationNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Experience</p>
                <p className="font-medium text-gray-800">{doctor.yearsOfExperience || 0} years</p>
              </div>
            </div>
          </div>

          {/* Location Map */}
          {doctor.latitude && doctor.longitude && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-600" />
                Location
              </h2>
              <div className="rounded-xl overflow-hidden h-48">
                <iframe
                  title="Doctor Location"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${doctor.longitude-0.01}%2C${doctor.latitude-0.01}%2C${doctor.longitude+0.01}%2C${doctor.latitude+0.01}&layer=mapnik&marker=${doctor.latitude}%2C${doctor.longitude}`}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                📍 {doctor.clinicName} - {doctor.clinicAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;