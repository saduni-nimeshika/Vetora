import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // 💡 React Router Import කළා

const SignUp = () => {
  const navigate = useNavigate(); // 💡 Navigation Hook එක

  // 💡 2. Back arrow එකෙන් SignUp Page එකට ආපු ගමන් Session/Storage Clear වන කේතය
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.clear();
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

  

  // Sri Lanka Districts & Cities Data Map
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setFormData({ ...formData, district: value, city: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Qualifications Multi-select Logic
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
      formData.otherQualifications
    ].filter(Boolean).join(', ');

    const payload = {
      ...formData,
      qualifications: finalQualifications
    };

    try {
      await axios.post('http://localhost:8080/api/v1/users/register', payload);

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

      // 💡 Register වුණාට පස්සේ Auto Login Page එකට යවයි
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data || 'Registration failed. Please try again.'
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
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
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
              className="w-full bg-slate-950 border border-emerald-500/50 text-emerald-400 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="PET_OWNER">Pet Owner</option>
              <option value="DOCTOR">Veterinary Doctor</option>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Password Field + Eye Icon + Interactive Checklist */}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 pr-10 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Real-time Checklist */}
            <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
              <div className={`flex items-center gap-1 ${isMinLength ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                <span>{isMinLength ? '✓' : '○'}</span> At least 8 characters
              </div>
              <div className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasUpper ? '✓' : '○'}</span> Uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1 ${hasLower ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasLower ? '✓' : '○'}</span> Lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasNumber ? '✓' : '○'}</span> Number (0-9)
              </div>
              <div className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                <span>{hasSpecial ? '✓' : '○'}</span> Special symbol (!@#$)
              </div>
            </div>
          </div>

          {/* 🩺 DOCTOR SPECIFIC DETAILS */}
          {formData.role === 'DOCTOR' && (
            <div className="border-t border-slate-800/80 pt-2 mt-2 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400">Veterinary Professional Details</h4>

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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
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
                        className="rounded accent-emerald-500 bg-slate-950 border-slate-800"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {Object.keys(districtCityMap).map((d) => (
                      <option key={d} value={d}>{d}</option>
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
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:border-emerald-500 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select City</option>
                    {formData.district && districtCityMap[formData.district]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="text-center text-[11px] text-slate-400 mt-2">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-emerald-400 hover:underline font-semibold"
          >
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUp;