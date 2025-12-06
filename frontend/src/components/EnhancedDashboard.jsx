import React from 'react';
import '../styles/design-system.css';

/**
 * EnhancedDashboard - Modern UI Design System Implementation
 * 
 * This component demonstrates the professional design system with:
 * - Modern color palette
 * - Professional typography
 * - Smooth animations
 * - Accessible interactions
 * - Responsive layout
 */

const EnhancedDashboard = () => {
  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      category: 'Smartphones',
      price: 1299,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1592286927505-c7d33fae0dcc?w=640',
      rating: 4.8,
      reviews: 1234,
      badge: 'SALE',
      inStock: true,
      stockCount: 23
    },
    {
      id: 2,
      name: 'MacBook Pro 16"',
      category: 'Laptops',
      price: 2499,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640',
      rating: 4.9,
      reviews: 856,
      badge: 'NEW',
      inStock: true,
      stockCount: 12
    },
    {
      id: 3,
      name: 'AirPods Pro 2',
      category: 'Audio',
      price: 249,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=640',
      rating: 4.7,
      reviews: 2341,
      badge: 'HOT',
      inStock: true,
      stockCount: 45
    },
    {
      id: 4,
      name: 'Sony A7 IV Camera',
      category: 'Cameras',
      price: 2499,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=640',
      rating: 4.9,
      reviews: 567,
      badge: 'LIMITED',
      inStock: true,
      stockCount: 5
    }
  ];

  const categories = [
    { name: 'All', icon: '🏪', active: true },
    { name: 'Smartphones', icon: '📱', active: false },
    { name: 'Laptops', icon: '💻', active: false },
    { name: 'Tablets', icon: '📱', active: false },
    { name: 'Audio', icon: '🎧', active: false },
    { name: 'Cameras', icon: '📷', active: false },
    { name: 'Gaming', icon: '🎮', active: false },
    { name: 'Wearables', icon: '⌚', active: false }
  ];

  const getBadgeStyle = (badge) => {
    const styles = {
      SALE: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: '0 4px 12px rgba(239, 68, 68, 0.3)' },
      NEW: { bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },
      HOT: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: '0 4px 12px rgba(245, 158, 11, 0.3)' },
      LIMITED: { bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }
    };
    return styles[badge] || styles.NEW;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientFlow 15s ease infinite'
    }}>
      {/* Navigation Bar */}
      <nav className="navbar animate-slide-up">
        <div className="navbar-container">
          <a href="#" className="navbar-logo">
            🛒 ElectroStore
          </a>
          
          <div style={{
            flex: 1,
            maxWidth: '500px',
            margin: '0 var(--space-8)',
            position: 'relative'
          }}>
            <input
              type="search"
              placeholder="Search products..."
              className="form-input"
              style={{
                paddingLeft: 'var(--space-12)',
                transition: 'all var(--transition-base)'
              }}
              aria-label="Search products"
            />
            <span style={{
              position: 'absolute',
              left: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'var(--text-lg)',
              color: 'var(--gray-400)'
            }}>
              🔍
            </span>
          </div>

          <div className="navbar-actions">
            <button className="btn btn-ghost" aria-label="View wishlist">
              ❤️ Wishlist
            </button>
            <button className="btn btn-ghost" aria-label="View cart" style={{ position: 'relative' }}>
              🛒 Cart
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--error)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--fw-bold)',
                boxShadow: 'var(--shadow-md)'
              }}>
                3
              </span>
            </button>
            <button className="btn btn-primary">
              👤 Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: 'var(--space-16) var(--space-6)',
        textAlign: 'center',
        color: 'white'
      }} className="animate-fade-in">
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-4xl)',
          fontWeight: 'var(--fw-extrabold)',
          marginBottom: 'var(--space-4)',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          Shop Premium Electronics
        </h1>
        <p style={{
          fontSize: 'var(--text-xl)',
          marginBottom: 'var(--space-8)',
          opacity: 0.95,
          maxWidth: '600px',
          margin: '0 auto var(--space-8)'
        }}>
          Discover the latest tech at unbeatable prices
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-lg" style={{
            background: 'white',
            color: 'var(--primary-purple)',
            fontWeight: 'var(--fw-bold)'
          }}>
            🛍️ Shop Now
          </button>
          <button className="btn btn-lg btn-ghost" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            🔥 View Deals
          </button>
        </div>
        <p style={{
          marginTop: 'var(--space-8)',
          fontSize: 'var(--text-sm)',
          opacity: 0.9
        }}>
          ⭐ 50,000+ Happy Customers | 🚚 Free Shipping | 💯 100% Secure
        </p>
      </section>

      {/* Category Filter */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 'var(--nav-height)',
        zIndex: 'var(--z-sticky)'
      }} className="animate-slide-up">
        <div className="container">
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {categories.map((category, index) => (
              <button
                key={index}
                className={`btn ${category.active ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                  animation: `slideUp var(--transition-slow) ease-out ${index * 0.05}s backwards`
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
        <div className="grid grid-cols-4" style={{ gap: 'var(--space-8)' }}>
          {products.map((product, index) => (
            <article
              key={product.id}
              className="card card-product animate-scale-in"
              style={{
                animationDelay: `${index * 0.1}s`,
                position: 'relative'
              }}
            >
              {/* Badge */}
              {product.badge && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-4)',
                  right: 'var(--space-4)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: getBadgeStyle(product.badge).bg,
                  color: 'white',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--fw-bold)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: getBadgeStyle(product.badge).shadow,
                  zIndex: 10,
                  letterSpacing: 'var(--tracking-wider)'
                }}>
                  {product.badge}
                </div>
              )}

              {/* Wishlist Button */}
              <button
                style={{
                  position: 'absolute',
                  top: 'var(--space-4)',
                  left: 'var(--space-4)',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all var(--transition-base)',
                  zIndex: 10
                }}
                className="btn-ghost"
                aria-label={`Add ${product.name} to wishlist`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                🤍
              </button>

              {/* Product Image */}
              <div className="card-product-image-wrapper">
                <img
                  src={product.image}
                  alt={`${product.name} - ${product.category}`}
                  className="card-product-image"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="card-product-content">
                <div className="card-product-category">
                  {product.category}
                </div>

                <h3 className="card-product-title">
                  {product.name}
                </h3>

                {/* Rating */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-3)'
                }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{
                        color: i < Math.floor(product.rating) ? '#f59e0b' : 'var(--gray-300)',
                        fontSize: '16px'
                      }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--gray-600)',
                    fontWeight: 'var(--fw-medium)'
                  }}>
                    {product.rating} ({product.reviews.toLocaleString()})
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div className="card-product-price">
                    ${product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && (
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--gray-500)',
                      textDecoration: 'line-through'
                    }}>
                      ${product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-4)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: product.stockCount < 10 ? 'var(--warning-light)' : 'var(--success-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--fw-semibold)',
                  color: product.stockCount < 10 ? 'var(--warning)' : 'var(--success)'
                }}>
                  {product.inStock ? '✓' : '✕'} 
                  {product.inStock 
                    ? `In Stock (${product.stockCount} left)` 
                    : 'Out of Stock'}
                </div>

                {/* Add to Cart Button */}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: 'var(--space-2)' }}
                  disabled={!product.inStock}
                >
                  🛒 Add to Cart
                </button>

                {/* View Details Link */}
                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                >
                  View Details →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        style={{
          position: 'fixed',
          bottom: 'var(--space-8)',
          right: 'var(--space-8)',
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary-gradient)',
          color: 'white',
          border: 'none',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-2xl)',
          transition: 'all var(--transition-base)',
          zIndex: 'var(--z-fixed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(360deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        }}
      >
        ↑
      </button>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;
