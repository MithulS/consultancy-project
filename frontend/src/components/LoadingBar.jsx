/**
 * LOADING PROGRESS BAR COMPONENT
 * Top-of-page loading indicator for page transitions and async operations
 * Features: Smooth animations, auto-hide, theme support
 */

import React, { useEffect, useState } from 'react';

const LoadingBar = ({ isLoading = false, color = 'gradient', height = 3 }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Simulate progressive loading
      const timer1 = setTimeout(() => setProgress(30), 100);
      const timer2 = setTimeout(() => setProgress(60), 500);
      const timer3 = setTimeout(() => setProgress(80), 1000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // Complete the progress bar
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }
  }, [isLoading]);

  if (!visible) return null;

  const getColor = () => {
    switch (color) {
      case 'gradient':
        return 'linear-gradient(90deg, #1e3a8a, #10b981, #3b82f6)';
      case 'primary':
        return '#1e3a8a';
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      default:
        return color;
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: `${height}px`,
      zIndex: 999999,
      pointerEvents: 'none',
    },
    bar: {
      height: '100%',
      background: getColor(),
      width: `${progress}%`,
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
    },
    glow: {
      position: 'absolute',
      top: 0,
      right: 0,
      height: '100%',
      width: '100px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6))',
      animation: 'shimmer 1.5s infinite',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bar}>
        <div style={styles.glow} />
      </div>
    </div>
  );
};

export default LoadingBar;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

if (!document.querySelector('[data-loading-bar-styles]')) {
  styleSheet.setAttribute('data-loading-bar-styles', 'true');
  document.head.appendChild(styleSheet);
}
