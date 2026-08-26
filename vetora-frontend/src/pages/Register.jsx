import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaAddressCard, 
  FaDog, FaEye, FaEyeSlash, FaArrowRight, FaStethoscope,
  FaIdCard, FaGraduationCap, FaMapMarkerAlt, FaHospital,
  FaMapPin
} from 'react-icons/fa';
import { districts, cities } from '../utils/sriLankaData';

const Register = () => {
  const [formData, setFormData] = useState({
    // Basic Fields
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'PET_OWNER',
    
    // Doctor Specific Fields
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

  // Update cities when district changes
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
    
    // Prepare data for API
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50 py-8">
      <div className="w-full max-w-2xl animate-fadeIn">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-2xl shadow-emerald-500/30 mb-3">
            <FaDog className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Join VETORA today</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'PET_OWNER' })}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    formData.role === 'PET_OWNER'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🐕 Pet Owner
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'DOCTOR' })}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    formData.role === 'DOCTOR'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👨‍⚕️ Doctor
                </button>
              </div>
            </div>

            {/* Basic Fields */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="Min 6 characters"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <div className="relative">
                <FaAddressCard className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Doctor Specific Fields */}
            {isDoctor && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaStethoscope className="text-emerald-600" />
                  Doctor Professional Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaIdCard className="inline mr-1 text-emerald-600" />
                      SLVC Registration No.
                    </label>
                    <input
                      type="text"
                      name="slvcRegistrationNumber"
                      value={formData.slvcRegistrationNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="SLVC-2025-001"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaGraduationCap className="inline mr-1 text-emerald-600" />
                      Qualifications
                    </label>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="BVSc, MVSc, etc."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Specialisation</label>
                    <input
                      type="text"
                      name="specialisation"
                      value={formData.specialisation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="Small Animal Medicine"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="30"
                      min="0"
                    />
                  </div>
                </div>

                {/* ✅ DISTRICT DROPDOWN */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaMapMarkerAlt className="inline mr-1 text-emerald-600" />
                      District
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* ✅ CITY DROPDOWN - District එක අනුව Update වෙනවා */}
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaMapPin className="inline mr-1 text-emerald-600" />
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!formData.district}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                        formData.district ? 'bg-gray-50' : 'bg-gray-100 cursor-not-allowed'
                      }`}
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
                      <p className="text-xs text-amber-600 mt-1">
                        No cities found for this district
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaHospital className="inline mr-1 text-emerald-600" />
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="Happy Paws Clinic"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Clinic Address</label>
                    <input
                      type="text"
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="No. 25, Galle Road"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor's Phone (Optional)</label>
                  <input
                    type="text"
                    name="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="0771234567"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
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
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;