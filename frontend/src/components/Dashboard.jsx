// Modern E-Commerce Dashboard - Product Showcase
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/300x300?text=No+Image';
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

  const categories = ['All', 'Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Cameras', 'Gaming', 'Wearables', 'Smart Home'];

  useEffect(() => {
    fetchProfile();
    fetchProducts();
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
      const query = new URLSearchParams();
      if (selectedCategory !== 'All') query.append('category', selectedCategory);
      if (searchTerm) query.append('search', searchTerm);
      
      const res = await fetch(`${API}/api/products?${query}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#login';
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa'
    },
    header: {
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    logo: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#5b21b6',
      margin: 0
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
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
      backgroundColor: '#ef4444',
      color: 'white'
    },
    filtersSection: {
      backgroundColor: 'white',
      padding: '24px 32px',
      marginBottom: '24px'
    },
    searchBar: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none'
    },
    categoryContainer: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    categoryBtn: {
      padding: '8px 20px',
      borderRadius: '20px',
      border: '2px solid #e5e7eb',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    categoryBtnActive: {
      backgroundColor: '#5b21b6',
      color: 'white',
      borderColor: '#5b21b6'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px',
      padding: '0 32px 32px'
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
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
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    productDescription: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '12px',
      lineHeight: '1.5',
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
      fontSize: '24px',
      fontWeight: '700',
      color: '#5b21b6'
    },
    stockBadge: {
      fontSize: '12px',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600'
    },
    inStock: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    outOfStock: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    addToCartBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#5b21b6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo}>🛒 ElectroStore</h1>
        </div>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🛒 ElectroStore</h1>
        <div style={styles.userSection}>
          {user && <span style={styles.userName}>👤 {user.name}</span>}
          <button 
            style={{...styles.button, ...styles.logoutBtn}}
            onClick={logout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          style={styles.searchBar}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              style={styles.productCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
            >
              <img 
                src={getImageUrl(product.imageUrl)} 
                alt={product.name}
                style={styles.productImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
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
                    backgroundColor: product.inStock ? '#5b21b6' : '#9ca3af',
                    cursor: product.inStock ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!product.inStock}
                  onMouseOver={(e) => {
                    if (product.inStock) e.target.style.backgroundColor = '#6d28d9';
                  }}
                  onMouseOut={(e) => {
                    if (product.inStock) e.target.style.backgroundColor = '#5b21b6';
                  }}
                >
                  {product.inStock ? '🛒 Add to Cart' : '😞 Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
