/**
 * Accessibility Skip Link Component
 * Provides keyboard navigation shortcuts
 */

import React from 'react';

export default function SkipLink() {
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: 'var(--accent-blue-primary)',
      padding: '12px',
      textAlign: 'center',
      transform: 'translateY(-100%)',
      transition: 'transform 0.3s ease'
    },
    link: {
      color: 'white',
      fontWeight: '600',
      textDecoration: 'underline',
      padding: '8px 16px',
      display: 'inline-block'
    }
  };

  return (
    <div 
      style={styles.container}
      className="skip-link-container"
      onFocus={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      onBlur={(e) => e.currentTarget.style.transform = 'translateY(-100%)'}
    >
      <a href="#main-content" style={styles.link}>
        Skip to main content
      </a>
      {' | '}
      <a href="#navigation" style={styles.link}>
        Skip to navigation
      </a>
    </div>
  );
}

// Inject CSS for focus
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .skip-link-container:focus-within {
    transform: translateY(0) !important;
  }
`;

if (!document.querySelector('[data-skip-link-styles]')) {
  styleSheet.setAttribute('data-skip-link-styles', 'true');
  document.head.appendChild(styleSheet);
}
