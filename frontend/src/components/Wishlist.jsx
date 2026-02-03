// Wishlist Component - Save products for later
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { getImageUrl } from '../utils/imageHandling';

export default function Wishlist({ onNavigate }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        sessionStorage.setItem('redirectAfterLogin', '#wishlist');
        setMessage('Please login to view wishlist');
        setTimeout(() => {
          window.location.hash = '#login';
        }, 2000);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.setItem('redirectAfterLogin', '#wishlist');
        setMessage('Please login to view wishlist');
        setTimeout(() => {
          window.location.hash = '#login';
        }, 2000);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setWishlist(data.wishlist.items || []);
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setMessage('✅ Removed from wishlist');
        fetchWishlist();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Remove error:', error);
      setMessage('❌ Failed to remove');
    }
  }

  async function addToCart(product, buyNow = false) {
    // Add to localStorage cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        _id: product._id, // Ensure consistent ID usage (Dashboard uses _id)
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1,
        stock: product.stock,
        category: product.category // Added for consistency
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    if (buyNow) {
      window.location.hash = '#checkout';
      return;
    }

    setMessage('✅ Added to cart');
    setTimeout(() => setMessage(''), 3000);
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>❤️ My Wishlist</h1>
        <p style={styles.subtitle}>{wishlist.length} items saved</p>
      </div>

      {/* Message */}
      {message && <div style={styles.message}>{message}</div>}

      {/* Empty State */}
      {wishlist.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💔</div>
          <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
          <p style={styles.emptyText}>Save your favorite products here</p>
          <button onClick={() => onNavigate('dashboard')} style={styles.shopBtn}>
            Start Shopping
          </button>
        </div>
      )}

      {/* Wishlist Grid */}
      <div style={styles.grid}>
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div key={product._id} style={styles.card}>
              <img
                src={getImageUrl(product.imageUrl)}
                alt={`${product.name}${product.brand ? ' by ' + product.brand : ''}, ₹${product.price}${product.stock > 0 ? ', In stock' : ', Out of stock'}`}
                title={`${product.name} - ${product.brand || 'No brand'} - ₹${product.price}`}
                style={styles.image}
              />

              <div style={styles.cardContent}>
                <h3 style={styles.productName}>{product.name}</h3>

                <div style={styles.priceRow}>
                  <span style={styles.price}>${product.price}</span>
                  <span style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                    {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                  </span>
                </div>

                <div style={styles.rating}>
                  {'⭐'.repeat(Math.round(product.rating || 0))}
                  <span style={styles.ratingText}>
                    {product.rating || 0} ({product.numReviews || 0} reviews)
                  </span>
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() => addToCart(product, true)}
                    disabled={product.stock === 0}
                    style={{
                      ...styles.buyNowBtn,
                      opacity: product.stock === 0 ? 0.5 : 1,
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⚡
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    style={{
                      ...styles.addToCartBtn,
                      opacity: product.stock === 0 ? 0.5 : 1,
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    style={styles.removeBtn}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'transparent',
    padding: '30px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  backBtn: {
    background: 'var(--glass-background)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    padding: '12px 24px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '20px',
    backdropFilter: 'var(--glass-blur)',
    transition: 'all 0.3s ease'
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '42px',
    margin: '10px 0',
    fontWeight: '800',
    textShadow: '0 0 20px rgba(46, 134, 222, 0.5)'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '18px'
  },
  message: {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '15px 20px',
    borderRadius: '15px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: '600',
    maxWidth: '500px',
    margin: '0 auto 20px'
  },
  loading: {
    color: 'white',
    textAlign: 'center',
    fontSize: '18px',
    padding: '50px'
  },
  empty: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '60px 40px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '50px auto',
    boxShadow: 'var(--shadow-lg)'
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '28px',
    color: 'var(--text-primary)',
    marginBottom: '10px'
  },
  emptyText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '30px'
  },
  shopBtn: {
    background: 'linear-gradient(135deg, #2e86de 0%, #2472c4 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px var(--accent-blue-glow)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  card: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: 'var(--shadow-md)'
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '20px'
  },
  productName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '15px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  price: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(160deg, #00d2ff 0%, #3a7bd5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 20px rgba(58, 123, 213, 0.3)'
  },
  inStock: {
    color: '#10b981',
    fontSize: '13px',
    fontWeight: '600'
  },
  outOfStock: {
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600'
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  ratingText: {
    color: 'var(--text-secondary)',
    fontSize: '13px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  addToCartBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  removeBtn: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '18px',
    cursor: 'pointer',
    minWidth: '50px',
    boxShadow: '0 4px 12px var(--accent-red-glow)'
  },
  buyNowBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
