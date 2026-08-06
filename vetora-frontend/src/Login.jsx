import React, { useState, useEffect } from 'react'; // 💡 1. React එකෙන් useEffect Import කරගත්තා
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // 💡 React Router Import කරගත්තා

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate(); // 💡 Page navigate කිරීම සඳහා Hook එක

  // 💡 2. Back arrow එකෙන් Login Page එකට ආපු ගමන් Auto-Logout වන කේතය
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.clear();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Spring Boot backend call
      const response = await axios.post('http://localhost:8080/api/v1/users/login', formData);
      
      setMessage({ type: 'success', text: 'Welcome back! Login successful.' });
      
      // User දත්ත LocalStorage එකේ save කිරීම
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));

      // 💡 User Role එක අනුව අදාළ Dashboard එකට Navigate කිරීම
      setTimeout(() => {
        if (userData.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }, 800);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data || 'Invalid email or password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 font-sans">
      
      {/* Left Side: Visual Hero Banner with High Quality Veterinary Image */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-cover bg-center"
           style={{
             backgroundImage: `url('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=1600&auto=format&fit=crop')`
           }}>
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-emerald-950/40" />

        {/* Brand Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full w-full">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 text-emerald-400 shadow-lg">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6 3 3 0 000 6zm-5-1a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-white">VETORA</h1>
              <p className="text-xs text-emerald-400 font-medium tracking-wider">VETERINARY CARE SYSTEM</p>
            </div>
          </div>

          {/* Hero Quote */}
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md text-emerald-300 text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Trusted Professional Care
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Compassionate Pet Care Management, Simplified.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Streamline appointments, health records, and patient history with our intelligent veterinary management system.
            </p>
          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400">© 2026 Vetora Systems. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Modern Glassmorphic Form Area */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-slate-900 relative">
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/60 shadow-2xl space-y-6">
          
          {/* Mobile Logo View */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
            <span className="text-2xl font-bold text-white tracking-wide">VETORA</span>
          </div>

          {/* Form Header */}
          <div className="text-left space-y-1">
            <h3 className="text-2xl font-bold text-white">Log In</h3>
            <p className="text-sm text-slate-400">Enter your credentials to access your portal</p>
          </div>

          {/* Alert Box */}
          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-medium border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@vetora.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <a href="#" className="text-xs text-emerald-400 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                {/* Lock Icon */}
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                {/* Password Input */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />

                {/* Eye Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Log In'}
              {!loading && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>

          {/* Sign Up Navigation Link */}
          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;