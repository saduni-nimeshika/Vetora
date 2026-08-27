import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSearch, FaMapMarkerAlt, FaStethoscope, FaHospital, FaDirections, FaTimes, FaCalendar, FaRuler, FaUserMd } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Doctor Marker Icon
const doctorIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationMarker = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  return position ? (
    <Marker position={position}>
      <Popup>📍 Your Location</Popup>
    </Marker>
  ) : null;
};

// ✅ Doctor Details Modal
const DoctorDetailsModal = ({ doctor, onClose, userLocation }) => {
  if (!doctor) return null;

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

  const distance = userLocation && doctor.latitude && doctor.longitude
    ? calculateDistance(userLocation.lat, userLocation.lng, doctor.latitude, doctor.longitude)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserMd className="text-emerald-600" />
              Dr. {doctor.user?.name || doctor.name}
            </h2>
            {distance !== null && (
              <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <FaRuler /> 📍 {distance.toFixed(1)} km from your location
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Doctor Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Specialisation</p>
            <p className="font-medium text-gray-800">{doctor.specialisation || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Experience</p>
            <p className="font-medium text-gray-800">{doctor.yearsOfExperience || 'N/A'} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Clinic</p>
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
            <p className="text-xs text-gray-400 uppercase tracking-wider">Qualifications</p>
            <p className="font-medium text-gray-800">{doctor.qualifications || 'N/A'}</p>
          </div>
        </div>

        {/* Mini Map */}
        {userLocation && doctor.latitude && doctor.longitude && (
          <div className="mt-4 border rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="text-sm font-medium text-gray-700">📍 Location Map</h4>
            </div>
            <div className="h-56">
              <MapContainer
                center={[doctor.latitude, doctor.longitude]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>📍 Your Location</Popup>
                </Marker>
                <Marker position={[doctor.latitude, doctor.longitude]} icon={doctorIcon}>
                  <Popup>{doctor.clinicName}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-4 py-2 bg-gray-50">
              <span>📍 Your Location</span>
              <span>🏥 {doctor.clinicName}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/owner/appointments/book?doctorId=${doctor.user?.id}`}
            className="flex-1 min-w-[120px] bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <FaCalendar /> Book Appointment
          </Link>
          {doctor.latitude && doctor.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <FaDirections /> Directions
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 min-w-[100px] bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorSearch = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchParams, setSearchParams] = useState({
    district: '',
    city: '',
    specialisation: '',
    radius: 10
  });
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState(null);

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
    'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
    'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya', 'Puttalam',
    'Kurunegala', 'Kegalle', 'Ratnapura', 'Badulla', 'Monaragala',
    'Ampara', 'Batticaloa', 'Trincomalee', 'Polonnaruwa', 'Anuradhapura'
  ];

  const specialisations = [
    'Small Animal Medicine', 'Large Animal Medicine', 'Surgery',
    'Dermatology', 'Cardiology', 'Neurology', 'Orthopedics',
    'Ophthalmology', 'Dentistry', 'Nutrition', 'Emergency Medicine'
  ];

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

  const searchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lon', userLocation.lng);
        params.append('radius', searchParams.radius);
      }
      if (searchParams.district) params.append('district', searchParams.district);
      if (searchParams.city) params.append('city', searchParams.city);
      if (searchParams.specialisation) params.append('specialisation', searchParams.specialisation);

      const response = await api.get(`/api/v1/search/doctors?${params.toString()}`);
      
      if (response.data && response.data.doctors) {
        setDoctors(response.data.doctors);
        setFilteredDoctors(response.data.doctors);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
      setError('Failed to search doctors. Please try again.');
      toast.error('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      searchDoctors();
    }
  }, [userLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchDoctors();
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaMapMarkerAlt className="text-emerald-600" />
        Find Doctors Near You
      </h1>

      {/* Search Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district"
              value={searchParams.district}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={searchParams.city}
              onChange={handleInputChange}
              placeholder="Enter city"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialisation</label>
            <select
              name="specialisation"
              value={searchParams.specialisation}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Specialisations</option>
              {specialisations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="radius"
                value={searchParams.radius}
                onChange={handleInputChange}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <FaSearch />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Map and Results */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '500px' }}>
            {userLocation ? (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker position={[userLocation.lat, userLocation.lng]} />
                
                {filteredDoctors.map((doctor) => {
                  const dist = userLocation && doctor.latitude && doctor.longitude
                    ? calculateDistance(userLocation.lat, userLocation.lng, doctor.latitude, doctor.longitude)
                    : null;
                  
                  return (
                    <Marker
                      key={doctor.id}
                      position={[doctor.latitude || 6.9271, doctor.longitude || 79.8612]}
                      icon={doctorIcon}
                      eventHandlers={{
                        click: () => {
                          console.log('📤 Marker clicked:', doctor.user?.name);
                          setSelectedDoctor(doctor);
                        }
                      }}
                    >
                      {/* ✅ Simple Popup - Only Basic Info */}
                      <Popup>
                        <div className="p-1 max-w-[200px]">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            Dr. {doctor.user?.name || doctor.name}
                          </h4>
                          <p className="text-xs text-gray-500">{doctor.specialisation}</p>
                          {dist !== null && (
                            <p className="text-xs text-emerald-600">📍 {dist.toFixed(1)} km away</p>
                          )}
                          <button
                            onClick={() => setSelectedDoctor(doctor)}
                            className="mt-2 w-full text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                          >
                            View Full Profile
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                  <p>Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-4 max-h-[500px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">
                {filteredDoctors.length} Doctors Found
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaStethoscope className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No doctors found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDoctors.map((doctor) => {
                  const dist = userLocation && doctor.latitude && doctor.longitude
                    ? calculateDistance(userLocation.lat, userLocation.lng, doctor.latitude, doctor.longitude)
                    : null;
                  
                  return (
                    <div
                      key={doctor.id}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Dr. {doctor.user?.name || doctor.name}
                          </h3>
                          <p className="text-sm text-gray-600">{doctor.specialisation}</p>
                          <p className="text-sm text-gray-500">{doctor.clinicName}</p>
                          <p className="text-sm text-gray-500">{doctor.city}, {doctor.district}</p>
                        </div>
                        {dist !== null && (
                          <span className="text-xs text-emerald-600 font-medium whitespace-nowrap ml-2">
                            📍 {dist.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doctor);
                          }}
                        >
                          View Details
                        </button>
                        {doctor.latitude && doctor.longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaDirections /> Directions
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Doctor Details Modal */}
      {selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          userLocation={userLocation}
        />
      )}
    </div>
  );
};

export default DoctorSearch;