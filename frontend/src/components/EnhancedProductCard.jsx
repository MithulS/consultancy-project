/**
 * ENHANCED PRODUCT CARD COMPONENT
 * Implements modern UI/UX best practices with focus on conversion optimization
 * Features: Hover effects, quick actions, accessibility, performance optimization
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import OptimizedImage from './OptimizedImage';
import ProductRating from './ProductRating';
import PriceDisplay from './PriceDisplay';
import WishlistButton from './WishlistButton';
import ProductBadges from './ProductBadges';
import { getImageUrl } from '../utils/imageHandling';
import { generateProductAltText, CATEGORY_CONFIG } from '../utils/constants';

const EnhancedProductCard = ({
  product,
  index,
  onAddToCart,
  onBuyNow,
  onQuickView,
  onAuthRequired
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null;
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return discount > 0 ? discount : null;
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { type: 'out', label: 'Out of Stock' };
    if (product.stock <= 10) return { type: 'low', label: `Only ${product.stock} left` };
    return { type: 'high', label: 'In Stock' };
  };

  // Get default placeholder image based on category
  const getProductImage = () => {
    if (product.imageUrl && product.imageUrl !== '/images/placeholder.png') {
      return getImageUrl(product.imageUrl);
    }
    // Use category-specific placeholder
    const categoryConfig = CATEGORY_CONFIG[product.category];
    return categoryConfig?.placeholder || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=400&fit=crop';
  };

  const discount = calculateDiscount();
  const stockStatus = getStockStatus();

  const styles = {
    card: {
      position: 'relative',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      borderRadius: '12px',
      border: isHovered ? '2px solid var(--accent-blue-primary)' : '1px solid var(--border-color)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      boxShadow: isHovered
        ? '0 12px 24px rgba(0, 0, 0, 0.1)'
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      paddingTop: '100%', // 1:1 Aspect Ratio for consistency
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.05)',
    },
    imageWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    },
    wishlistWrapper: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 2,
    },
    cardContent: {
      padding: '20px', // Increased for better mobile spacing
      display: 'flex',
      flexDirection: 'column',
      gap: '12px', // Increased spacing between elements
      flex: 1,
    },
    category: {
      fontSize: '10px',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: '0.8px',
    },
    productName: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '44px',
      marginTop: '2px',
    },
    ratingSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      minHeight: '20px',
    },
    reviewsCount: {
      fontSize: '12px',
      color: 'var(--text-secondary)',
    },
    priceSection: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      marginTop: 'auto',
      paddingTop: '8px',
    },
    currentPrice: {
      fontSize: '24px',
      fontWeight: '800',
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em',
    },
    originalPrice: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--text-secondary)',
      textDecoration: 'line-through',
    },
    stockIndicator: {
      fontSize: '11px',
      fontWeight: '500',
      color: 'var(--text-secondary)',
      marginTop: '4px',
    },
    actions: {
      marginTop: '12px',
    },
    btnPrimary: {
      width: '100%',
      minHeight: '48px', // Mobile tap target optimization
      padding: '14px 20px',
      background: product.stock === 0
        ? 'var(--glass-border)'
        : 'var(--accent-blue-primary)',
      color: product.stock === 0 ? 'var(--text-secondary)' : '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: product.stock === 0
        ? 'none'
        : 'var(--shadow-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      touchAction: 'manipulation', // Prevent zoom on double-tap
      WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
    },
    quickViewBtn: {
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      minHeight: '44px', // Mobile tap target
      minWidth: '140px',
      opacity: 0,
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      zIndex: 10,
      touchAction: 'manipulation',
    },
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock > 0 && onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (product.stock > 0 && onBuyNow) {
      onBuyNow(product);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <article
      className="product-card-enhanced"
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleQuickView}
      aria-label={`${product.name} - ${product.price} rupees`}
    >
      {/* Image Section */}
      <div style={styles.imageContainer}>
        <div style={styles.imageWrapper}>
          <OptimizedImage
            src={getProductImage()}
            alt={generateProductAltText(product)}
            title={`${product.name}${product.brand ? ' by ' + product.brand : ''} - ₹${product.price}`}
            width={400}
            height={400}
            priority={index < 4}
            style={styles.image}
          />
        </div>

        {/* Product Badges - Limited to 2 */}
        <ProductBadges
          discount={discount}
          stock={product.stock}
          isFeatured={product.featured}
          isBestSeller={product.numReviews > 500}
        />

        {/* Wishlist Button */}
        <div style={styles.wishlistWrapper}>
          <WishlistButton
            productId={product._id}
            size="medium"
            onAuthRequired={onAuthRequired}
          />
        </div>

        {/* Quick View Button - Shows on hover */}
        <button
          style={{
            ...styles.quickViewBtn,
            opacity: isHovered ? 1 : 0,
          }}
          onClick={handleQuickView}
          aria-label="Quick view product details"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-blue-primary)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          👁️ Quick View
        </button>
      </div>

      {/* Content Section */}
      <div style={styles.cardContent}>
        {/* Category - Subtle */}
        <span style={styles.category}>{product.category}</span>

        {/* Product Name - Prominent, 2 lines max */}
        <h3 style={styles.productName}>{product.name}</h3>

        {/* Rating - Uniform format */}
        {product.rating > 0 && (
          <div style={styles.ratingSection}>
            <ProductRating rating={product.rating} />
            {product.numReviews > 0 && (
              <span style={styles.reviewsCount}>
                ({product.numReviews.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price Section - Emphasized */}
        <div style={styles.priceSection}>
          <span style={styles.currentPrice}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span style={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Indicator - Toned down */}
        {product.stock > 0 && product.stock <= 10 && (
          <div style={styles.stockIndicator}>
            Only {product.stock} left in stock
          </div>
        )}

        {/* Single Primary Action Button */}
        <div style={styles.actions}>
          <button
            style={styles.btnPrimary}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="btn-enhanced"
          >
            {product.stock === 0 ? 'Out of Stock' : '🛍️ Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};

EnhancedProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    imageUrl: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    brand: PropTypes.string,
    stock: PropTypes.number.isRequired,
    rating: PropTypes.number,
    numReviews: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onAddToCart: PropTypes.func,
  onBuyNow: PropTypes.func,
  onQuickView: PropTypes.func,
  onAuthRequired: PropTypes.func,
};

export default EnhancedProductCard;
