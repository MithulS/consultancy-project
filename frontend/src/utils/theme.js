/**
 * THEME CONFIGURATION - Centralized Theme System
 * Single source of truth for all colors, gradients, and styles
 * Import this file to access theme values in JavaScript
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Navy/Blue Palette
  navy: {
    darkest: '#1F2937',
    dark: '#374151',
    medium: '#4B5563',
    light: '#6B7280',
    lighter: '#9CA3AF',
  },

  // Brand Colors
  brand: {
    primary: '#4285F4',      // Google blue (from image)
    primaryDark: '#3367D6',  // Darker blue hover
    primaryLight: '#5A9DF6', // Lighter blue
  },

  // Accent Colors
  accent: {
    blue: '#4285F4',      // Primary blue from image
    blueDark: '#3367D6',
    blueLight: '#5A9DF6',

    red: '#EF4444',       // Red CTA from image
    redDark: '#DC2626',
    redLight: '#F87171',

    orange: '#F97316',    // Orange accent
    orangeDark: '#EA580C',
  },

  // Background Colors - CLASSIC TECH (LIGHT)
  background: {
    primary: '#FFFFFF',   // White from image
    secondary: '#F9FAFB', // Very light gray
    tertiary: '#F3F4F6',  // Light gray from image
    dark: '#1F2937',      // Dark gray
    overlay: 'rgba(31, 41, 55, 0.75)',
  },

  // Text Colors - CLASSIC TECH (DARK TEXT)
  text: {
    primary: '#1F2937',   // Dark gray from image
    secondary: '#4B5563', // Medium gray
    tertiary: '#6B7280',  // Light gray
    inverse: '#FFFFFF',   // White
    muted: '#9CA3AF',     // Muted gray
  },

  // Border Colors
  border: {
    default: '#e2e8f0',
    light: '#f1f5f9',
    dark: '#cbd5e1',
  },

  // Status Colors
  status: {
    success: {
      light: '#dcfce7',
      medium: '#22c55e',
      dark: '#15803d',
    },
    error: {
      light: '#fee2e2',
      medium: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      light: '#fef3c7',
      medium: '#f59e0b',
      dark: '#b45309',
    },
    info: {
      light: '#dbeafe',
      medium: '#3b82f6',
      dark: '#1d4ed8',
    },
  },
};

// ============================================
// GRADIENTS
// ============================================

export const gradients = {
  // Classic Tech Gradients
  navyPrimary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // For headers
  navyDark: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
  navyLight: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',

  // Blue Gradients
  bluePrimary: 'linear-gradient(135deg, #4285F4, #3367D6)',
  blueBright: 'linear-gradient(135deg, #5A9DF6, #4285F4)',

  // Red Gradients
  redPrimary: 'linear-gradient(135deg, #ef4444, #dc2626)',
  redBright: 'linear-gradient(135deg, #f87171, #ef4444)',

  // Orange Gradient - KEY FOR CTA
  orange: 'linear-gradient(135deg, #F97316, #EA580C)',

  // Background Gradients
  lightBg: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',

  // Text Gradients (Optional for light theme, maybe keep solid)
  textNavyBlue: 'linear-gradient(135deg, #0f172a, #3b82f6)',
};

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  // Light Theme Shadows
  navySm: '0 1px 3px rgba(15, 23, 42, 0.1)',
  navyMd: '0 4px 6px rgba(15, 23, 42, 0.1)',
  navyLg: '0 10px 15px rgba(15, 23, 42, 0.1)',
  navyXl: '0 20px 25px rgba(15, 23, 42, 0.1)',

  // Glow Shadows (Softer for light theme)
  blueGlow: '0 4px 14px rgba(66, 133, 244, 0.4)',
  blueGlowLg: '0 10px 25px rgba(66, 133, 244, 0.5)',
  redGlow: '0 4px 14px rgba(239, 68, 68, 0.4)',
  redGlowLg: '0 10px 25px rgba(239, 68, 68, 0.5)',
  orangeGlow: '0 4px 14px rgba(249, 115, 22, 0.4)',

  // Card Shadows (Clean)
  card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
  cardHover: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
};

// ============================================
// SPACING
// ============================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// ============================================
// BORDER RADIUS
// ============================================

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
  smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ============================================
// COMMON STYLE PATTERNS
// ============================================

export const commonStyles = {
  // Container styles
  container: {
    default: {
      minHeight: '100vh',
      backgroundColor: 'var(--background-secondary)',
    },
    lightGradient: {
      minHeight: '100vh',
      background: 'var(--gradient-primary)',
    },
    navyGradient: {
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      color: 'white',
    },
  },

  // Header styles
  header: {
    default: {
      backgroundColor: 'var(--primary-brand)',
      color: 'white',
      boxShadow: shadows.navyMd,
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    simple: {
      backgroundColor: 'white',
      boxShadow: shadows.navySm,
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },

  // Logo styles
  logo: {
    gradient: {
      fontSize: '28px',
      fontWeight: '800',
      background: gradients.textNavyBlue,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    solid: {
      fontSize: '24px',
      fontWeight: '700',
      color: colors.brand.primary,
      margin: 0,
    },
  },

  // Button styles
  button: {
    base: {
      padding: '14px 32px',
      border: 'none',
      borderRadius: radius.md,
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: transitions.normal,
    },
    primary: {
      background: gradients.blueBright,
      color: colors.text.inverse,
      boxShadow: shadows.blueGlow,
    },
    red: {
      background: gradients.redPrimary,
      color: colors.text.inverse,
      boxShadow: shadows.redGlow,
    },
    orange: {
      background: gradients.orange,
      color: colors.text.inverse,
      boxShadow: shadows.orangeGlow,
    },
    navy: {
      background: gradients.bluePrimary,
      color: colors.text.inverse,
      boxShadow: shadows.blueGlow,
    },
    secondary: {
      background: colors.background.primary,
      color: colors.accent.blue,
      border: `2px solid ${colors.accent.blue}`,
    },
  },

  // Card styles
  card: {
    default: {
      backgroundColor: '#ffffff',
      borderRadius: radius.lg,
      boxShadow: shadows.card,
      border: `1px solid ${colors.border.default}`,
      transition: transitions.normal,
      color: colors.text.primary,
    },
    product: {
      backgroundColor: '#ffffff',
      borderRadius: radius.lg,
      overflow: 'hidden',
      boxShadow: shadows.card,
      border: `1px solid ${colors.border.default}`,
      transition: transitions.normal,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: colors.text.primary,
    },
  },

  // Input styles
  input: {
    default: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: `1px solid ${colors.border.default}`,
      borderRadius: radius.md,
      outline: 'none',
      transition: transitions.normal,
      backgroundColor: '#ffffff',
      color: colors.text.primary,
    },
    withIcon: {
      width: '100%',
      padding: '12px 16px 12px 42px',
      fontSize: '15px',
      border: `1px solid ${colors.border.default}`,
      borderRadius: radius.md,
      outline: 'none',
      transition: transitions.normal,
      backgroundColor: '#ffffff',
      color: colors.text.primary,
    },
  },

  // Price styles
  price: {
    gradient: {
      fontSize: '28px',
      fontWeight: '800',
      background: gradients.textNavyBlue,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.03em',
    },
    solid: {
      fontSize: '28px',
      fontWeight: '800',
      color: colors.accent.blue,
    },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Merge styles with base styles
 */
export function mergeStyles(...styles) {
  return Object.assign({}, ...styles);
}

/**
 * Create button style with hover effect handlers
 */
export function createButtonStyle(type = 'primary', customStyles = {}) {
  const baseStyle = mergeStyles(
    commonStyles.button.base,
    commonStyles.button[type] || commonStyles.button.primary,
    customStyles
  );

  const hoverHandlers = {
    onMouseOver: (e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      if (type === 'primary') {
        e.currentTarget.style.boxShadow = shadows.blueGlowLg;
      } else if (type === 'red') {
        e.currentTarget.style.boxShadow = shadows.redGlowLg;
      }
    },
    onMouseOut: (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = baseStyle.boxShadow;
    },
  };

  return { style: baseStyle, handlers: hoverHandlers };
}

/**
 * Create card hover effect handlers
 */
export function createCardHoverHandlers() {
  return {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = shadows.cardHover;
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = shadows.card;
    },
  };
}

/**
 * Get responsive container max width
 */
export function getContainerMaxWidth() {
  return '1400px';
}

/**
 * Create grid layout
 */
export function createGridLayout(minCardWidth = '280px', gap = '28px') {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`,
    gap,
  };
}

// ============================================
// THEME PRESETS
// ============================================

export const themePresets = {
  // Page backgrounds
  pageBackgrounds: {
    white: { backgroundColor: colors.background.primary },
    lightGradient: { background: gradients.lightBg },
    navy: { background: gradients.navyPrimary },
  },

  // Section styles
  sections: {
    default: {
      padding: '64px 0',
    },
    hero: {
      padding: '80px 0',
      background: gradients.navyPrimary,
      color: colors.text.inverse,
    },
  },
};

// ============================================
// EXPORT DEFAULT THEME OBJECT
// ============================================

export default {
  colors,
  gradients,
  shadows,
  spacing,
  radius,
  transitions,
  commonStyles,
  mergeStyles,
  createButtonStyle,
  createCardHoverHandlers,
  getContainerMaxWidth,
  createGridLayout,
  themePresets,
};
