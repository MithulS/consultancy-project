// Recently Viewed Products Component
import React, { useState, useEffect } from 'react';
import ProductRating from './ProductRating';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/200x200?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

// Utility functions for localStorage management
export const addToRecentlyViewed = (product) => {
  try {
    const MAX_RECENT_ITEMS = 12;
    let recentProducts = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove if already exists
    recentProducts = recentProducts.filter(p => p._id !== product._id);
    
    // Add to beginning
    recentProducts.unshift({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      viewedAt: new Date().toISOString()
    });
    
    // Keep only MAX items
    if (recentProducts.length > MAX_RECENT_ITEMS) {
      recentProducts = recentProducts.slice(0, MAX_RECENT_ITEMS);
    }
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentProducts));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem('recentlyViewed');
};

export default function RecentlyViewed({ onProductClick, currentProductId = null }) {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    loadRecentProducts();
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'recentlyViewed') {
        loadRecentProducts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadRecentProducts = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Filter out current product if viewing product detail
      const filtered = currentProductId 
        ? recent.filter(p => p._id !== currentProductId)
        : recent;
      setRecentProducts(filtered);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      setRecentProducts([]);
    }
  };

  const handleClear = () => {
    clearRecentlyViewed();
    setRecentProducts([]);
  };

  if (recentProducts.length === 0) return null;

  const styles = {
    container: {
      padding: '48px 32px',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      animation: 'fadeInUp 0.6s ease-out'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      maxWidth: '1400px',
      margin: '0 auto 24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    badge: {
      backgroundColor: '#4285F4',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      padding: '4px 12px',
      borderRadius: '12px'
    },
    clearBtn: {
      padding: '8px 16px',
      backgroundColor: 'transparent',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    scrollContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      overflowX: 'auto',
      paddingBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      minWidth: 'fit-content'
    },
    productCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '200px'
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: '180px',
      marginBottom: '12px',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f3f4f6'
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    recentBadge: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#ffffff',
      fontSize: '10px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '6px',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.5s ease-out 0.3s backwards'
    },
    productName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    price: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#4285F4'
    },
    originalPrice: {
      fontSize: '14px',
      color: '#9ca3af',
      textDecoration: 'line-through'
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const viewed = new Date(dateString);
    const diffMs = now - viewed;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .recent-product-card {
          animation: slideInRight 0.4s ease-out;
          animation-fill-mode: backwards;
        }
        .recent-product-card:nth-child(1) { animation-delay: 0.05s; }
        .recent-product-card:nth-child(2) { animation-delay: 0.1s; }
        .recent-product-card:nth-child(3) { animation-delay: 0.15s; }
        .recent-product-card:nth-child(4) { animation-delay: 0.2s; }
        .recent-product-card:nth-child(5) { animation-delay: 0.25s; }
        .recent-product-card:nth-child(6) { animation-delay: 0.3s; }
        .recent-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
        }
        .recent-product-card:hover img {
          transform: scale(1.05) rotate(1deg);
        }
        .clear-recent-btn:hover {
          background-color: #fee2e2 !important;
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }
        .recent-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .recent-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .recent-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .recent-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        @media (max-width: 768px) {
          .recent-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>
            <span>👁️ Recently Viewed</span>
            <span style={styles.badge}>{recentProducts.length}</span>
          </div>
          <button
            style={styles.clearBtn}
            className="clear-recent-btn"
            onClick={handleClear}
          >
            Clear History
          </button>
        </div>

        <div style={styles.scrollContainer} className="recent-scroll">
          <div style={styles.grid} className="recent-grid">
            {recentProducts.map(product => (
              <div
                key={product._id}
                style={styles.productCard}
                className="recent-product-card"
                onClick={() => onProductClick && onProductClick(product)}
              >
                <div style={styles.imageContainer}>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    style={styles.productImage}
                  />
                  <div style={styles.recentBadge}>
                    {getTimeAgo(product.viewedAt)}
                  </div>
                </div>
                <div style={styles.productName} title={product.name}>
                  {product.name}
                </div>
                <div style={styles.priceRow}>
                  <span style={styles.price}>${product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span style={styles.originalPrice}>
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.rating > 0 && (
                  <ProductRating 
                    rating={product.rating} 
                    reviewCount={product.reviewCount}
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
