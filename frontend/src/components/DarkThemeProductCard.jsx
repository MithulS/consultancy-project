/**
 * DARK THEME PRODUCT CARD - PREMIUM E-COMMERCE
 * 
 * A sophisticated product card component designed for the dark navy gradient theme
 * Features glassmorphism, smooth animations, and high-contrast accent buttons
 * 
 * Props:
 * - product: Object containing product details (name, price, image, category, stock, etc.)
 * - onAddToCart: Function to handle add to cart action
 * - onBuyNow: Function to handle buy now action
 * - showQuickView: Boolean to show/hide quick view button
 */

import React, { useState } from 'react';
import SmartButton from './SmartButton';
import { getImageUrl } from '../utils/imageHandling';

export default function DarkThemeProductCard({ 
  product, 
  onAddToCart, 
  onBuyNow,
  showQuickView = true 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate discount percentage
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Determine stock status
  const stockStatus = product.stock > 50 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock';
  const stockLabel = product.stock > 50 
    ? `✓ ${product.stock} in stock` 
    : product.stock > 0 
    ? `⚠ Only ${product.stock} left` 
    : '✗ Out of stock';

  return (
    <div 
      className="dark-navy-theme product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={styles.card}
    >
      {/* Product Image with Overlay */}
      <div style={styles.imageContainer}>
        {!imageLoaded && (
          <div style={styles.imagePlaceholder}>
            <div className="loading-spinner"></div>
          </div>
        )}
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="product-card-image"
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div style={styles.discountBadge}>
            -{discountPercent}%
          </div>
        )}

        {/* Quick View Button (appears on hover) */}
        {showQuickView && isHovered && (
          <div style={styles.quickViewOverlay}>
            <button className="btn-ghost" style={styles.quickViewBtn}>
              👁️ Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-card-body">
        {/* Category */}
        <div className="product-category">
          {product.category || 'Hardware'}
        </div>

        {/* Product Name */}
        <h3 className="product-title">
          {product.name}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="product-description">
            {product.description}
          </p>
        )}

        {/* Rating (if available) */}
        {product.rating && (
          <div style={styles.rating}>
            <span style={styles.stars}>
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
            </span>
            <span style={styles.ratingText}>
              {product.rating} ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Stock Status */}
        <div className={`product-stock ${stockStatus}`}>
          {stockLabel}
        </div>

        {/* Price Section */}
        <div className="product-price">
          <span className="price-current">
            ₹{product.price?.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="price-original">
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <span className="price-discount">
                SAVE {discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button 
            className="btn-buy-now"
            onClick={() => onBuyNow(product)}
            disabled={product.stock === 0}
            style={styles.buttonFull}
          >
            🛒 Buy Now
          </button>
        </div>

        <div className="product-actions" style={{ marginTop: '12px' }}>
          <SmartButton
            onClick={async () => {
              onAddToCart(product);
              return true;
            }}
            disabled={product.stock === 0}
            variant="primary"
            size="medium"
            style={{ width: '100%' }}
          >
            🛍️ Add to Cart
          </SmartButton>
        </div>

        {/* Additional Actions */}
        <div style={styles.secondaryActions}>
          <button 
            className="icon-button" 
            style={styles.iconBtn}
            title="Add to Wishlist"
            aria-label="Add to Wishlist"
          >
            ❤️
          </button>
          <button 
            className="icon-button" 
            style={styles.iconBtn}
            title="Compare"
            aria-label="Add to Compare"
          >
            ⚖️
          </button>
          <button 
            className="icon-button" 
            style={styles.iconBtn}
            title="Share"
            aria-label="Share Product"
          >
            🔗
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline styles for component-specific styling
const styles = {
  card: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a2942',
  },
  imagePlaceholder: {
    width: '100%',
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2942',
  },
  discountBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'linear-gradient(135deg, #ff4757 0%, #ee2a3a 100%)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.9375rem',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.5)',
    zIndex: 2,
  },
  quickViewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 22, 40, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease',
  },
  quickViewBtn: {
    padding: '12px 28px',
    fontSize: '1rem',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  stars: {
    color: '#ff9f43',
    fontSize: '1rem',
    letterSpacing: '2px',
  },
  ratingText: {
    fontSize: '0.875rem',
    color: '#8fa3b8',
  },
  buttonFull: {
    width: '100%',
    justifyContent: 'center',
  },
  secondaryActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    justifyContent: 'center',
  },
  iconBtn: {
    width: '40px',
    height: '40px',
    fontSize: '1.125rem',
  },
};
