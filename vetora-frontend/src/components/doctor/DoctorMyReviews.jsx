import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaReply, FaTrash } from 'react-icons/fa';
import { StarDisplay } from '../owner/StarRating';
import { timeAgo, initials } from '../owner/reviewUtils';

// Doctor-side reviews panel: shows the reviews pet owners left about the
// logged-in doctor. Doctors can reply to a review but cannot change ratings.
const DoctorMyReviews = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // id of the review being replied to
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/api/v1/doctor/ratings');
      setSummary(res.data);
    } catch (error) {
      toast.error('Could not load your reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const startReply = (review) => {
    setReplyingTo(review.id);
    setReplyText(review.doctorReply || '');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const sendReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please write a reply first');
      return;
    }
    try {
      setSaving(true);
      await api.post(`/api/v1/doctor/ratings/${reviewId}/reply`, { reply: replyText.trim() });
      toast.success('Reply posted');
      cancelReply();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not post reply');
    } finally {
      setSaving(false);
    }
  };

  const removeReply = async (reviewId) => {
    if (!window.confirm('Remove your reply?')) return;
    try {
      await api.delete(`/api/v1/doctor/ratings/${reviewId}/reply`);
      toast.success('Reply removed');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not remove reply');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-elevated p-6 mt-6 flex justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-6 mt-6">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-lg font-semibold text-ink-800">Patient Reviews</h3>
        {summary.totalRatings > 0 && (
          <div className="flex items-center gap-2">
            <StarDisplay value={summary.averageRating} size="text-lg" />
            <span className="text-sm font-semibold text-ink-700">{summary.averageRating.toFixed(1)}</span>
            <span className="text-sm text-ink-400">
              ({summary.totalRatings} {summary.totalRatings === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>
        )}
      </div>

      {summary.ratings.length === 0 ? (
        <p className="text-sm text-ink-400 py-4">No reviews yet. Reviews from pet owners will show up here.</p>
      ) : (
        <div className="divide-y divide-ink-100">
          {summary.ratings.map((r) => (
            <div key={r.id} className="flex gap-3 py-4 first:pt-0">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(r.ownerName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-800">{r.ownerName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarDisplay value={r.rating} size="text-xs" />
                  <span className="text-xs text-ink-400">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-ink-600 mt-1.5 break-words">{r.comment}</p>}

                {/* Existing reply */}
                {r.doctorReply && replyingTo !== r.id && (
                  <div className="mt-2.5 bg-primary-50 border-l-2 border-primary-400 rounded-r-lg px-3 py-2">
                    <p className="text-xs font-semibold text-primary-700">
                      Your reply
                      <span className="font-normal text-ink-400"> · {timeAgo(r.doctorRepliedAt)}</span>
                    </p>
                    <p className="text-sm text-ink-600 mt-0.5 break-words">{r.doctorReply}</p>
                  </div>
                )}

                {/* Reply editor */}
                {replyingTo === r.id ? (
                  <div className="mt-2.5">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      maxLength={1000}
                      autoFocus
                      placeholder="Write a reply..."
                      className="input-field w-full resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => sendReply(r.id)}
                        disabled={saving}
                        className="btn-primary !py-1.5 !px-4 text-sm"
                      >
                        {saving ? 'Saving...' : r.doctorReply ? 'Update Reply' : 'Post Reply'}
                      </button>
                      <button type="button" onClick={cancelReply} className="btn-secondary !py-1.5 !px-4 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => startReply(r)}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1"
                    >
                      <FaReply className="text-[10px]" /> {r.doctorReply ? 'Edit reply' : 'Reply'}
                    </button>
                    {r.doctorReply && (
                      <button
                        type="button"
                        onClick={() => removeReply(r.id)}
                        className="text-ink-300 hover:text-red-500 text-xs flex items-center gap-1"
                      >
                        <FaTrash className="text-[10px]" /> Remove reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorMyReviews;
