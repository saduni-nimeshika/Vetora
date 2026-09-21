import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaStethoscope, FaDirections, FaUserMd, FaRuler, FaFilter, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { districts as slDistricts } from '../utils/sriLankaData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const doctorIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const LocationMarker = ({ position }) => {
  return position ? (
    <Marker position={position}>
      <Popup>📍 Your Location</Popup>
    </Marker>
  ) : null;
};

// Once search results come back, zoom/pan the map so every result pin is
// actually visible — otherwise the map stays centered on the user's own
// location and distant results (e.g. a different district) never appear
// in the viewport even though they're in the results list.
const FitBoundsToResults = ({ userLocation, doctors }) => {
  const map = useMap();
  useEffect(() => {
    const points = doctors.filter((d) => d.latitude && d.longitude).map((d) => [d.latitude, d.longitude]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.flyTo(points[0], 12);
    } else {
      map.flyToBounds(points, { padding: [50, 50], maxZoom: 13 });
    }
  }, [doctors, userLocation, map]);
  return null;
};

const specialisations = [
  'Small Animal Medicine', 'Large Animal Medicine', 'Surgery',
  'Dermatology', 'Cardiology', 'Neurology', 'Orthopedics',
  'Ophthalmology', 'Dentistry', 'Nutrition', 'Emergency Medicine',
];

const DoctorSearch = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchParams, setSearchParams] = useState({
    district: '', city: '', specialisation: '', radius: 15,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 6.9271, lng: 79.8612 })
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
      setDoctors(response.data?.doctors || []);
    } catch (err) {
      console.error('Error searching doctors:', err);
      setError('Failed to search doctors. Please try again.');
      toast.error('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) searchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchDoctors();
  };

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setSearchParams({ district: '', city: '', specialisation: '', radius: 15 });
  };

  const activeFilterCount = ['district', 'city', 'specialisation'].filter((k) => searchParams[k]).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <h1 className="page-title">
            <FaMapMarkerAlt className="text-primary-600" /> Find a Vet Near You
          </h1>
          <p className="page-subtitle">Search by location, and book directly from a doctor's profile</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters((s) => !s)}
          className="btn-secondary lg:hidden"
        >
          <FaFilter /> Filters {activeFilterCount > 0 && <span className="badge-neutral">{activeFilterCount}</span>}
        </motion.button>
      </motion.div>

      {/* Search Filters */}
      <motion.div variants={itemVariants} className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="form-group mb-0">
              <label className="form-label">District</label>
              <select name="district" value={searchParams.district} onChange={handleInputChange} className="select-field">
                <option value="">All Districts</option>
                {slDistricts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">City</label>
              <input
                type="text" name="city" value={searchParams.city} onChange={handleInputChange}
                placeholder="Any city" className="input-field"
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Specialisation</label>
              <select name="specialisation" value={searchParams.specialisation} onChange={handleInputChange} className="select-field">
                <option value="">All Specialisations</option>
                {specialisations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Radius: {searchParams.radius} km</label>
              <input
                type="range" name="radius" min="1" max="50" value={searchParams.radius}
                onChange={handleInputChange}
                disabled={!!(searchParams.district || searchParams.city)}
                className="w-full accent-primary-600 h-2.5 disabled:opacity-40"
              />
              {(searchParams.district || searchParams.city) && (
                <p className="text-[11px] text-ink-400 mt-1">Ignored while a District/City is picked</p>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} type="submit" className="btn-primary flex-1">
                <FaSearch /> Search
              </motion.button>
              {activeFilterCount > 0 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={clearFilters}
                  className="btn-icon border border-ink-200"
                  title="Clear filters"
                >
                  <FaTimes />
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </motion.div>

      {/* Map and Results */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl shadow-card overflow-hidden border border-ink-100" style={{ height: '520px' }}>
            {userLocation ? (
              <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker position={[userLocation.lat, userLocation.lng]} />
                <FitBoundsToResults userLocation={userLocation} doctors={doctors} />
                {doctors.filter((d) => d.latitude && d.longitude).map((doctor) => (
                  <Marker
                    key={doctor.id}
                    position={[doctor.latitude, doctor.longitude]}
                    icon={doctorIcon}
                    eventHandlers={{ click: () => setSelectedDoctor(doctor) }}
                  >
                    <Popup>
                      <div className="p-1 max-w-[200px]">
                        <h4 className="font-semibold text-ink-800 text-sm">Dr. {doctor.user?.name}</h4>
                        <p className="text-xs text-ink-500">{doctor.specialisation}</p>
                        {doctor.distanceKm != null && (
                          <p className="text-xs text-primary-600">📍 {doctor.distanceKm} km away</p>
                        )}
                        <Link
                          to={`/owner/doctors/${doctor.id}`}
                          className="mt-2 block w-full text-center text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition"
                        >
                          View Profile
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-ink-500">
                <div className="text-center">
                  <div className="spinner w-8 h-8 mx-auto mb-2" />
                  <p>Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div>
          <div className="card !p-4 max-h-[520px] overflow-y-auto">
            <h2 className="font-semibold text-ink-800 mb-4 px-1">
              {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
            </h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="spinner w-8 h-8 mx-auto" />
                <p className="text-ink-400 mt-2 text-sm">Searching...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500 text-sm">{error}</div>
            ) : doctors.length === 0 ? (
              <div className="empty-state !py-10">
                <FaStethoscope className="text-3xl text-ink-300 mb-2" />
                <p className="text-ink-500 font-medium text-sm">No doctors found</p>
                <p className="text-ink-400 text-xs mt-1">Try a larger radius or different filters</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                <AnimatePresence>
                  {doctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      variants={itemVariants}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ x: 3 }}
                      layout
                      className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-ink-100 hover:border-primary-200 hover:bg-ink-50'
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="avatar w-10 h-10 bg-primary-100 text-primary-700 shrink-0 overflow-hidden">
                            {doctor.profileImage && doctor.profileImage !== 'default-avatar.png' ? (
                              <img src={doctor.profileImage} alt={doctor.user?.name} className="w-full h-full object-cover" />
                            ) : (
                              <FaUserMd />
                            )}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-ink-800 truncate">Dr. {doctor.user?.name}</h3>
                            <p className="text-sm text-ink-500 truncate">{doctor.specialisation || 'General Practitioner'}</p>
                            <p className="text-xs text-ink-400 truncate">{doctor.clinicName || `${doctor.city || ''}${doctor.city && doctor.district ? ', ' : ''}${doctor.district || ''}`}</p>
                          </div>
                        </div>
                        {doctor.distanceKm != null && (
                          <span className="badge-info shrink-0 whitespace-nowrap">
                            <FaRuler className="text-[9px]" /> {doctor.distanceKm} km
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 flex gap-3 pl-[52px]">
                        <Link
                          to={`/owner/doctors/${doctor.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-primary-600 hover:underline font-medium"
                        >
                          View Profile
                        </Link>
                        {doctor.latitude && doctor.longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-ink-500 hover:text-ink-700 font-medium flex items-center gap-1"
                          >
                            <FaDirections /> Directions
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorSearch;




