// LoadingOverlay.jsx - Smooth loading transition overlay
import React from 'react';

export default function LoadingOverlay({ message = 'Loading...', show = false }) {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <div style={styles.spinner}>
          <div style={styles.spinnerCircle}></div>
          <div style={styles.spinnerCircle}></div>
          <div style={styles.spinnerCircle}></div>
        </div>
        <p style={styles.message}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease'
  },
  content: {
    textAlign: 'center',
    color: 'white'
  },
  spinner: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  spinnerCircle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'white',
    animation: 'bounce 1.4s infinite ease-in-out both'
  },
  message: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '0.5px'
  }
};

// Add bounce animation
if (!document.querySelector('[data-loading-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-loading-styles', 'true');
  styleSheet.textContent = `
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    [data-loading-overlay] .spinnerCircle:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    [data-loading-overlay] .spinnerCircle:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(styleSheet);
}
