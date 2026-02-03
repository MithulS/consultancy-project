// Enhanced Animated Toast Component
import React from 'react';

export default function AnimatedToast({ 
  message, 
  type = 'success', 
  isVisible,
  onClose 
}) {
  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    cart: '🛒'
  };

  const colors = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#ef4444', border: '#dc2626' },
    warning: { bg: '#f59e0b', border: '#d97706' },
    info: { bg: '#3b82f6', border: '#2563eb' },
    cart: { bg: '#8b5cf6', border: '#7c3aed' }
  };

  const currentColor = colors[type] || colors.info;

  const styles = {
    toast: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      backgroundColor: currentColor.bg,
      color: '#ffffff',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 10000,
      minWidth: '300px',
      animation: 'slideInToast 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), shake 0.5s ease-in-out 0.5s',
      border: `2px solid ${currentColor.border}`,
      backdropFilter: 'blur(10px)'
    },
    icon: {
      fontSize: '24px',
      animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s backwards'
    },
    content: {
      flex: 1,
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '1.4'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: '#ffffff',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      opacity: 0.8
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '3px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      animation: 'progressBar 3s linear'
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInToast {
          from {
            transform: translateX(400px) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .toast-close-btn:hover {
          opacity: 1 !important;
          transform: scale(1.2);
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translateX(400px) scale(0.8);
          }
        }
      `}</style>
      
      <div style={styles.toast}>
        <div style={styles.icon}>{icons[type]}</div>
        <div style={styles.content}>{message}</div>
        <button
          style={styles.closeBtn}
          className="toast-close-btn"
          onClick={onClose}
        >
          ✕
        </button>
        <div style={styles.progressBar} />
      </div>
    </>
  );
}
