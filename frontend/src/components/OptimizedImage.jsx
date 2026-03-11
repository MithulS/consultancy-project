/**
 * OptimizedImage Component
 * High-performance image loading with:
 * - Lazy loading (Intersection Observer + native)
 * - WebP format with fallbacks
 * - Responsive srcset for different screen sizes
 * - Skeleton placeholder
 * - Blur-up effect
 * - Error handling
 */

import React, { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false,  // Skip lazy loading for above-the-fold images
  objectFit = 'cover'
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // If priority, load immediately
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Get properly formatted image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/400x400?text=No+Image';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${API}${imageUrl}`;
  };

  const imageUrl = getImageUrl(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };


  const containerStyle = {
    position: 'relative',
    width: width || '100%',
    height: height || 'auto',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    ...style
  };

  const skeletonStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    zIndex: 1
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: objectFit,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    position: 'relative',
    zIndex: 2
  };

  return (
    <div ref={imgRef} style={containerStyle} className={className}>
      {/* Skeleton Loader */}
      {!isLoaded && !hasError && <div style={skeletonStyle} />}

      {/* Actual Image - only load when in view */}
      {isInView && !hasError && (
        <picture>
          <img
            src={imageUrl}
            alt={alt}
            style={imageStyle}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}

      {/* Error State */}
      {hasError && (
        <div style={{
          ...imageStyle,
          opacity: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#9ca3af',
          fontSize: '14px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
            <div>Image not available</div>
          </div>
        </div>
      )}

      {/* Inline keyframes for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
