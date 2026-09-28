import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';
import { StarDisplay, StarInput } from './StarRating';
import { timeAgo, initials } from './reviewUtils';

const DoctorReviews = ({ doctorId, doctorName, summary, onChanged }) => {
  const { user } = useAuth();
  const isPetOwner = user?.role === 'PET_OWNER';

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!summary) return null;

  const handlePost = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please pick a star rating');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post(`/api/v1/owner/doctors/${doctorId}/ratings`, {
        rating,
        comment: comment.trim() || null,
      });
      toast.success(res.data.message || 'Thanks for your feedback!');
      // Clear the box so another review can be posted later
      setRating(0);
      setComment('');
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not post review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/api/v1/owner/doctors/ratings/${reviewId}`);
      toast.success('Review deleted');
      onChanged();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not delete review');
    }
  };

  return (
    <div id="reviews-section" className="mt-8 scroll-mt-24">
      <h3 className="text-lg font-semibold text-ink-800 mb-3">Patient Reviews &amp; Feedback</h3>

      {/* Post form — only pet owners with a completed appointment */}
      {isPetOwner && summary.eligibleToRate && summary.reviewsLeft > 0 && (
        <form onSubmit={handlePost} className="mb-5">
          <div className="mb-2">
            <StarInput value={rating} onChange={setRating} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Write a review..."
              className="input-field flex-1 resize-none"
            />
            <button type="submit" disabled={submitting} className="btn-primary sm:self-start !px-6">
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      )}

      {isPetOwner && !summary.eligibleToRate && (
        <p className="text-xs text-ink-500 bg-ink-50 rounded-lg p-3 mb-5">
          You can review this doctor after a completed appointment with them.
        </p>
      )}

      {isPetOwner && summary.eligibleToRate && summary.reviewsLeft <= 0 && (
        <p className="text-xs text-ink-500 bg-ink-50 rounded-lg p-3 mb-5">
          You've reached the limit of 3 reviews for this doctor. Delete an older review to post a new one.
        </p>
      )}

      {/* Review list — visible to every logged-in user */}
      {summary.ratings.length === 0 ? (
        <p className="text-sm text-ink-400 py-4">No reviews yet.</p>
      ) : (
        <div className="divide-y divide-ink-100">
          {summary.ratings.map((r) => (
            <div key={r.id} className="flex gap-3 py-4 first:pt-0">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(r.ownerName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-800">
                    {r.ownerName} {r.mine && <span className="text-primary-500 text-xs font-medium">(You)</span>}
                  </p>
                  {r.mine && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="text-ink-300 hover:text-red-500 text-xs flex items-center gap-1 shrink-0"
                      title="Delete my review"
                    >
                      <FaTrash className="text-[10px]" /> Delete
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarDisplay value={r.rating} size="text-xs" />
                  <span className="text-xs text-ink-400">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-ink-600 mt-1.5 break-words">{r.comment}</p>}

                {/* Doctor's reply */}
                {r.doctorReply && (
                  <div className="mt-2.5 bg-primary-50 border-l-2 border-primary-400 rounded-r-lg px-3 py-2">
                    <p className="text-xs font-semibold text-primary-700">
                      Reply from {doctorName}
                      <span className="font-normal text-ink-400"> · {timeAgo(r.doctorRepliedAt)}</span>
                    </p>
                    <p className="text-sm text-ink-600 mt-0.5 break-words">{r.doctorReply}</p>
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

export default DoctorReviews;



