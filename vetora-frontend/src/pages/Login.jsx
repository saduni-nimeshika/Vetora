import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaEnvelope, FaLock, FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import VetoraLogo from '../components/common/VetoraLogo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const role = result.user?.role;
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/owner/dashboard');
    } else if (result.error?.toLowerCase().includes('not verified')) {
      // Surface a direct resend action instead of leaving the person stuck
      // with just a toast and no way forward.
      setNeedsVerification(true);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email above first');
      return;
    }
    setResending(true);
    try {
      await api.post(`/api/v1/auth/resend-verification?email=${encodeURIComponent(email)}`);
      toast.success('Verification email sent — please check your inbox');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* Right-side photo panel — hidden on small screens to keep mobile clean */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[58%] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1548858806-e064cf9872c0?w=1400&h=1600&fit=crop&auto=format&q=80"
          alt="Happy pet owner with her dog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent" />
      </div>

      {/* Soft background for the left/whole area */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50 lg:bg-none lg:bg-white" />
      <motion.div
        animate={{ scale: [1, 1.08, 1], x: [0, 12, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        className="hidden lg:block absolute -top-24 -left-24 w-96 h-96 bg-primary-100/60 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, -10, 0], y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
        className="lg:hidden absolute -top-24 -left-24 w-96 h-96 bg-primary-200/50 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="lg:hidden absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-primary-300/30 rounded-full blur-3xl"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4 lg:px-0 lg:ml-[8%]"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-elevated"
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
            <h1 className="text-xl font-bold text-ink-900 font-display">Welcome Back to VETORA</h1>
            <p className="text-ink-400 text-sm mt-1">Login to your account to continue</p>
          </motion.div>

          <AnimatePresence>
            {needsVerification && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm overflow-hidden"
              >
                <p className="text-amber-800 font-medium mb-2">Your email isn't verified yet.</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-amber-700 font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend verification email →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <FaEnvelope className="field-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field-icon"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="form-group">
              <div className="flex justify-between items-center mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                  Forgot?
                </Link>
              </div>
              <div className="input-icon-wrap">
                <FaLock className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field-icon pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !rounded-full !py-3.5 !text-base mt-2 flex-col !gap-0.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      Sign In <FaPaw className="text-sm opacity-80" />
                    </span>
                    <span className="text-[11px] font-normal opacity-75">Sign in to your account</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="text-center mt-5">
            <p className="text-ink-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="divider !my-5" />

          <motion.div variants={itemVariants} className="p-3 bg-ink-50 rounded-xl border border-ink-100">
            <p className="text-xs text-ink-400 text-center">
              Demo: admin@vetora.com / admin123
            </p>
          </motion.div>
        </motion.div>

        <p className="text-center text-xs text-ink-400 mt-6">
          © 2026 VETORA. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;


