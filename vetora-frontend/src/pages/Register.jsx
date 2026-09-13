import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaAddressCard,
  FaDog, FaEye, FaEyeSlash, FaArrowRight, FaStethoscope,
  FaIdCard, FaGraduationCap, FaMapMarkerAlt, FaHospital,
  FaMapPin,
} from 'react-icons/fa';
import { districts, cities } from '../utils/sriLankaData';
import VetoraLogo from '../components/common/VetoraLogo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

const roleOptions = [
  { value: 'PET_OWNER', label: 'Pet Owner', icon: FaDog },
  { value: 'DOCTOR', label: 'Doctor', icon: FaStethoscope },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'PET_OWNER',
    slvcRegistrationNumber: '',
    qualifications: '',
    specialisation: '',
    yearsOfExperience: '',
    district: '',
    city: '',
    clinicName: '',
    clinicAddress: '',
    doctorPhone: '',
    gender: '',
    age: ''
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const isDoctor = formData.role === 'DOCTOR';

  useEffect(() => {
    if (formData.district) {
      setCityOptions(cities[formData.district] || []);
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCityOptions([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.district]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      role: formData.role,
      ...(isDoctor && {
        slvcRegistrationNumber: formData.slvcRegistrationNumber,
        qualifications: formData.qualifications,
        specialisation: formData.specialisation,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        district: formData.district,
        city: formData.city,
        clinicName: formData.clinicName,
        clinicAddress: formData.clinicAddress,
        phoneNumber: formData.doctorPhone || formData.phone,
        gender: formData.gender,
        age: parseInt(formData.age) || 0
      })
    };

    const result = await register(submitData);
    setLoading(false);
    if (result.success) navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-10 overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* Decorative background — matches Login's visual language */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50" />
      <motion.div
        animate={{ scale: [1, 1.08, 1], x: [0, 14, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        className="absolute -top-24 -left-20 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, -12, 0], y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
        className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-accent-200/30 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl px-4"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo lockup */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="flex items-center gap-2.5">
              <motion.span
                initial={{ rotate: -8, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow"
              >
                <VetoraLogo className="w-5 h-5 text-white" />
              </motion.span>
              <span className="text-2xl font-extrabold text-ink-900 font-display">VETORA</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-xl font-bold text-ink-900 font-display">Create Your Account</h1>
            <p className="text-ink-400 text-sm mt-1">Join VETORA and give your pet the care they deserve</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-elevated"
          >
            <form onSubmit={handleSubmit}>
              {/* Role selector — animated sliding pill */}
              <motion.div variants={itemVariants} className="mb-5">
                <label className="form-label">I am a</label>
                <div className="relative grid grid-cols-2 gap-2 p-1.5 bg-ink-100 rounded-2xl">
                  {roleOptions.map(({ value, label, icon: Icon }) => {
                    const active = formData.role === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: value })}
                        className={`relative z-10 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                          active ? 'text-white' : 'text-ink-600 hover:text-ink-800'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="roleActivePill"
                            className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 shadow-glow"
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          />
                        )}
                        <span className="relative flex items-center justify-center gap-2">
                          <Icon className="text-xs" /> {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-x-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrap">
                    <FaUser className="field-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field-icon"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-icon-wrap">
                    <FaEnvelope className="field-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field-icon"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-x-4">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrap">
                    <FaLock className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field-icon pr-12"
                      placeholder="Min 6 characters"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="input-icon-wrap">
                    <FaPhone className="field-icon" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field-icon"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="form-group">
                <label className="form-label">Address</label>
                <div className="input-icon-wrap">
                  <FaAddressCard className="field-icon" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field-icon"
                    placeholder="Enter your address"
                  />
                </div>
              </motion.div>

              <AnimatePresence initial={false}>
                {isDoctor && (
                  <motion.div
                    key="doctor-fields"
                    variants={expandVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="border-t border-ink-100 pt-4 mt-1 mb-1">
                      <h3 className="text-base font-bold text-ink-900 font-display mb-4 flex items-center gap-2">
                        <FaStethoscope className="text-primary-600" />
                        Doctor Professional Details
                      </h3>

                      <div className="grid md:grid-cols-2 gap-x-4">
                        <div className="form-group">
                          <label className="form-label">
                            <FaIdCard className="inline mr-1 text-primary-600" />
                            SLVC Registration No.
                          </label>
                          <input
                            type="text"
                            name="slvcRegistrationNumber"
                            value={formData.slvcRegistrationNumber}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="SLVC-2025-001"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            <FaGraduationCap className="inline mr-1 text-primary-600" />
                            Qualifications
                          </label>
                          <input
                            type="text"
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="BVSc, MVSc, etc."
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-4">
                        <div className="form-group">
                          <label className="form-label">Specialisation</label>
                          <input
                            type="text"
                            name="specialisation"
                            value={formData.specialisation}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Small Animal Medicine"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Years of Experience</label>
                          <input
                            type="number"
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="5"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-4">
                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="select-field"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="30"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-4">
                        <div className="form-group">
                          <label className="form-label">
                            <FaMapMarkerAlt className="inline mr-1 text-primary-600" />
                            District
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="select-field"
                          >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                              <option key={district.id} value={district.id}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            <FaMapPin className="inline mr-1 text-primary-600" />
                            City
                          </label>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="select-field"
                          >
                            <option value="">
                              {formData.district ? 'Select City' : 'Select District First'}
                            </option>
                            {cityOptions.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                          {formData.district && cityOptions.length === 0 && (
                            <p className="form-hint text-amber-600">
                              No cities found for this district
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-4">
                        <div className="form-group">
                          <label className="form-label">
                            <FaHospital className="inline mr-1 text-primary-600" />
                            Clinic Name
                          </label>
                          <input
                            type="text"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Happy Paws Clinic"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Clinic Address</label>
                          <input
                            type="text"
                            name="clinicAddress"
                            value={formData.clinicAddress}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="No. 25, Galle Road"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Doctor's Phone (Optional)</label>
                        <input
                          type="text"
                          name="doctorPhone"
                          value={formData.doctorPhone}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="0771234567"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} className="mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !rounded-full !py-3.5 !text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    <>
                      Create Account <FaArrowRight />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="text-center mt-5">
              <p className="text-ink-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <p className="text-center text-xs text-ink-400 mt-6">
          © 2026 VETORA. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
