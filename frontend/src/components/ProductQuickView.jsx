/**
 * Product Quick View Modal
 * Shows product details in a modal without leaving the page
 */

import React from 'react';
import OptimizedImage from './OptimizedImage';
import ProductRating from './ProductRating';
import { getImageUrl } from '../utils/imageHandling';

const ProductQuickView = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
  if (!isOpen || !product) return null;

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
      animation: 'slideUp 0.3s ease',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      zIndex: 10,
      transition: 'all 0.3s ease'
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      padding: '40px'
    },
    imageSection: {
      position: 'relative'
    },
    image: {
      width: '100%',
      height: '400px',
      objectFit: 'cover',
      borderRadius: '12px',
      backgroundColor: '#f9fafb'
    },
    detailsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    category: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: '0.5px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      lineHeight: '1.3'
    },
    description: {
      fontSize: '15px',
      color: '#6b7280',
      lineHeight: '1.6'
    },
    priceSection: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      marginTop: '8px'
    },
    currentPrice: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#111827'
    },
    originalPrice: {
      fontSize: '20px',
      color: '#9ca3af',
      textDecoration: 'line-through'
    },
    discountBadge: {
      padding: '4px 12px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '700'
    },
    stockInfo: {
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-block',
      marginTop: '8px'
    },
    inStock: {
      background: '#d1fae5',
      color: '#065f46'
    },
    lowStock: {
      background: '#fef3c7',
      color: '#92400e'
    },
    outOfStock: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    features: {
      marginTop: '16px'
    },
    featureTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '12px'
    },
    featureList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    featureItem: {
      fontSize: '14px',
      color: '#6b7280',
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    button: {
      flex: 1,
      padding: '16px 24px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    buyNowButton: {
      background: 'linear-gradient(135deg, #4285F4, #3367D6)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    addToCartButton: {
      background: 'white',
      color: '#2563eb',
      border: '2px solid #2563eb'
    }
  };

  const getStockDisplay = () => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', style: styles.outOfStock };
    } else if (product.stock <= 10) {
      return { text: `Only ${product.stock} left in stock!`, style: styles.lowStock };
    } else {
      return { text: 'In Stock', style: styles.inStock };
    }
  };

  const stockDisplay = getStockDisplay();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <button 
          style={styles.closeButton}
          onClick={onClose}
          aria-label="Close quick view"
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
          }}
        >
          ×
        </button>

        <div style={styles.content}>
          <div style={styles.imageSection}>
            <OptimizedImage
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              width={400}
              height={400}
              style={styles.image}
            />
          </div>

          <div style={styles.detailsSection}>
            <div style={styles.category}>{product.category}</div>
            <h2 style={styles.title}>{product.name}</h2>
            
            {product.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProductRating rating={product.rating} />
                {product.numReviews > 0 && (
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    ({product.numReviews} reviews)
                  </span>
                )}
              </div>
            )}

            <p style={styles.description}>{product.description}</p>

            <div style={styles.priceSection}>
              <span style={styles.currentPrice}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span style={styles.originalPrice}>
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span style={styles.discountBadge}>-{discount}%</span>
                </>
              )}
            </div>

            <div style={{ ...styles.stockInfo, ...stockDisplay.style }}>
              {stockDisplay.text}
            </div>

            {product.brand && (
              <div style={styles.features}>
                <div style={styles.featureTitle}>Product Details</div>
                <ul style={styles.featureList}>
                  <li style={styles.featureItem}>
                    <span>🏷️</span>
                    <span>Brand: {product.brand}</span>
                  </li>
                  <li style={styles.featureItem}>
                    <span>📦</span>
                    <span>Category: {product.category}</span>
                  </li>
                  {product.price > 999 && (
                    <li style={styles.featureItem}>
                      <span>🚚</span>
                      <span>Free Shipping Available</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div style={styles.actions}>
              <button
                style={{ ...styles.button, ...styles.buyNowButton }}
                onClick={() => {
                  onBuyNow(product);
                  onClose();
                }}
                disabled={product.stock === 0}
                onMouseOver={(e) => {
                  if (product.stock > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Buy Now
              </button>
              <button
                style={{ ...styles.button, ...styles.addToCartButton }}
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={product.stock === 0}
                onMouseOver={(e) => {
                  if (product.stock > 0) {
                    e.currentTarget.style.background = '#eff6ff';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .modal {
            margin: 20px;
          }
          .content {
            grid-template-columns: 1fr !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductQuickView;
