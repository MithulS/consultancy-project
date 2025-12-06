// Toast Notification Component
import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      icon: '✓'
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: '✕'
    },
    warning: {
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      icon: '⚠'
    },
    info: {
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      icon: 'ℹ'
    }
  };

  const config = types[type] || types.success;

  const styles = {
    toast: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: config.bg,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '500px',
      animation: 'slideInRight 0.3s ease-out, fadeOut 0.3s ease-in ' + (duration - 300) + 'ms',
      zIndex: 9999,
      fontWeight: '500',
      fontSize: '14px'
    },
    icon: {
      fontSize: '20px',
      fontWeight: 'bold'
    },
    message: {
      flex: 1
    },
    closeBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontWeight: 'bold'
    }
  };

  // Add keyframes
  if (!document.querySelector('[data-toast-styles]')) {
    const styleSheet = document.createElement('style');
    styleSheet.setAttribute('data-toast-styles', 'true');
    styleSheet.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        to { opacity: 0; transform: translateX(400px); }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  return (
    <div style={styles.toast}>
      <span style={styles.icon}>{config.icon}</span>
      <span style={styles.message}>{message}</span>
      <button 
        style={styles.closeBtn} 
        onClick={onClose}
        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
        onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
      >
        ×
      </button>
    </div>
  );
}
