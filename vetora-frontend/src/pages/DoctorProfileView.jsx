import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaUserMd, FaHospital, FaMapMarkerAlt,
  FaArrowLeft,
  FaEdit, FaGraduationCap,
  FaMapPin, FaInfoCircle,
  FaCheckCircle, FaCamera, FaSave, FaTimes, FaCrosshairs
} from 'react-icons/fa';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Sri Lanka's rough geographic center — used as the map's default view
// until the doctor has a location set or picks one.
const SRI_LANKA_CENTER = [7.8731, 80.7718];

// Listens for clicks on the map and reports the picked coordinates up
const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DoctorProfileView = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [locating, setLocating] = useState(false);

  // Photo upload
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePickLocation = (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location access is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
        toast.success('Location captured — don\'t forget to save');
      },
      () => {
        setLocating(false);
        toast.error('Could not get your location. Try clicking the map instead.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      let profileImage = formData.profileImage;
      if (imageFile) {
        const reader = new FileReader();
        profileImage = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }

      const payload = { ...formData, profileImage };
      await api.put('/api/v1/doctor/profile', payload);

      setDoctor(payload);
      setFormData(payload);
      updateUser({ profileImage });
      setImageFile(null);
      setImagePreview(null);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
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
      <div className="text-center py-12">
        <p className="text-ink-500">Profile not found</p>
      </div>
    );
  }

  const displayImage = imagePreview || formData.profileImage || doctor.profileImage;
  const hasRealImage = displayImage && displayImage !== 'default-avatar.png';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
      <motion.div variants={itemVariants} className="page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="btn-icon"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-extrabold text-ink-900 font-display">My Profile</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEditToggle}
          className={editing ? 'btn-danger' : 'btn-primary'}
        >
          {editing ? <FaTimes /> : <FaEdit />}
          {editing ? 'Cancel' : 'Edit Profile'}
        </motion.button>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-elevated overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-32 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start">
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-elevated">
                {hasRealImage ? (
                  <img src={displayImage} alt={doctor.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-primary-600 bg-primary-50">
                    <FaUserMd />
                  </div>
                )}
              </div>
              {editing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-glow"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change photo"
                  >
                    <FaCamera size={14} />
                  </motion.button>
                </>
              )}
            </div>
            <div className="mt-4">
              <span className="badge-success">
                <FaCheckCircle className="text-[10px]" /> Active
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-ink-900 font-display">
              Dr. {doctor.user?.name || doctor.name}
            </h2>
            <p className="text-primary-600 font-medium">{doctor.specialisation || 'General Practitioner'}</p>
            <p className="text-sm text-ink-400 mt-1">{doctor.user?.email}</p>
          </div>

          <AnimatePresence mode="wait">
            {!editing ? (
              /* ===== Read Mode ===== */
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-6 grid md:grid-cols-2 gap-6"
              >
                <div>
                  <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-primary-600" /> About
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Specialisation</span>
                      <span className="font-medium text-ink-800">{doctor.specialisation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Experience</span>
                      <span className="font-medium text-ink-800">{doctor.yearsOfExperience || 0} years</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Qualifications</span>
                      <span className="font-medium text-ink-800">{doctor.qualifications || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">SLVC Registration</span>
                      <span className="font-medium text-ink-800">{doctor.slvcRegistrationNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                    <FaHospital className="text-primary-600" /> Clinic Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Clinic Name</span>
                      <span className="font-medium text-ink-800">{doctor.clinicName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Location</span>
                      <span className="font-medium text-ink-800">{doctor.city}, {doctor.district}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Address</span>
                      <span className="font-medium text-ink-800">{doctor.clinicAddress || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Phone</span>
                      <span className="font-medium text-ink-800">{doctor.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-ink-100">
                      <span className="text-ink-400">Map Pin</span>
                      <span className={`font-medium flex items-center gap-1 ${doctor.latitude && doctor.longitude ? 'text-primary-600' : 'text-amber-600'}`}>
                        <FaMapPin className="text-xs" />
                        {doctor.latitude && doctor.longitude ? 'Exact location set' : 'Not set (showing district only)'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ===== Edit Mode ===== */
              <motion.form
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="mt-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Specialisation</label>
                    <input
                      type="text"
                      name="specialisation"
                      value={formData.specialisation || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience || 0}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">
                      <FaGraduationCap className="inline mr-1 text-primary-600" />
                      Qualifications
                    </label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">SLVC Registration</label>
                    <input
                      type="text"
                      name="slvcRegistrationNumber"
                      value={formData.slvcRegistrationNumber || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Clinic Name</label>
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.clinicName || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Clinic Address</label>
                    <input
                      type="text"
                      name="clinicAddress"
                      value={formData.clinicAddress || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Clinic Location Map Picker */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label mb-0">
                      <FaMapPin className="inline mr-1 text-primary-600" />
                      Clinic Location on Map
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <FaCrosshairs />
                      {locating ? 'Locating...' : 'Use my current location'}
                    </button>
                  </div>
                  <p className="text-xs text-ink-400 mb-2">
                    Click anywhere on the map to drop a pin at your clinic's exact location. Pet owners searching nearby will see this instead of an approximate district center.
                  </p>
                  <div className="rounded-xl overflow-hidden border border-ink-200" style={{ height: '260px' }}>
                    <MapContainer
                      center={
                        formData.latitude && formData.longitude
                          ? [formData.latitude, formData.longitude]
                          : SRI_LANKA_CENTER
                      }
                      zoom={formData.latitude && formData.longitude ? 15 : 8}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <LocationPicker onPick={handlePickLocation} />
                      {formData.latitude && formData.longitude && (
                        <Marker position={[formData.latitude, formData.longitude]} />
                      )}
                    </MapContainer>
                  </div>
                  {formData.latitude && formData.longitude ? (
                    <p className="text-xs text-primary-600 mt-2 flex items-center gap-1">
                      <FaCheckCircle /> Pin set at {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-2">No pin set yet — click the map above</p>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorProfileView;

