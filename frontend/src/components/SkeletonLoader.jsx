/**
 * Enhanced Skeleton Loader Component
 * Provides sophisticated loading placeholders with multiple variants
 * Features: Shimmer animation, pulse effects, progress indicators
 */

import React from 'react';

export default function SkeletonLoader({ type = 'product', count = 1, variant = 'shimmer' }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  // Product card skeleton with enhanced styling
  if (type === 'product') {
    return (
      <div style={styles.productGrid}>
        {skeletons.map((_, index) => (
          <div key={index} className="skeleton-product-card" style={styles.productCard}>
            {/* Image skeleton with gradient overlay */}
            <div style={styles.skeletonImage} className={variant}>
              <div style={styles.imageOverlay} />
            </div>
            
            <div style={styles.productInfo}>
              {/* Category badge */}
              <div style={{...styles.skeletonText, width: '35%', height: '10px', marginBottom: '8px'}} className={variant} />
              
              {/* Product name (2 lines) */}
              <div style={{...styles.skeletonText, width: '90%', height: '16px', marginBottom: '6px'}} className={variant} />
              <div style={{...styles.skeletonText, width: '70%', height: '16px', marginBottom: '12px'}} className={variant} />
              
              {/* Rating stars */}
              <div style={{display: 'flex', gap: '4px', marginBottom: '12px'}}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{...styles.skeletonStar}} className={variant} />
                ))}
              </div>
              
              {/* Price */}
              <div style={{...styles.skeletonText, width: '50%', height: '24px', marginBottom: '16px'}} className={variant} />
              
              {/* Add to cart button */}
              <div style={{...styles.skeletonButton}} className={variant} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Enhanced list view skeleton
  if (type === 'list') {
    return (
      <div style={styles.listContainer}>
        {skeletons.map((_, index) => (
          <div key={index} style={styles.listItem}>
            <div style={{...styles.skeletonImage, width: '100px', height: '100px', borderRadius: '12px'}} className={variant} />
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{...styles.skeletonText, width: '70%', height: '18px'}} className={variant} />
              <div style={{...styles.skeletonText, width: '50%', height: '14px'}} className={variant} />
              <div style={{...styles.skeletonText, width: '40%', height: '14px'}} className={variant} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{...styles.skeletonText, width: '80px', height: '20px', borderRadius: '6px'}} className={variant} />
              <div style={{...styles.skeletonText, width: '80px', height: '40px', borderRadius: '8px'}} className={variant} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Category card skeleton
  if (type === 'category') {
    return (
      <div style={styles.categoryGrid}>
        {skeletons.map((_, index) => (
          <div key={index} style={styles.categoryCard} className={variant}>
            <div style={styles.categoryIcon} className={variant} />
            <div style={{...styles.skeletonText, width: '80%', height: '14px', margin: '12px auto 0'}} className={variant} />
          </div>
        ))}
      </div>
    );
  }

  // Search result skeleton
  if (type === 'search') {
    return (
      <div style={styles.searchContainer}>
        {skeletons.map((_, index) => (
          <div key={index} style={styles.searchItem}>
            <div style={{...styles.skeletonImage, width: '60px', height: '60px', borderRadius: '8px'}} className={variant} />
            <div style={{flex: 1}}>
              <div style={{...styles.skeletonText, width: '80%', height: '16px', marginBottom: '6px'}} className={variant} />
              <div style={{...styles.skeletonText, width: '40%', height: '12px'}} className={variant} />
            </div>
            <div style={{...styles.skeletonText, width: '60px', height: '14px'}} className={variant} />
          </div>
        ))}
      </div>
    );
  }

  // Hero banner skeleton
  if (type === 'hero') {
    return (
      <div style={styles.heroSkeleton} className={variant}>
        <div style={{...styles.skeletonText, width: '60%', height: '48px', margin: '0 auto 16px', borderRadius: '8px'}} className={variant} />
        <div style={{...styles.skeletonText, width: '40%', height: '20px', margin: '0 auto 32px', borderRadius: '6px'}} className={variant} />
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <div style={{...styles.skeletonButton, width: '160px'}} className={variant} />
          <div style={{...styles.skeletonButton, width: '160px'}} className={variant} />
        </div>
      </div>
    );
  }

  // Default text skeleton
  return (
    <div style={styles.textSkeleton}>
      {skeletons.map((_, index) => (
        <div key={index} style={{...styles.skeletonText, width: `${Math.random() * 40 + 60}%`}} className={variant} />
      ))}
    </div>
  );
}

const styles = {
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    width: '100%'
  },
  productCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  skeletonImage: {
    width: '100%',
    paddingTop: '100%', // 1:1 aspect ratio
    backgroundColor: '#e5e7eb',
    position: 'relative',
    overflow: 'hidden'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
  },
  productInfo: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  skeletonText: {
    height: '16px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden'
  },
  skeletonStar: {
    width: '16px',
    height: '16px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    position: 'relative',
    overflow: 'hidden'
  },
  skeletonButton: {
    height: '48px',
    backgroundColor: '#e5e7eb',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden',
    width: '100%'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%'
  },
  listItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '24px',
    width: '100%'
  },
  categoryCard: {
    backgroundColor: '#e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  categoryIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#d1d5db',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden'
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  searchItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    background: 'white',
    borderRadius: '8px'
  },
  heroSkeleton: {
    padding: '80px 24px',
    textAlign: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: '0',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  textSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px'
  }
};

// Enhanced shimmer animation CSS with multiple variants
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes wave {
    0% {
      transform: translateX(-100%);
    }
    50%, 100% {
      transform: translateX(100%);
    }
  }

  /* Shimmer variant (default) */
  .shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(
      90deg,
      #e5e7eb 0%,
      #f3f4f6 50%,
      #e5e7eb 100%
    );
    background-size: 1000px 100%;
  }

  /* Pulse variant */
  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    background: #e5e7eb;
  }

  /* Wave variant */
  .wave {
    background: #e5e7eb;
    position: relative;
    overflow: hidden;
  }

  .wave::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.8),
      transparent
    );
    animation: wave 2s infinite;
  }

  /* Loading progress indicator */
  @keyframes progress {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1e3a8a, #10b981);
    z-index: 99999;
    animation: progress 1.5s ease-in-out infinite;
  }

  /* Theme support */
  :root {
    --skeleton-base: #e5e7eb;
    --skeleton-highlight: #f3f4f6;
  }

  .dark-navy-theme .shimmer {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    background-size: 1000px 100%;
  }

  .dark-navy-theme .pulse,
  .dark-navy-theme .wave {
    background: rgba(255, 255, 255, 0.05);
  }

  /* Smooth skeleton appearance */
  .skeleton-product-card,
  .skeleton-list-item,
  .skeleton-category-card {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

if (!document.querySelector('[data-skeleton-styles]')) {
  styleSheet.setAttribute('data-skeleton-styles', 'true');
  document.head.appendChild(styleSheet);
}

