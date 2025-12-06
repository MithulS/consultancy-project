// ProductImage Component - with fallback for missing images
import React, { useState } from 'react';

export default function ProductImage({ src, alt, style, className, onClick }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate a simple fallback SVG
  const fallbackSVG = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#f0f0f0"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="18" fill="#999">
        ${alt || 'No Image'}
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="14" fill="#ccc">
        📦
      </text>
    </svg>
  `)}`;

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const imageStyle = {
    ...style,
    display: loading ? 'none' : 'block'
  };

  const loadingStyle = {
    ...style,
    display: loading && !error ? 'block' : 'none',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  };

  // Add shimmer animation
  if (!document.querySelector('[data-image-shimmer]')) {
    const styleSheet = document.createElement('style');
    styleSheet.setAttribute('data-image-shimmer', 'true');
    styleSheet.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  return (
    <>
      {loading && !error && <div style={loadingStyle} />}
      <img
        src={error ? fallbackSVG : src}
        alt={alt}
        style={imageStyle}
        className={className}
        onClick={onClick}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
}
