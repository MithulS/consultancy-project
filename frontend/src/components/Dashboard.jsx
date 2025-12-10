// Modern E-Commerce Dashboard - Product Showcase
import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import analytics from '../utils/analytics';
import { PRODUCT_CATEGORIES, CATEGORY_CONFIG, generateProductAltText } from '../utils/constants';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Inject CSS animations for modern UI
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes gradientFlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.02); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
if (!document.querySelector('[data-dashboard-styles]')) {
  styleSheet.setAttribute('data-dashboard-styles', 'true');
  document.head.appendChild(styleSheet);
}

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/300x300?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Use shared categories from constants
  const categories = ['All', ...PRODUCT_CATEGORIES];

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      analytics.setUser(JSON.parse(userData)._id || JSON.parse(userData).id, 'customer');
      analytics.pageView('dashboard-authenticated');
    } else {
      // Track as guest user
      setFirstTimeUser(true);
      analytics.pageView('dashboard-guest');
    }
    
    fetchProfile();
    fetchProducts();
    loadCart();
    
    // Check if there's a pending product from Google OAuth
    const pendingCartProduct = sessionStorage.getItem('pendingCartProduct');
    if (pendingCartProduct && token) {
      const product = JSON.parse(pendingCartProduct);
      addToCartAuthenticated(product);
      sessionStorage.removeItem('pendingCartProduct');
    }
    
    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true' && user) {
      setShowWelcome(true);
      sessionStorage.removeItem('justLoggedIn');
      
      setTimeout(() => {
        setShowWelcome(false);
      }, 4000);
    }
    
    // Track page load for analytics
    if (token) {
      analytics.track('dashboard_loaded_authenticated');
    } else {
      analytics.track('dashboard_loaded_guest');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error('Profile error:', err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError('');
      
      const query = new URLSearchParams();
      if (selectedCategory !== 'All') query.append('category', selectedCategory);
      if (searchTerm) query.append('search', searchTerm);
      
      // Add timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const res = await fetch(`${API}/api/products?${query}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products);
        setError(''); // Clear any previous errors
      } else {
        throw new Error(data.msg || 'Failed to load products');
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch products error:', err);
      
      // Provide helpful error messages based on error type
      if (err.name === 'AbortError') {
        setError('⏱️ Connection timeout. Retrying...');
        setTimeout(() => fetchProducts(), 2000); // Auto-retry after 2 seconds
      } else if (err.message.includes('Failed to fetch')) {
        setError('🔌 Cannot connect to server. Please ensure backend is running on port 5000.');
      } else {
        setError(`⚠️ ${err.message || 'Failed to load products. Please refresh the page.'}`);
      }
      setLoading(false);
    }
  }

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }

  function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Cart interceptor - prompts for login/register on first add to cart
  function addToCart(product) {
    const token = localStorage.getItem('token');
    
    // Check if user is logged in
    if (!token) {
      // Track cart abandonment attempt
      analytics.track('cart_abandoned_auth_required', {
        product: product.name,
        price: product.price,
        category: product.category
      });
      
      // Store pending product and show auth modal
      setPendingProduct(product);
      setShowAuthModal(true);
      
      // Show notification
      setNotificationMsg('⚠️ Please login or sign up to add items to cart');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
      
      return;
    }
    
    // User is logged in, proceed with adding to cart
    addToCartAuthenticated(product);
  }
  
  // Actually add product to cart (used when user is authenticated)
  function addToCartAuthenticated(product) {
    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Track cart addition
    analytics.track('product_added_to_cart', {
      product: product.name,
      price: product.price,
      category: product.category,
      cartSize: updatedCart.length
    });
    
    // Show notification
    setNotificationMsg(`✅ ${product.name} added to cart!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }
  
  // Handle successful authentication from modal
  function handleAuthSuccess(userData) {
    setUser(userData);
    setShowAuthModal(false);
    analytics.setUser(userData._id || userData.id, 'customer');
    analytics.track('user_authenticated_from_cart', {
      method: 'email',
      firstTimeUser: firstTimeUser
    });
    
    // Add the pending product to cart
    if (pendingProduct) {
      addToCartAuthenticated(pendingProduct);
      setPendingProduct(null);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Track logout
    analytics.track('user_logged_out');
    
    setUser(null);
    setCart([]);
    
    setTimeout(() => {
      window.location.hash = '#login';
    }, 100);
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientFlow 15s ease infinite',
      position: 'relative'
    },
    header: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
      padding: '20px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      animation: 'slideDown 0.6s ease-out',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
    },
    logo: {
      fontSize: '28px',
      fontWeight: '800',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    cartBtn: {
      position: 'relative',
      padding: '10px 20px',
      backgroundImage: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700'
    },
    ordersBtn: {
      padding: '10px 20px',
      backgroundImage: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
      transition: 'all 0.3s ease'
    },
    userName: {
      fontSize: '14px',
      color: '#1f2937',
      fontWeight: '500'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    adminBtn: {
      backgroundColor: '#5b21b6',
      color: 'white'
    },
    logoutBtn: {
      backgroundImage: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
    },
    filtersSection: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '28px 32px',
      margin: '24px 32px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
      animation: 'scaleIn 0.6s ease-out 0.2s backwards'
    },
    searchBar: {
      width: '100%',
      padding: '14px 20px 14px 48px',
      fontSize: '16px',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '12px',
      marginBottom: '20px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23667eea\' stroke-width=\'2\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cpath d=\'m21 21-4.35-4.35\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '16px center',
      backgroundSize: '20px'
    },
    categoryContainer: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    categoryBtn: {
      padding: '10px 24px',
      borderRadius: '24px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(102, 126, 234, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    categoryBtnActive: {
      backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      borderColor: 'transparent',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      transform: 'translateY(-2px)'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '28px',
      padding: '0 32px 48px'
    },
    productCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      animation: 'scaleIn 0.5s ease-out backwards'
    },
    productImage: {
      width: '100%',
      height: '280px',
      objectFit: 'cover',
      backgroundColor: '#f9fafb'
    },
    productInfo: {
      padding: '16px'
    },
    productCategory: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: '8px',
      fontWeight: '600'
    },
    productName: {
      fontSize: '19px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px',
      lineHeight: '1.4',
      letterSpacing: '-0.02em'
    },
    productDescription: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '16px',
      lineHeight: '1.6',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    price: {
      fontSize: '28px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.03em'
    },
    stockBadge: {
      fontSize: '12px',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600'
    },
    inStock: {
      backgroundImage: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      color: '#065f46',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
    },
    outOfStock: {
      backgroundImage: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      color: '#991b1b',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
    },
    addToCartBtn: {
      width: '100%',
      padding: '14px',
      backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    },
    notification: {
      position: 'fixed',
      top: '90px',
      right: '32px',
      backgroundImage: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '18px 28px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '600',
      fontSize: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  if (loading || isTransitioning) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo}>🔨 HomeHardware</h1>
        </div>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
          <h2>{isTransitioning ? 'Loading your dashboard...' : 'Loading products...'}</h2>
          {isTransitioning && <p style={{ color: '#667eea', marginTop: '8px' }}>Welcome back!</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🔨 HomeHardware</h1>
        <div style={styles.userSection}>
          {user && <span style={styles.userName}>👤 {user.name}</span>}
          <button 
            style={styles.ordersBtn}
            onClick={() => window.location.hash = '#profile'}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.3)';
            }}
          >
            👤 Profile
          </button>
          <button 
            style={styles.ordersBtn}
            onClick={() => window.location.hash = '#my-orders'}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            📦 My Orders
          </button>
          <button 
            style={styles.cartBtn}
            onClick={() => window.location.hash = '#cart'}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            🛒 Cart
            {getCartItemCount() > 0 && (
              <span style={styles.cartBadge}>{getCartItemCount()}</span>
            )}
          </button>
          <button 
            style={{...styles.button, ...styles.logoutBtn}}
            onClick={logout}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      {showWelcome && user && (
        <div style={{
          ...styles.notification,
          backgroundImage: 'linear-gradient(135deg, #10b981, #059669)',
          fontSize: '16px',
          padding: '16px 24px',
          animation: 'slideDown 0.5s ease-out'
        }}>
          🎉 Welcome back, {user.name}! Happy shopping!
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div style={styles.notification}>
          ✅ {notificationMsg}
        </div>
      )}

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <input
          type="text"
          placeholder="Search products..."
          style={styles.searchBar}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.2)';
            e.target.style.transform = 'scale(1.01)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'scale(1)';
          }}
        />
        <div style={styles.categoryContainer}>
          {categories.map(cat => (
            <button
              key={cat}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat ? styles.categoryBtnActive : {})
              }}
              onClick={() => setSelectedCategory(cat)}
              onMouseOver={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h2>No products found</h2>
          <p>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {products.map(product => (
            <div 
              key={product._id}
              style={{
                ...styles.productCard,
                animationDelay: `${products.indexOf(product) * 0.05}s`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              <div style={{ overflow: 'hidden', height: '280px' }}>
                <img 
                  src={getImageUrl(product.imageUrl)} 
                  alt={generateProductAltText(product)}
                  title={`${product.name}${product.brand ? ' by ' + product.brand : ''} - ₹${product.price}`}
                  style={{
                    ...styles.productImage,
                    transition: 'transform 0.4s ease'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x300?text=No+Image';
                    e.target.alt = `${product.name} - Image not available`;
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <div style={styles.productInfo}>
                <div style={styles.productCategory}>{product.category}</div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDescription}>{product.description}</p>
                <div style={styles.priceContainer}>
                  <span style={styles.price}>₹{product.price.toFixed(2)}</span>
                  <span style={{
                    ...styles.stockBadge,
                    ...(product.inStock ? styles.inStock : styles.outOfStock)
                  }}>
                    {product.inStock ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
                  </span>
                </div>
                <button 
                  style={{
                    ...styles.addToCartBtn,
                    backgroundImage: product.inStock ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                    cursor: product.inStock ? 'pointer' : 'not-allowed',
                    opacity: product.inStock ? 1 : 0.6
                  }}
                  disabled={!product.inStock}
                  onClick={() => product.inStock && addToCart(product)}
                  onMouseOver={(e) => {
                    if (product.inStock) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                      e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #764ba2, #667eea)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (product.inStock) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                      e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #667eea, #764ba2)';
                    }
                  }}
                >
                  {product.inStock ? '🛒 Add to Cart' : '😞 Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Auth Modal - Shows when user tries to add to cart without login */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingProduct(null);
          analytics.track('auth_modal_closed', { hadPendingProduct: !!pendingProduct });
        }}
        onAuthSuccess={handleAuthSuccess}
        pendingProduct={pendingProduct}
      />
    </div>
  );
}
