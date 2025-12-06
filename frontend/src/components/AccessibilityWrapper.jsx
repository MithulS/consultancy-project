// Accessibility Helper Component
import React, { useEffect } from 'react';

export function useAccessibility() {
  useEffect(() => {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #667eea;
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
      border-radius: 0 0 4px 0;
      font-weight: 600;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    if (!document.querySelector('.skip-link')) {
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Announce page changes to screen readers
    const announcePageChange = (pageName) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Navigated to ${pageName} page`;
      announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    };

    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'login';
      const pageName = hash.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      announcePageChange(pageName);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
}

export function AccessibilityWrapper({ children }) {
  useAccessibility();
  
  return (
    <>
      {children}
      <style>{`
        /* Focus visible styles */
        *:focus-visible {
          outline: 3px solid #667eea;
          outline-offset: 2px;
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          button, input, select, textarea {
            border-width: 2px !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Improve text readability */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Ensure sufficient color contrast */
        ::selection {
          background-color: #667eea;
          color: white;
        }
      `}</style>
    </>
  );
}

export default AccessibilityWrapper;
