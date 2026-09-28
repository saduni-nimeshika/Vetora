import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// Read-only stars. Supports half stars (e.g. 4.5 average).
export const StarDisplay = ({ value = 0, size = 'text-base' }) => {
  // Guard against null / NaN / out-of-range values coming from the API
  const safe = Math.min(5, Math.max(0, Number(value) || 0));
  const rounded = Math.round(safe * 2) / 2;
  return (
    <div className={`flex items-center gap-0.5 ${size}`} aria-label={`${safe.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (rounded >= star) return <FaStar key={star} className="text-amber-400" />;
        if (rounded >= star - 0.5) return <FaStarHalfAlt key={star} className="text-amber-400" />;
        return <FaRegStar key={star} className="text-ink-300" />;
      })}
    </div>
  );
};

// Clickable 1-5 star picker used in the review form.
export const StarInput = ({ value, onChange, size = 'text-2xl' }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer transition-transform hover:scale-110"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          {star <= (hover || value) ? (
            <FaStar className="text-amber-400" />
          ) : (
            <FaRegStar className="text-ink-300" />
          )}
        </button>
      ))}
    </div>
  );
};

// "★★★★½ 4.5 (126 Reviews)" — or "No reviews yet" when there are none.
export const RatingLine = ({ average = 0, count = 0, size = 'text-sm' }) => {
  if (!count) return <span className="text-xs text-ink-400">No reviews yet</span>;
  return (
    <div className="flex items-center gap-1.5">
      <StarDisplay value={average} size={size} />
      <span className="text-xs font-semibold text-ink-700">{Number(average).toFixed(1)}</span>
      <span className="text-xs text-ink-400">
        ({count} {count === 1 ? 'Review' : 'Reviews'})
      </span>
    </div>
  );
};

