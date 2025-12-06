// Loading Spinner Component
import React from 'react';

export default function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      ...(fullScreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9998
      })
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: '4px solid rgba(102, 126, 234, 0.2)',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    },
    message: {
      fontSize: '18px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animation: 'pulse 2s ease-in-out infinite'
    }
  };

  return (
    <div style={styles.container} role="status" aria-live="polite">
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
