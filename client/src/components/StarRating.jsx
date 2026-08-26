import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onRatingChange, readOnly = false, size = 20 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const descriptions = {
    1: 'Poor resolution / Unresolved',
    2: 'Fair / Took too long',
    3: 'Good / Satisfactory',
    4: 'Very Good / Quick & helpful',
    5: 'Excellent / Outstanding service'
  };

  const current = hoverRating || rating;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= current;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: readOnly ? 'default' : 'pointer',
                color: filled ? '#f59e0b' : 'var(--text-muted)',
                transition: 'transform 0.15s ease, color 0.15s ease',
                transform: !readOnly && hoverRating === star ? 'scale(1.2)' : 'scale(1)'
              }}
              title={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star size={size} fill={filled ? '#f59e0b' : 'none'} strokeWidth={1.75} />
            </button>
          );
        })}
        {rating > 0 && (
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '6px' }}>
            {rating}.0 / 5
          </span>
        )}
      </div>
      {!readOnly && current > 0 && (
        <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
          {descriptions[current]}
        </span>
      )}
    </div>
  );
}
