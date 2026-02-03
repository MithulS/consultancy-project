/**
 * Empty State Component
 * Displays helpful empty states for various scenarios
 */

import React from 'react';

export default function EmptyState({ 
  type = 'cart',
  title,
  description,
  actionLabel,
  onAction,
  icon
}) {
  const presets = {
    cart: {
      icon: '🛒',
      title: 'Your cart is empty',
      description: 'Add some products to get started!',
      actionLabel: 'Browse Products'
    },
    search: {
      icon: '🔍',
      title: 'No results found',
      description: 'Try adjusting your search or filters',
      actionLabel: 'Clear Filters'
    },
    wishlist: {
      icon: '❤️',
      title: 'No items in wishlist',
      description: 'Save your favorite products here',
      actionLabel: 'Explore Products'
    },
    orders: {
      icon: '📦',
      title: 'No orders yet',
      description: 'Start shopping to see your orders here',
      actionLabel: 'Start Shopping'
    },
    error: {
      icon: '⚠️',
      title: 'Something went wrong',
      description: 'Please try again later',
      actionLabel: 'Retry'
    },
    noProducts: {
      icon: '📦',
      title: 'No products available',
      description: 'Check back soon for new items',
      actionLabel: 'Go Home'
    }
  };

  const preset = presets[type] || presets.cart;
  const displayIcon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;
  const displayActionLabel = actionLabel || preset.actionLabel;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon} role="img" aria-label={displayTitle}>
            {displayIcon}
          </span>
          <div style={styles.iconRing1} />
          <div style={styles.iconRing2} />
        </div>
        
        <h2 style={styles.title}>{displayTitle}</h2>
        <p style={styles.description}>{displayDescription}</p>
        
        {onAction && (
          <button
            onClick={onAction}
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
            }}
          >
            {displayActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '48px 24px',
    animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  content: {
    textAlign: 'center',
    maxWidth: '480px'
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '24px'
  },
  icon: {
    fontSize: '80px',
    display: 'block',
    position: 'relative',
    zIndex: 2,
    animation: 'float 3s ease-in-out infinite'
  },
  iconRing1: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'var(--accent-blue-primary, #667eea)',
    opacity: 0.1,
    animation: 'pulse 2s ease-in-out infinite',
    zIndex: 1
  },
  iconRing2: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'var(--accent-blue-primary, #667eea)',
    opacity: 0.05,
    animation: 'pulse 2s ease-in-out infinite 0.5s',
    zIndex: 0
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary, #1f2937)',
    marginBottom: '12px',
    letterSpacing: '-0.02em'
  },
  description: {
    fontSize: '16px',
    color: 'var(--text-secondary, #6b7280)',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  actionButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
    minWidth: '160px'
  }
};

// Inject animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }

  @keyframes pulse {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.1;
    }
    50% { 
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.05;
    }
  }
`;

if (!document.querySelector('[data-empty-state-styles]')) {
  styleSheet.setAttribute('data-empty-state-styles', 'true');
  document.head.appendChild(styleSheet);
}
