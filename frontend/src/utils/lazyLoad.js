// Lazy loading utility for images
import { useEffect, useRef, useState } from 'react';

/**
 * LazyImage Component - Loads images only when visible
 * Uses Intersection Observer API for efficient loading
 */
export function LazyImage({ src, alt, style, className, placeholder = '' }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    let observer;
    
    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Load image when it enters viewport
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setImageSrc(src);
                setIsLoading(false);
              };
              img.onerror = () => {
                setIsLoading(false);
                setImageSrc('https://via.placeholder.com/300x300?text=Image+Not+Found');
              };
              
              // Stop observing once loaded
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before entering viewport
          threshold: 0.01
        }
      );

      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      style={{
        ...style,
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity 0.3s ease',
        backgroundColor: '#f3f4f6'
      }}
      className={className}
      loading="lazy" // Native lazy loading as fallback
    />
  );
}

/**
 * useLazyLoad Hook - Generic lazy loading for any element
 */
export function useLazyLoad(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.disconnect();
          }
        } else if (!options.once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin: options.rootMargin || '0px',
        threshold: options.threshold || 0.1
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return [elementRef, isVisible];
}

/**
 * Preload critical images
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(urls) {
  const promises = urls.map(url => preloadImage(url));
  return Promise.all(promises);
}

export default LazyImage;
