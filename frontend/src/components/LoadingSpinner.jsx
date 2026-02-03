// Animated Loading Spinner Component
import React from 'react';

export default function LoadingSpinner({ 
  size = 'medium',
  color = '#3b82f6',
  type = 'spinner',
  message = ''
}) {
  const sizes = {
    small: 24,
    medium: 48,
    large: 72
  };

  const spinnerSize = sizes[size] || sizes.medium;

  const renderSpinner = () => {
    switch(type) {
      case 'dots':
        return <DotsLoader color={color} size={spinnerSize} />;
      case 'pulse':
        return <PulseLoader color={color} size={spinnerSize} />;
      case 'bars':
        return <BarsLoader color={color} size={spinnerSize} />;
      default:
        return <DefaultSpinner color={color} size={spinnerSize} />;
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px'
    },
    message: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500',
      animation: 'pulse 2s ease-in-out infinite'
    }
  };

  return (
    <div style={styles.container}>
      {renderSpinner()}
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

// Default circular spinner
function DefaultSpinner({ color, size }) {
  const styles = {
    spinner: {
      width: size,
      height: size,
      border: `4px solid rgba(0, 0, 0, 0.1)`,
      borderTop: `4px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.spinner} />
    </>
  );
}

// Dots loader
function DotsLoader({ color, size }) {
  const dotSize = size / 5;
  
  const styles = {
    container: {
      display: 'flex',
      gap: dotSize / 2,
      alignItems: 'center'
    },
    dot: {
      width: dotSize,
      height: dotSize,
      backgroundColor: color,
      borderRadius: '50%',
      animation: 'bounce 1.4s infinite ease-in-out'
    }
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot-1 { animation-delay: -0.32s; }
        .dot-2 { animation-delay: -0.16s; }
        .dot-3 { animation-delay: 0s; }
      `}</style>
      <div style={styles.container}>
        <div style={styles.dot} className="dot-1" />
        <div style={styles.dot} className="dot-2" />
        <div style={styles.dot} className="dot-3" />
      </div>
    </>
  );
}

// Pulse loader
function PulseLoader({ color, size }) {
  const styles = {
    container: {
      position: 'relative',
      width: size,
      height: size
    },
    ring: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: `4px solid ${color}`,
      opacity: 0,
      animation: 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulseRing {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        .ring-1 { animation-delay: 0s; }
        .ring-2 { animation-delay: 0.5s; }
        .ring-3 { animation-delay: 1s; }
      `}</style>
      <div style={styles.container}>
        <div style={styles.ring} className="ring-1" />
        <div style={styles.ring} className="ring-2" />
        <div style={styles.ring} className="ring-3" />
      </div>
    </>
  );
}

// Bars loader
function BarsLoader({ color, size }) {
  const barWidth = size / 6;
  const barHeight = size;
  
  const styles = {
    container: {
      display: 'flex',
      gap: barWidth / 2,
      alignItems: 'center',
      height: barHeight
    },
    bar: {
      width: barWidth,
      height: '100%',
      backgroundColor: color,
      borderRadius: barWidth / 2,
      animation: 'stretchDelay 1.2s infinite ease-in-out'
    }
  };

  return (
    <>
      <style>{`
        @keyframes stretchDelay {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
        .bar-1 { animation-delay: -1.1s; }
        .bar-2 { animation-delay: -1.0s; }
        .bar-3 { animation-delay: -0.9s; }
        .bar-4 { animation-delay: -0.8s; }
      `}</style>
      <div style={styles.container}>
        <div style={styles.bar} className="bar-1" />
        <div style={styles.bar} className="bar-2" />
        <div style={styles.bar} className="bar-3" />
        <div style={styles.bar} className="bar-4" />
      </div>
    </>
  );
}

// Export individual loaders for direct use
export { DefaultSpinner, DotsLoader, PulseLoader, BarsLoader };
