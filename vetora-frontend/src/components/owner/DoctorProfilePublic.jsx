import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaUserMd, FaArrowLeft, FaStethoscope, FaHospital, FaMapMarkerAlt,
  FaPhone, FaGraduationCap, FaBriefcase, FaDirections, FaCalendarCheck,
  FaRuler, FaCheckCircle, FaInfoCircle,
} from 'react-icons/fa';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DoctorProfilePublic = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, userLocation]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lon', userLocation.lng);
      }
      const res = await api.get(`/api/v1/search/doctors/${doctorId}?${params.toString()}`);
      setDoctor(res.data);
    } catch (error) {
      toast.error('Doctor not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="empty-state">
        <p className="text-ink-500">Doctor not found</p>
        <Link to="/search-doctors" className="text-primary-600 hover:underline mt-2">Back to search</Link>
      </div>
    );
  }

  const bookingUrl = `/owner/appointments/book?doctorId=${doctor.user?.id}&doctorName=${encodeURIComponent('Dr. ' + (doctor.user?.name || ''))}`;

  return (
    <div className="max-w-4xl mx-auto animate-slideUp">
      <Link to="/search-doctors" className="inline-flex items-center gap-2 text-ink-500 hover:text-ink-800 mb-4 text-sm font-medium">
        <FaArrowLeft /> Back to search
      </Link>

      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 h-28" />
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start">
            <div className="-mt-14">
              <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-elevated">
                {doctor.profileImage && doctor.profileImage !== 'default-avatar.png' ? (
                  <img src={doctor.profileImage} alt={doctor.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-primary-600 bg-primary-50">
                    <FaUserMd />
                  </div>
                )}
              </div>
            </div>
            {doctor.distanceKm != null && (
              <span className="badge-info mt-3">
                <FaRuler className="text-[10px]" /> {doctor.distanceKm} km away
                {doctor.locationApproximate && <span className="text-[10px] opacity-70">(approx.)</span>}
              </span>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-ink-900 font-display flex items-center gap-2">
              Dr. {doctor.user?.name}
              <FaCheckCircle className="text-primary-500 text-lg" title="Verified" />
            </h1>
            <p className="text-primary-600 font-medium">{doctor.specialisation || 'General Practitioner'}</p>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-primary-600" /> About
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 border-b border-ink-100">
                  <span className="text-ink-400 flex items-center gap-1.5"><FaBriefcase className="text-xs" /> Experience</span>
                  <span className="font-medium text-ink-700">{doctor.yearsOfExperience || 0} years</span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-100">
                  <span className="text-ink-400 flex items-center gap-1.5"><FaGraduationCap className="text-xs" /> Qualifications</span>
                  <span className="font-medium text-ink-700 text-right">{doctor.qualifications || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                <FaHospital className="text-primary-600" /> Clinic
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 border-b border-ink-100">
                  <span className="text-ink-400">Name</span>
                  <span className="font-medium text-ink-700 text-right">{doctor.clinicName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-ink-100">
                  <span className="text-ink-400">Location</span>
                  <span className="font-medium text-ink-700 text-right">{doctor.city}, {doctor.district}</span>
                </div>
                {doctor.phoneNumber && (
                  <div className="flex justify-between py-2 border-b border-ink-100">
                    <span className="text-ink-400 flex items-center gap-1.5"><FaPhone className="text-xs" /> Phone</span>
                    <a href={`tel:${doctor.phoneNumber}`} className="font-medium text-primary-600 hover:underline">{doctor.phoneNumber}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {doctor.clinicAddress && (
            <div className="mt-4 flex items-start gap-2 text-sm text-ink-500 bg-ink-50 rounded-xl p-3">
              <FaMapMarkerAlt className="text-primary-500 mt-0.5 shrink-0" />
              {doctor.clinicAddress}
            </div>
          )}

          {/* Mini map */}
          {doctor.latitude && doctor.longitude && (
            <div className="mt-5 rounded-xl overflow-hidden border border-ink-100">
              <div className="h-52">
                <MapContainer
                  center={[doctor.latitude, doctor.longitude]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <Marker position={[doctor.latitude, doctor.longitude]}>
                    <Popup>{doctor.clinicName || `Dr. ${doctor.user?.name}`}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              {doctor.locationApproximate && (
                <p className="text-xs text-ink-400 bg-ink-50 px-3 py-1.5 border-t border-ink-100">
                  Approximate location based on district — exact clinic pin not set by this doctor yet.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to={bookingUrl} className="btn-primary flex-1 !py-3.5">
              <FaCalendarCheck /> Book Appointment
            </Link>
            {doctor.latitude && doctor.longitude && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-secondary flex-1 !py-3.5"
              >
                <FaDirections /> Get Directions
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePublic;
