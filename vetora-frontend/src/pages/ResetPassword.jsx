import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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

const AuthShell = ({ children }) => (
  <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden -m-4 sm:-m-6 lg:-m-8">
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50" />
    <motion.div
      animate={{ scale: [1, 1.08, 1], x: [0, 12, 0], y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl"
    />
    <motion.div
      animate={{ scale: [1, 1.1, 1], x: [0, -10, 0], y: [0, 12, 0] }}
      transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
      className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-accent-200/30 rounded-full blur-3xl"
    />
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-10 w-full max-w-md px-4"
    >
      {children}
      <p className="text-center text-xs text-ink-400 mt-6">
        © 2026 VETORA. All rights reserved.
      </p>
    </motion.div>
  </div>
);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/auth/reset-password', { token, newPassword: password });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-elevated text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
            <FaTimesCircle className="text-5xl text-red-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-xl font-bold text-ink-900 font-display mb-2">Invalid Link</h1>
          <p className="text-ink-500 text-sm mb-6">This reset link is missing or malformed. Request a fresh one below.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/forgot-password" className="btn-primary w-full">Request a new link</Link>
          </motion.div>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-elevated"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <motion.span
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow"
          >
            <VetoraLogo className="w-6 h-6 text-white" />
          </motion.span>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
                <FaCheckCircle className="text-5xl text-primary-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-xl font-bold text-ink-900 font-display mb-2">Password Reset!</h1>
              <p className="text-ink-500 text-sm mb-6">You can now log in with your new password.</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button onClick={() => navigate('/login')} className="btn-primary w-full">
                  Go to Login
                </button>
              </motion.div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
                <FaTimesCircle className="text-5xl text-red-400 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-xl font-bold text-ink-900 font-display mb-2">Reset Failed</h1>
              <p className="text-ink-500 text-sm mb-6">{errorMsg}</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/forgot-password" className="btn-primary w-full">Request a new link</Link>
              </motion.div>
            </motion.div>
          )}

          {status === null && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h1 className="text-xl font-bold text-ink-900 font-display">Choose a new password</h1>
                <p className="text-ink-400 text-sm mt-1">Make it at least 6 characters — something you&rsquo;ll remember</p>
              </motion.div>

              <form onSubmit={handleSubmit}>
                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrap">
                    <FaLock className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field-icon pr-12"
                      placeholder="Enter new password"
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

                <motion.div variants={itemVariants} className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-icon-wrap">
                    <FaLock className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field-icon"
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                  <button type="submit" disabled={loading} className="btn-primary w-full !rounded-full !py-3.5 !text-base mt-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthShell>
  );
};

export default ResetPassword;
