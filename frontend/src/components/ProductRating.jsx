/**
 * Product Rating Component
 * Displays star ratings with optional review count
 */

import React from 'react';

export default function ProductRating({ 
  rating = 0, 
  maxRating = 5, 
  reviewCount = 0, 
  size = 'medium',
  showCount = true,
  interactive = false,
  onRatingChange = null
}) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeMap = {
    small: { star: 14, fontSize: '12px', gap: '2px' },
    medium: { star: 18, fontSize: '14px', gap: '4px' },
    large: { star: 24, fontSize: '16px', gap: '6px' }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;
    const fillPercentage = Math.min(Math.max(displayRating - index, 0), 1) * 100;

    return (
      <div
        key={index}
        style={{
          ...styles.starContainer,
          cursor: interactive ? 'pointer' : 'default'
        }}
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => interactive && setHoverRating(starValue)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        <svg
          width={dimensions.star}
          height={dimensions.star}
          viewBox="0 0 24 24"
          style={styles.star}
        >
          <defs>
            <linearGradient id={`star-gradient-${index}`}>
              <stop offset={`${fillPercentage}%`} stopColor="var(--color-rating-filled, #fbbf24)" />
              <stop offset={`${fillPercentage}%`} stopColor="var(--color-rating-empty, #d1d5db)" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#star-gradient-${index})`}
            stroke="var(--color-rating-stroke, #d97706)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.starsContainer, gap: dimensions.gap}}>
        {[...Array(maxRating)].map((_, index) => renderStar(index))}
      </div>
      {showCount && reviewCount > 0 && (
        <span style={{...styles.reviewCount, fontSize: dimensions.fontSize}}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
      {showCount && rating > 0 && (
        <span style={{...styles.ratingValue, fontSize: dimensions.fontSize}}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  starsContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  starContainer: {
    display: 'inline-flex',
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  star: {
    display: 'block',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
  },
  reviewCount: {
    color: 'var(--text-tertiary, #6b7280)',
    fontWeight: 500
  },
  ratingValue: {
    color: 'var(--text-secondary, #4b5563)',
    fontWeight: 600
  }
};

// Add hover effect CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  [role="button"].starContainer:hover {
    transform: scale(1.15);
  }

  :root {
    --color-rating-filled: #fbbf24;
    --color-rating-empty: #d1d5db;
    --color-rating-stroke: #d97706;
  }

  .dark-navy-theme {
    --color-rating-filled: #fbbf24;
    --color-rating-empty: rgba(255, 255, 255, 0.1);
    --color-rating-stroke: #f59e0b;
  }
`;

if (!document.querySelector('[data-rating-styles]')) {
  styleSheet.setAttribute('data-rating-styles', 'true');
  document.head.appendChild(styleSheet);
}
