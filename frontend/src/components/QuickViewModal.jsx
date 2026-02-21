/**
 * QUICK VIEW MODAL COMPONENT
 * Allows users to view product details without leaving the page
 * Features: Image gallery, specifications, add to cart, wishlist
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import OptimizedImage from './OptimizedImage';
import ProductRating from './ProductRating';
import { getImageUrl } from '../utils/imageHandling';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const discount = calculateDiscount();

  const handleAddToCart = () => {
    if (onAddToCart && product.stock > 0) {
      onAddToCart({ ...product, quantity });
      onClose();
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow && product.stock > 0) {
      onBuyNow({ ...product, quantity });
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-in-out',
    },
    modal: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      borderRadius: '16px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '85vh',
      overflow: 'auto',
      position: 'relative',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'slideUp 0.3s ease-out',
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '24px',
      color: '#6b7280',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      transition: 'all 0.2s',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      padding: '32px',
    },
    imageSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    mainImage: {
      width: '100%',
      aspectRatio: '1',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.05)',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      backgroundColor: 'var(--accent-red-primary)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '700',
      zIndex: 2,
    },
    detailsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    category: {
      fontSize: '12px',
      color: '#9ca3af',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: '1px',
    },
    productName: {
      fontSize: '28px',
      fontWeight: '800',
      color: 'var(--text-primary)',
      lineHeight: '1.2',
      marginTop: '0',
    },
    ratingSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    reviewsCount: {
      fontSize: '14px',
      color: '#6b7280',
    },
    priceSection: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      padding: '16px 0',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
    },
    currentPrice: {
      fontSize: '32px',
      fontWeight: '800',
      color: 'var(--text-primary)',
    },
    originalPrice: {
      fontSize: '20px',
      color: '#9ca3af',
      textDecoration: 'line-through',
    },
    discountBadge: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--color-success)',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '700',
    },
    description: {
      fontSize: '15px',
      color: 'var(--text-secondary)',
      lineHeight: '1.6',
    },
    stockInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--color-success)',
    },
    quantitySection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    quantityLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
    },
    quantityControl: {
      display: 'flex',
      alignItems: 'center',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    quantityButton: {
      width: '40px',
      height: '40px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      transition: 'background-color 0.2s',
    },
    quantityValue: {
      width: '60px',
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      background: 'rgba(255, 255, 255, 0.05)',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
    },
    btnPrimary: {
      flex: 1,
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    },
    btnSecondary: {
      flex: 1,
      padding: '14px 24px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    viewFullDetails: {
      textAlign: 'center',
      marginTop: '16px',
    },
    viewFullLink: {
      color: '#1e3a8a',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
  };

  // Responsive styles
  const responsiveStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @media (max-width: 768px) {
      .quick-view-content {
        grid-template-columns: 1fr !important;
        padding: 24px !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close quick view"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-background)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>

          <div style={styles.content} className="quick-view-content">
            {/* Image Section */}
            <div style={styles.imageSection}>
              <div style={styles.mainImage}>
                {discount && (
                  <div style={styles.badge}>
                    {discount}% OFF
                  </div>
                )}
                <OptimizedImage
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  width={400}
                  height={400}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>

            {/* Details Section */}
            <div style={styles.detailsSection}>
              <span style={styles.category}>{product.category}</span>

              <h2 style={styles.productName}>{product.name}</h2>

              {product.rating > 0 && (
                <div style={styles.ratingSection}>
                  <ProductRating rating={product.rating} />
                  {product.numReviews > 0 && (
                    <span style={styles.reviewsCount}>
                      ({product.numReviews.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}

              <div style={styles.priceSection}>
                <span style={styles.currentPrice}>
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span style={styles.originalPrice}>
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    {discount && (
                      <span style={styles.discountBadge}>
                        Save {discount}%
                      </span>
                    )}
                  </>
                )}
              </div>

              {product.description && (
                <p style={styles.description}>{product.description}</p>
              )}

              {product.stock > 0 && (
                <div style={styles.stockInfo}>
                  ✓ {product.stock <= 10 ? `Only ${product.stock} left` : 'In Stock'}
                </div>
              )}

              {product.stock > 0 && (
                <>
                  <div style={styles.quantitySection}>
                    <span style={styles.quantityLabel}>Quantity:</span>
                    <div style={styles.quantityControl}>
                      <button
                        style={styles.quantityButton}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        −
                      </button>
                      <div style={styles.quantityValue}>{quantity}</div>
                      <button
                        style={styles.quantityButton}
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      style={styles.btnPrimary}
                      onClick={handleAddToCart}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      🛍️ Add to Cart
                    </button>
                    <button
                      style={styles.btnSecondary}
                      onClick={handleBuyNow}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                      }}
                    >
                      ⚡ Buy Now
                    </button>
                  </div>
                </>
              )}

              {product.stock === 0 && (
                <div style={{
                  ...styles.stockInfo,
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--accent-red-primary)',
                }}>
                  ✕ Out of Stock
                </div>
              )}

              <div style={styles.viewFullDetails}>
                <a
                  href={`#product/${product._id}`}
                  style={styles.viewFullLink}
                  onClick={onClose}
                >
                  View Full Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

QuickViewModal.propTypes = {
  product: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func,
  onBuyNow: PropTypes.func,
};

export default QuickViewModal;
