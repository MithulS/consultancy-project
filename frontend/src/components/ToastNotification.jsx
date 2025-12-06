// Toast Notification System for User Feedback
import React, { useState, useEffect } from 'react';

let toastQueue = [];
let showToastCallback = null;

export function showToast(message, type = 'info', duration = 3000) {
  if (showToastCallback) {
    showToastCallback({ message, type, duration });
  }
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastCallback = (toast) => {
      const id = Date.now() + Math.random();
      const newToast = { ...toast, id };
      
      setToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration);
    };

    return () => {
      showToastCallback = null;
    };
  }, []);

  const styles = {
    container: {
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px'
    },
    toast: {
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideInRight 0.3s ease-out, fadeOut 0.3s ease-out 2.7s',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      minWidth: '300px'
    },
    success: {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
      color: 'white'
    },
    error: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
      color: 'white'
    },
    warning: {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))',
      color: 'white'
    },
    info: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
      color: 'white'
    },
    icon: {
      fontSize: '20px',
      flexShrink: 0
    },
    message: {
      flex: 1,
      lineHeight: '1.5'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px',
      opacity: 0.8,
      transition: 'opacity 0.2s'
    }
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  };

  const getTypeStyle = (type) => {
    return styles[type] || styles.info;
  };

  return (
    <>
      <div style={styles.container}>
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            style={{...styles.toast, ...getTypeStyle(toast.type)}}
            role="alert"
            aria-live="polite"
          >
            <span style={styles.icon}>{getIcon(toast.type)}</span>
            <span style={styles.message}>{toast.message}</span>
            <button 
              style={styles.closeButton}
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              aria-label="Close notification"
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @media (max-width: 768px) {
          div[style*="container"] {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
          }
          div[style*="toast"] {
            min-width: auto !important;
          }
        }
      `}</style>
    </>
  );
}
