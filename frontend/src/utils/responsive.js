// Mobile Responsive Utility Styles
export const responsiveStyles = {
  // Container styles that adapt to screen size
  container: (customStyles = {}) => ({
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    ...customStyles,
    '@media (max-width: 768px)': {
      padding: '12px',
      ...customStyles['@media (max-width: 768px)']
    }
  }),

  // Grid layouts that stack on mobile
  grid: (columns = 3, gap = '20px') => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    '@media (max-width: 1024px)': {
      gridTemplateColumns: `repeat(${Math.max(2, columns - 1)}, 1fr)`
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '12px'
    }
  }),

  // Flex layouts that wrap on mobile
  flexRow: (gap = '12px') => ({
    display: 'flex',
    gap,
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      flexDirection: 'column'
    }
  }),

  // Text sizes that scale
  heading1: {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
    '@media (max-width: 768px)': {
      fontSize: '24px'
    }
  },

  heading2: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
    '@media (max-width: 768px)': {
      fontSize: '20px'
    }
  },

  body: {
    fontSize: '16px',
    lineHeight: '1.6',
    '@media (max-width: 768px)': {
      fontSize: '14px'
    }
  },

  small: {
    fontSize: '14px',
    '@media (max-width: 768px)': {
      fontSize: '12px'
    }
  },

  // Button sizes for touch targets
  button: {
    padding: '12px 24px',
    fontSize: '15px',
    minHeight: '44px', // Minimum touch target
    '@media (max-width: 768px)': {
      padding: '14px 20px',
      width: '100%'
    }
  },

  // Input fields
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    minHeight: '44px',
    '@media (max-width: 768px)': {
      fontSize: '16px', // Prevents zoom on iOS
      padding: '14px'
    }
  },

  // Modal that adapts to mobile
  modal: {
    maxWidth: '600px',
    margin: '40px auto',
    '@media (max-width: 768px)': {
      margin: '0',
      maxWidth: '100%',
      minHeight: '100vh',
      borderRadius: '0'
    }
  },

  // Card layouts
  card: {
    padding: '24px',
    borderRadius: '16px',
    '@media (max-width: 768px)': {
      padding: '16px',
      borderRadius: '12px'
    }
  }
};

// Hook for detecting mobile viewport
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Hook for detecting tablet viewport
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(
    window.innerWidth > 768 && window.innerWidth <= 1024
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTablet;
}

// Global responsive CSS
export const globalResponsiveCSS = `
  /* Mobile-first base styles */
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  /* Image responsiveness */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Touch-friendly spacing */
  @media (max-width: 768px) {
    button, a {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Tablet breakpoint */
  @media (min-width: 769px) and (max-width: 1024px) {
    html {
      font-size: 15px;
    }
  }

  /* Desktop breakpoint */
  @media (min-width: 1025px) {
    html {
      font-size: 16px;
    }
  }

  /* Landscape mode on mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    html {
      font-size: 14px;
    }
  }

  /* Hide scrollbar but keep functionality */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
`;
