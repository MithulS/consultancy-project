import React, { useState } from 'react';

const ImageWithPlaceholder = ({ 
  src, 
  alt, 
  className = '', 
  style = {},
  width,
  height 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  return (
    <div 
      className={`image-container ${className}`}
      style={{ 
        position: 'relative', 
        width: width || '100%', 
        height: height || 'auto',
        ...style 
      }}
    >
      {/* Skeleton Loader */}
      {!loaded && (
        <div className="skeleton-loader" />
      )}
      
      {/* Actual Image */}
      {!error ? (
        <img 
          src={src} 
          alt={alt}
          className={`progressive-image ${loaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      ) : (
        <div className="image-error">
          <span>📷</span>
          <p>Image not available</p>
        </div>
      )}

      <style>{`
        .image-container {
          overflow: hidden;
          background: #f3f4f6;
        }

        .skeleton-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .progressive-image {
          display: block;
        }

        .progressive-image.loaded {
          opacity: 1;
        }

        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #f9fafb;
          color: #9ca3af;
        }

        .image-error span {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .image-error p {
          margin: 0;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default ImageWithPlaceholder;
