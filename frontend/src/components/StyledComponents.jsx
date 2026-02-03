/**
 * REUSABLE STYLED COMPONENTS
 * Pre-built themed components for common UI elements
 */

import React from 'react';
import { colors, gradients, shadows, radius, transitions, commonStyles, createButtonStyle, createCardHoverHandlers } from '../utils/theme';

// ============================================
// BUTTON COMPONENTS
// ============================================

export function Button({ variant = 'primary', children, onClick, disabled, style = {}, ...props }) {
  const { style: buttonStyle, handlers } = createButtonStyle(variant, style);
  
  return (
    <button
      style={{
        ...buttonStyle,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={onClick}
      disabled={disabled}
      {...handlers}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function RedButton(props) {
  return <Button variant="red" {...props} />;
}

export function OrangeButton(props) {
  return <Button variant="orange" {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}

// ============================================
// CARD COMPONENTS
// ============================================

export function Card({ children, hover = false, style = {}, ...props }) {
  const cardStyle = {
    ...commonStyles.card.default,
    ...style,
  };
  
  const hoverHandlers = hover ? createCardHoverHandlers() : {};
  
  return (
    <div style={cardStyle} {...hoverHandlers} {...props}>
      {children}
    </div>
  );
}

export function ProductCard({ children, style = {}, ...props }) {
  const cardStyle = {
    ...commonStyles.card.product,
    ...style,
  };
  
  return (
    <div style={cardStyle} {...createCardHoverHandlers()} {...props}>
      {children}
    </div>
  );
}

// ============================================
// CONTAINER COMPONENTS
// ============================================

export function Container({ variant = 'default', children, style = {}, ...props }) {
  const containerStyle = {
    ...commonStyles.container[variant],
    ...style,
  };
  
  return (
    <div style={containerStyle} {...props}>
      {children}
    </div>
  );
}

export function PageContainer({ children, maxWidth = '1400px', style = {}, ...props }) {
  const containerStyle = {
    maxWidth,
    margin: '0 auto',
    padding: '0 24px',
    ...style,
  };
  
  return (
    <div style={containerStyle} {...props}>
      {children}
    </div>
  );
}

// ============================================
// HEADER COMPONENTS
// ============================================

export function Header({ variant = 'default', children, style = {}, ...props }) {
  const headerStyle = {
    ...commonStyles.header[variant],
    ...style,
  };
  
  return (
    <header style={headerStyle} {...props}>
      {children}
    </header>
  );
}

export function Logo({ variant = 'gradient', children, style = {}, ...props }) {
  const logoStyle = {
    ...commonStyles.logo[variant],
    ...style,
    cursor: 'pointer',
  };
  
  return (
    <h1 style={logoStyle} {...props}>
      {children}
    </h1>
  );
}

// ============================================
// INPUT COMPONENTS
// ============================================

export function Input({ withIcon = false, style = {}, ...props }) {
  const inputStyle = {
    ...(withIcon ? commonStyles.input.withIcon : commonStyles.input.default),
    ...style,
  };
  
  return <input style={inputStyle} {...props} />;
}

export function SearchInput({ placeholder = 'Search...', style = {}, ...props }) {
  const inputStyle = {
    ...commonStyles.input.withIcon,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '16px center',
    backgroundSize: '20px',
    ...style,
  };
  
  return <input type="text" placeholder={placeholder} style={inputStyle} {...props} />;
}

// ============================================
// TEXT COMPONENTS
// ============================================

export function GradientText({ children, style = {}, ...props }) {
  const textStyle = {
    background: gradients.textNavyBlue,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    ...style,
  };
  
  return <span style={textStyle} {...props}>{children}</span>;
}

export function Price({ amount, currency = '$', gradient = true, style = {}, ...props }) {
  const priceStyle = gradient
    ? { ...commonStyles.price.gradient, ...style }
    : { ...commonStyles.price.solid, ...style };
  
  return (
    <span style={priceStyle} {...props}>
      {currency}{typeof amount === 'number' ? amount.toFixed(2) : amount}
    </span>
  );
}

// ============================================
// BADGE COMPONENTS
// ============================================

export function Badge({ children, variant = 'primary', style = {}, ...props }) {
  const variants = {
    primary: {
      backgroundColor: colors.accent.blue,
      color: colors.text.inverse,
    },
    success: {
      background: `linear-gradient(135deg, ${colors.status.success.light}, ${colors.status.success.medium})`,
      color: colors.status.success.dark,
    },
    error: {
      background: `linear-gradient(135deg, ${colors.status.error.light}, ${colors.status.error.medium})`,
      color: colors.status.error.dark,
    },
    warning: {
      background: `linear-gradient(135deg, ${colors.status.warning.light}, ${colors.status.warning.medium})`,
      color: colors.status.warning.dark,
    },
  };
  
  const badgeStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: radius.md,
    fontSize: '12px',
    fontWeight: '600',
    ...variants[variant],
    ...style,
  };
  
  return <span style={badgeStyle} {...props}>{children}</span>;
}

export function StockBadge({ inStock, style = {} }) {
  return (
    <Badge
      variant={inStock ? 'success' : 'error'}
      style={style}
    >
      {inStock ? '✓ In Stock' : '✗ Out of Stock'}
    </Badge>
  );
}

// ============================================
// GRID COMPONENTS
// ============================================

export function Grid({ minCardWidth = '280px', gap = '28px', children, style = {}, ...props }) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`,
    gap,
    ...style,
  };
  
  return (
    <div style={gridStyle} {...props}>
      {children}
    </div>
  );
}

// ============================================
// NOTIFICATION COMPONENT
// ============================================

export function Notification({ message, type = 'success', style = {}, ...props }) {
  const types = {
    success: { background: gradients.blueBright },
    error: { background: gradients.redPrimary },
    warning: { background: gradients.orange },
  };
  
  const notificationStyle = {
    position: 'fixed',
    top: '90px',
    right: '32px',
    ...types[type],
    color: colors.text.inverse,
    padding: '18px 28px',
    borderRadius: radius.lg,
    boxShadow: shadows.navyLg,
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    fontWeight: '600',
    fontSize: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };
  
  return (
    <div style={notificationStyle} {...props}>
      {message}
    </div>
  );
}

// ============================================
// LOADING COMPONENT
// ============================================

export function LoadingSpinner({ size = '48px', color = colors.brand.primaryLight, style = {} }) {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `4px solid ${colors.border.default}`,
    borderTop: `4px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...style,
  };
  
  return <div style={spinnerStyle} />;
}

export function LoadingContainer({ message = 'Loading...', style = {} }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 0',
    gap: '16px',
    ...style,
  };
  
  return (
    <div style={containerStyle}>
      <LoadingSpinner />
      <p style={{ color: colors.text.secondary, fontSize: '16px' }}>{message}</p>
    </div>
  );
}

// ============================================
// SECTION COMPONENT
// ============================================

export function Section({ variant = 'default', children, style = {}, ...props }) {
  const sectionStyle = variant === 'hero'
    ? {
        padding: '80px 0',
        background: gradients.navyPrimary,
        color: colors.text.inverse,
        ...style,
      }
    : {
        padding: '64px 0',
        ...style,
      };
  
  return (
    <section style={sectionStyle} {...props}>
      {children}
    </section>
  );
}
