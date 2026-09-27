import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar, FaUserCircle, FaTrash, FaEdit } from 'react-icons/fa';

// Simple 1-5 star picker. `value` is the selected rating, `onChange` fires
// with the clicked star number. Read-only when `onChange` isn't passed.
const StarPicker = ({ value, onChange, size = 'text-xl' }) => {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  return (
    <div className={`flex gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            {filled ? (
              <FaStar className="text-amber-400" />
            ) : (
              <FaRegStar className="text-ink-300" />
            )}
          </button>
        );
      })}
    </div>
  );
};

const DoctorRatings = ({ doctorId }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPetOwner = user?.role === 'PET_OWNER';

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/doctors/${doctorId}/ratings`);
      setSummary(res.data);
      if (res.data.myRating) {
        setFormRating(res.data.myRating.rating);
        setFormComment(res.data.myRating.comment || '');
      }
    } catch (error) {
      toast.error('Could not load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formRating < 1) {
      toast.error('Please pick a star rating');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post(`/api/v1/owner/doctors/${doctorId}/ratings`, {
        rating: formRating,
        comment: formComment.trim() || null,
      });
      toast.success(res.data.message || 'Thanks for your feedback!');
      setFormOpen(false);
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove your rating for this doctor?')) return;
    try {
      await api.delete(`/api/v1/owner/doctors/${doctorId}/ratings`);
      toast.success('Rating removed');
      setFormRating(0);
      setFormComment('');
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not remove rating');
    }
  };

  if (loading) {
    return (
      <div className="card-glass rounded-2xl p-6 mt-6 flex justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="card-glass rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-700 mb-1">Patient Ratings</h3>
          <div className="flex items-center gap-2">
            <StarPicker value={Math.round(summary.averageRating)} size="text-lg" />
            <span className="text-ink-900 font-bold">{summary.averageRating.toFixed(1)}</span>
            <span className="text-ink-400 text-sm">
              ({summary.totalRatings} {summary.totalRatings === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {isPetOwner && summary.eligibleToRate && !formOpen && (
          <button onClick={() => setFormOpen(true)} className="btn-secondary !py-2 !px-4 text-sm">
            <FaEdit className="text-xs" /> {summary.myRating ? 'Edit your rating' : 'Rate this doctor'}
          </button>
        )}
      </div>

      {isPetOwner && !summary.eligibleToRate && !summary.myRating && (
        <p className="text-xs text-ink-400 mt-3 bg-ink-50 rounded-lg p-2.5">
          You can rate this doctor after a completed appointment with them.
        </p>
      )}

      {isPetOwner && formOpen && (
        <form onSubmit={handleSubmit} className="mt-4 border border-ink-100 rounded-xl p-4 bg-ink-50/50">
          <label className="text-xs font-medium text-ink-500 mb-1.5 block">Your rating</label>
          <StarPicker value={formRating} onChange={setFormRating} />
          <label className="text-xs font-medium text-ink-500 mt-3 mb-1.5 block">
            Comment <span className="text-ink-300">(optional)</span>
          </label>
          <textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share your experience..."
            className="input-field w-full resize-none"
          />
          <div className="flex items-center gap-2 mt-3">
            <button type="submit" disabled={submitting} className="btn-primary !py-2 !px-4 text-sm">
              {submitting ? 'Saving...' : summary.myRating ? 'Update rating' : 'Submit rating'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Cancel
            </button>
            {summary.myRating && (
              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
              >
                <FaTrash className="text-xs" /> Remove
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-5 divide-y divide-ink-100">
        {summary.ratings.length === 0 ? (
          <p className="text-sm text-ink-400 py-4 text-center">No reviews yet.</p>
        ) : (
          summary.ratings.map((r) => (
            <div key={r.id} className="py-3.5 first:pt-0">
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-ink-300 text-lg shrink-0" />
                <span className="text-sm font-medium text-ink-700">
                  {r.ownerName} {r.mine && <span className="text-primary-500 text-xs">(You)</span>}
                </span>
              </div>
              <div className="ml-6 mt-1">
                <StarPicker value={r.rating} size="text-xs" />
              </div>
              {r.comment && <p className="text-sm text-ink-500 mt-1.5 ml-6">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorRatings;

