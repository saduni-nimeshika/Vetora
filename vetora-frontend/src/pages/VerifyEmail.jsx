import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaCheckCircle, FaTimesCircle, FaPaw, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  // ✅ Fix: React.StrictMode (main.jsx) intentionally double-invokes effects
  // in development, so this effect used to call verify() twice for the same
  // token. The first call correctly verifies the account and marks the
  // token as used; the second call then hits "already used" and its error
  // response overwrote the successful state — showing "Verification Failed"
  // even though the account was, in fact, verified. This ref makes sure the
  // token is only ever submitted once per link, no matter how many times
  // the effect body runs.
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in this link.');
      return;
    }
    if (verifiedRef.current) return;
    verifiedRef.current = true;
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verify = async () => {
    try {
      const res = await api.get(`/api/v1/users/verify-email?token=${encodeURIComponent(token)}`);
      setStatus('success');
      setMessage(res.data?.message || 'Email verified successfully!');
    } catch (err) {
      setStatus('error');
      // ✅ Fix: the backend puts its message under `message` (see
      // AuthController), not `error` — reading `.error` always came back
      // undefined here, so the real reason (e.g. "already used"/"expired")
      // never reached the user and they always saw the generic fallback.
      setMessage(err.response?.data?.message || err.response?.data?.error || 'This verification link is invalid or has expired.');
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    try {
      await api.post(`/api/v1/auth/resend-verification?email=${encodeURIComponent(resendEmail)}`);
      toast.success('Verification email resent — please check your inbox');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center -m-4 sm:-m-6 lg:-m-8">
      <div className="w-full max-w-md px-4 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 shadow-elevated text-center">
          <div className="flex justify-center mb-6">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <FaPaw className="text-white text-2xl" />
            </span>
          </div>

          {status === 'loading' && (
            <>
              <div className="spinner w-10 h-10 mx-auto mb-4" />
              <p className="text-ink-500">Verifying your email...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-ink-900 font-display mb-2">Email Verified!</h1>
              <p className="text-ink-500 text-sm mb-6">{message}</p>
              <Link to="/login" className="btn-primary w-full">
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <FaTimesCircle className="text-5xl text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-ink-900 font-display mb-2">Verification Failed</h1>
              <p className="text-ink-500 text-sm mb-6">{message}</p>

              <form onSubmit={handleResend} className="text-left">
                <label className="form-label">Resend verification email</label>
                <div className="input-icon-wrap mb-3">
                  <FaEnvelope className="field-icon" />
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="input-field-icon"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button type="submit" disabled={resending} className="btn-primary w-full">
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>

              <Link to="/login" className="block text-sm text-ink-400 hover:text-ink-600 mt-4">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

