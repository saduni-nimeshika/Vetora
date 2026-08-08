import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();

  // 1. Session clear - safer than localStorage.clear()
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PET_OWNER',
    // Doctor Extra Fields
    slvcRegistrationNumber: '',
    qualifications: [],
    otherQualifications: '',
    specialisation: '',
    yearsOfExperience: '',
    clinicAddress: '',
    district: '',
    city: '',
    clinicName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const districtCityMap = {
    Colombo: ['Colombo 01-15', 'Nugegoda', 'Dehiwala', 'Maharagama', 'Kotte', 'Homagama'],
    Galle: ['Galle Fort', 'Ambalangoda', 'Hikkaduwa', 'Karapitiya', 'Elpitiya', 'Baddegama'],
    Gampaha: ['Gampaha', 'Negombo', 'Kelaniya', 'Kadawatha', 'Ja-Ela', 'Kiribathgoda'],
    Kandy: ['Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Kundasale'],
    Badulla: ['Badulla', 'Bandarawela', 'Ella', 'Diyatalawa', 'Hali-Ela'],
    Rathnapura: ['Rathnapura', 'Embilipitiya', 'Belihuloya', 'Balangoda', 'Pelmadulla'],
    Kurunegala: ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Pannala'],
    Kalutara: ['Kalutara', 'Panadura', 'Horana', 'Matugama']
  };

  // 2. Clear doctor fields when switching back to PET_OWNER
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'role' && value === 'PET_OWNER') {
      setFormData((prev) => ({
        ...prev,
        role: value,
        slvcRegistrationNumber: '',
        qualifications: [],
        otherQualifications: '',
        specialisation: '',
        yearsOfExperience: '',
        clinicAddress: '',
        district: '',
        city: '',
        clinicName: '',
      }));
    } else if (name === 'district') {
      setFormData((prev) => ({ ...prev, district: value, city: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQualificationChange = (qual) => {
    setFormData((prev) => {
      const exists = prev.qualifications.includes(qual);
      return {
        ...prev,
        qualifications: exists
          ? prev.qualifications.filter((q) => q !== qual)
          : [...prev.qualifications, qual]
      };
    });
  };

  // Password Requirements Logic
  const pass = formData.password;
  const isMinLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  const isPasswordValid = isMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setMessage({
        type: 'error',
        text: 'Please fulfill all password requirements!'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const finalQualifications = [
      ...formData.qualifications,
      formData.otherQualifications.trim()
    ].filter(Boolean).join(', ');

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      qualifications: finalQualifications
    };

    // 3. Dynamic Environment variable for API endpoint
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

    try {
      await axios.post(`${API_BASE_URL}/api/v1/users/register`, payload);

      if (formData.role === 'DOCTOR') {
        setMessage({
          type: 'success',
          text: 'Registration successful! Your account is pending Admin approval.'
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Account created successfully! Redirecting to Login...'
        });
      }

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (error) {
      // 4. Safe Axios error object parsing
      const errorMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Registration failed. Please try again.';

      setMessage({
        type: 'error',
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-4 overflow-hidden">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col justify-between max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="text-center mb-2">
          <h3 className="text-2xl font-bold text-white tracking-wide">Create Account</h3>
          <p className="text-xs text-slate-400">Join Vetora Care System</p>
        </div>

        {/* Alert Message Box */}
        {message.text && (
          <div className={`p-2.5 rounded-lg text-xs font-medium border mb-2 ${
            message.type === 'success'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Role Choice */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-blue-500/50 text-blue-400 font-medium rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="PET_OWNER" className="bg-slate-900 text-white">Pet Owner</option>
              <option value="DOCTOR" className="bg-slate-900 text-white">Veterinary Doctor</option>
            </select>
          </div>

          {/* Basic Fields Grid - 2 Columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder={formData.role === 'DOCTOR' ? 'Dr. Nimal Perera' : 'Nimal Perera'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nimal@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Password Field + Eye Icon + Checklist */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 pr-10 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Real-time Checklist */}
            <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
              <div className={`flex items-center gap-1 ${isMinLength ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                <span>{isMinLength ? '✓' : '○'}</span> At least 8 characters
              </div>
              <div className={`flex items-center gap-1 ${hasUpper ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasUpper ? '✓' : '○'}</span> Uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1 ${hasLower ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasLower ? '✓' : '○'}</span> Lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1 ${hasNumber ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasNumber ? '✓' : '○'}</span> Number (0-9)
              </div>
              <div className={`flex items-center gap-1 ${hasSpecial ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasSpecial ? '✓' : '○'}</span> Special symbol (!@#$)
              </div>
            </div>
          </div>

          {/* DOCTOR SPECIFIC DETAILS */}
          {formData.role === 'DOCTOR' && (
            <div className="border-t border-slate-800/80 pt-2 mt-2 space-y-2">
              <h4 className="text-xs font-semibold text-blue-400">Veterinary Professional Details</h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">SLVC Reg Number *</label>
                  <input
                    type="text"
                    name="slvcRegistrationNumber"
                    required={formData.role === 'DOCTOR'}
                    value={formData.slvcRegistrationNumber}
                    onChange={handleInputChange}
                    placeholder="SLVC-1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Specialisation</label>
                  <input
                    type="text"
                    name="specialisation"
                    value={formData.specialisation}
                    onChange={handleInputChange}
                    placeholder="Small Animals / Surgery"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Qualifications</label>
                <div className="flex items-center gap-4 mb-1.5 flex-wrap">
                  {['BVSc', 'MSc', 'PhD', 'DVM'].map((qual) => (
                    <label key={qual} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.qualifications.includes(qual)}
                        onChange={() => handleQualificationChange(qual)}
                        className="rounded accent-blue-600 bg-slate-950 border-slate-800"
                      />
                      {qual}
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  name="otherQualifications"
                  value={formData.otherQualifications}
                  onChange={handleInputChange}
                  placeholder="Other degrees / qualifications (e.g. Postgraduate Diploma)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Clinic Address, District & City */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Address</label>
                  <input
                    type="text"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleInputChange}
                    placeholder="Galle Road"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">Select District</option>
                    {Object.keys(districtCityMap).map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.district}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-900 text-white">Select City</option>
                    {formData.district && districtCityMap[formData.district]?.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clinic Name Field */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Clinic Name</label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  placeholder="VetCare Animal Hospital"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="text-center text-[11px] text-slate-400 mt-2">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-400 hover:underline font-semibold"
          >
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUp;