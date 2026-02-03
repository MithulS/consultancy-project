/**
 * LAYOUT WRAPPER - Consistent Theme Application
 * Reusable component that applies navy theme to all pages
 */

import React from 'react';

export default function ThemeLayout({ children, variant = 'default' }) {
  const styles = {
    // Default Layout - White background with navy header
    default: {
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(31, 41, 55, 0.03) 1px, transparent 0)',
      backgroundSize: '40px 40px'
    },
    
    // Navy Layout - Full navy gradient background
    navy: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)',
      position: 'relative'
    },
    
    // Light Layout - Clean white with subtle pattern
    light: {
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%231F2937\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    },
    
    // Product Grid Layout - Optimized for product listings
    products: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)'
    }
  };

  const navyPattern = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
    zIndex: 0
  };

  const contentWrapper = {
    position: 'relative',
    zIndex: 1
  };

  return (
    <div style={styles[variant] || styles.default}>
      {variant === 'navy' && <div style={navyPattern} />}
      <div style={variant === 'navy' ? contentWrapper : undefined}>
        {children}
      </div>
    </div>
  );
}
