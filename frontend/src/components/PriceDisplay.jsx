// Price Display with Discount Badge
import React from 'react';

export default function PriceDisplay({ 
  price, 
  originalPrice = null, 
  discount = null,
  size = 'medium' 
}) {
  const hasDiscount = originalPrice && originalPrice > price;
  const calculatedDiscount = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount;

  const sizes = {
    small: { price: '16px', original: '14px', badge: '10px' },
    medium: { price: '20px', original: '16px', badge: '11px' },
    large: { price: '24px', original: '18px', badge: '12px' }
  };

  const currentSize = sizes[size] || sizes.medium;

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    priceGroup: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px'
    },
    currentPrice: {
      fontSize: currentSize.price,
      fontWeight: '700',
      color: hasDiscount ? '#ef4444' : '#3b82f6'
    },
    originalPrice: {
      fontSize: currentSize.original,
      fontWeight: '500',
      color: '#9ca3af',
      textDecoration: 'line-through'
    },
    discountBadge: {
      display: 'inline-block',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      fontSize: currentSize.badge,
      fontWeight: '700',
      padding: '4px 8px',
      borderRadius: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      animation: 'pulse 2s infinite'
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .discount-badge {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), pulse 2s infinite 1s;
          position: relative;
          overflow: hidden;
        }
        .discount-badge::after {
          content: '';
          position: absolute;
          top: 0;
          left: -200px;
          width: 200px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.priceGroup}>
          {hasDiscount && (
            <span style={styles.originalPrice}>
              ${originalPrice.toFixed(2)}
            </span>
          )}
          <span style={styles.currentPrice}>
            ${price.toFixed(2)}
          </span>
        </div>
        {calculatedDiscount > 0 && (
          <span style={styles.discountBadge} className="discount-badge">
            {calculatedDiscount}% OFF
          </span>
        )}
      </div>
    </>
  );
}
