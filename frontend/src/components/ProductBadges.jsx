/**
 * Product Badges Component
 * Displays various badges for products (New, Sale, Featured, Low Stock, etc.)
 */

import React from 'react';

const ProductBadges = ({ 
  isNew = false, 
  isFeatured = false, 
  discount = 0,
  stock = 0,
  isBestSeller = false,
  freeShipping = false
}) => {
  const badges = [];

  // Priority 1: Discount Badge (most important for conversion)
  if (discount > 0) {
    badges.push({
      id: 'discount',
      text: `-${discount}%`,
      style: {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        fontSize: '13px',
        fontWeight: '700',
        padding: '6px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
      }
    });
  }

  // Priority 2: Best Seller Badge (social proof)
  if (isBestSeller && badges.length < 2) {
    badges.push({
      id: 'bestseller',
      text: '🔥 Best Seller',
      style: {
        background: 'linear-gradient(135deg, #ec4899, #db2777)',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600',
        padding: '5px 10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
      }
    });
  }

  // Priority 3: Featured Badge (only if less than 2 badges)
  if (isFeatured && badges.length < 2 && !isBestSeller) {
    badges.push({
      id: 'featured',
      text: '⭐ Featured',
      style: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600',
        padding: '5px 10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
      }
    });
  }

  // Only show max 2 badges to reduce clutter

  if (badges.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      zIndex: 2,
      pointerEvents: 'none'
    }}>
      {badges.slice(0, 2).map(badge => (
        <div key={badge.id} style={badge.style}>
          {badge.text}
        </div>
      ))}
    </div>
  );
};

export default ProductBadges;
