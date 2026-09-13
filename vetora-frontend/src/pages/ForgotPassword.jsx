import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* Decorative background — matches Login / Register */}
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
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  <FaCheckCircle className="text-5xl text-primary-500 mx-auto mb-4" />
                </motion.div>
                <h1 className="text-xl font-bold text-ink-900 font-display mb-2">Check your inbox</h1>
                <p className="text-ink-500 text-sm mb-6">
                  If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a link to reset your
                  password. The link expires in 1 hour.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/login" className="btn-primary w-full">
                    Back to Login
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div variants={itemVariants} className="text-center mb-6">
                  <h1 className="text-xl font-bold text-ink-900 font-display">Forgot your password?</h1>
                  <p className="text-ink-400 text-sm mt-1">
                    No worries — enter your email and we&rsquo;ll send you a reset link
                  </p>
                </motion.div>

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

                  <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                    <button type="submit" disabled={loading} className="btn-primary w-full !rounded-full !py-3.5 !text-base mt-2">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </motion.div>
                </form>

                <motion.div variants={itemVariants}>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-1.5 text-sm text-ink-400 hover:text-ink-600 mt-5"
                  >
                    <FaArrowLeft className="text-xs" /> Back to Login
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-ink-400 mt-6">
          © 2026 VETORA. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

