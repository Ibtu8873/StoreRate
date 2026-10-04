import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Average',
  4: 'Very Good',
  5: 'Excellent'
};

export default function StarRating({
  rating = 0,
  maxRating = 5,
  interactive = false,
  onRate = () => {},
  size = 'md',
  showLabel = false,
  showValue = false
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <div 
        className="inline-flex items-center gap-1"
        onMouseLeave={() => interactive && setHoverRating(0)}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = activeRating >= starNumber;
          const isHalf = !isFilled && activeRating >= starNumber - 0.5 && !interactive;

          return (
            <button
              type="button"
              key={starNumber}
              disabled={!interactive}
              onClick={() => interactive && onRate(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              className={`transition-transform duration-100 ${
                interactive 
                  ? 'cursor-pointer hover:scale-125 focus:outline-none focus:scale-125' 
                  : 'cursor-default pointer-events-none'
              }`}
              title={interactive ? `${starNumber} - ${RATING_LABELS[starNumber]}` : `${rating} out of ${maxRating}`}
              aria-label={interactive ? `Rate ${starNumber} stars` : `Rating: ${rating} of ${maxRating}`}
            >
              <div className="relative">
                <Star
                  className={`${starSize} ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : isHalf
                      ? 'text-amber-400 fill-amber-400/50'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="font-semibold text-slate-800 text-sm ml-1">
          {rating ? Number(rating).toFixed(1) : 'No ratings'}
        </span>
      )}

      {showLabel && activeRating > 0 && (
        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          {RATING_LABELS[Math.round(activeRating)] || ''}
        </span>
      )}
    </div>
  );
}
