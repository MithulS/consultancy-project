/**
 * SMART BUTTON COMPONENT
 * Interactive button with micro-interactions:
 * - Idle state: Normal button
 * - Loading state: Shrinks and shows spinner
 * - Success state: Morphs into green checkmark
 * - Auto-resets after success animation
 */

import React, { useState, useEffect } from 'react';

export default function SmartButton({
  onClick,
  disabled = false,
  children = 'Add to Cart',
  variant = 'primary',
  size = 'medium',
  style = {},
  className = '',
  ariaLabel,
  successMessage = '✓',
  resetDelay = 2000,
  ...props
}) {
  const [state, setState] = useState('idle'); // idle, loading, success

  useEffect(() => {
    if (state === 'success') {
      const timer = setTimeout(() => {
        setState('idle');
      }, resetDelay);
      return () => clearTimeout(timer);
    }
  }, [state, resetDelay]);

  const handleClick = async (e) => {
    if (state !== 'idle' || disabled) return;

    setState('loading');

    try {
      // Call the onClick handler and wait for it
      const result = onClick ? await onClick(e) : null;
      
      // If onClick returns false, don't show success
      if (result === false) {
        setState('idle');
        return;
      }

      setState('success');
    } catch (error) {
      console.error('SmartButton error:', error);
      setState('idle');
    }
  };

  // Size configurations
  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '13px',
      minWidth: '100px',
      height: '36px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '15px',
      minWidth: '140px',
      height: '44px',
    },
    large: {
      padding: '14px 32px',
      fontSize: '16px',
      minWidth: '160px',
      height: '52px',
    },
  };

  // Variant configurations
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #4285F4 0%, #764ba2 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #764ba2 0%, #4285F4 100%)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
    },
    success: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    },
    dark: {
      background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      color: '#ffffff',
      hoverBackground: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    },
  };

  const sizeConfig = sizes[size] || sizes.medium;
  const variantConfig = variants[variant] || variants.primary;

  // Base button styles
  const baseStyles = {
    position: 'relative',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : state === 'idle' ? 'pointer' : 'default',
    fontWeight: '600',
    fontFamily: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
    boxShadow: state === 'success' 
      ? '0 8px 30px rgba(46, 213, 115, 0.4)' 
      : '0 4px 15px rgba(0, 0, 0, 0.2)',
    ...sizeConfig,
    ...style,
  };

  // State-specific styles
  const stateStyles = {
    idle: {
      background: variantConfig.background,
      color: variantConfig.color,
      transform: 'scale(1)',
    },
    loading: {
      background: variantConfig.background,
      color: 'transparent',
      transform: 'scale(0.95)',
      minWidth: sizeConfig.height, // Make it square
      padding: '0',
    },
    success: {
      background: 'linear-gradient(135deg, #2ed573 0%, #26de81 100%)',
      color: '#ffffff',
      transform: 'scale(1.05)',
      minWidth: sizeConfig.height, // Make it square
      padding: '0',
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...stateStyles[state],
  };

  // Hover effect (only for idle state)
  const [isHovered, setIsHovered] = useState(false);
  const hoverStyles = state === 'idle' && isHovered && !disabled ? {
    background: variantConfig.hoverBackground,
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)',
  } : {};

  return (
    <button
      style={{ ...buttonStyles, ...hoverStyles }}
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      className={`smart-button ${className}`}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Button')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Idle State Content */}
      {state === 'idle' && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {children}
        </span>
      )}

      {/* Loading State - Spinner */}
      {state === 'loading' && (
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}

      {/* Success State - Checkmark */}
      {state === 'success' && (
        <span
          style={{
            fontSize: '24px',
            animation: 'checkmarkBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          }}
        >
          {successMessage}
        </span>
      )}

      {/* Inject animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes checkmarkBounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        .smart-button:active:not(:disabled) {
          transform: scale(0.98) !important;
        }

        .smart-button:focus-visible {
          outline: 3px solid rgba(102, 126, 234, 0.5);
          outline-offset: 2px;
        }
      `}</style>
    </button>
  );
}
