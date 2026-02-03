// Shopping Cart Component
import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/80x80?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  function removeFromCart(productId) {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem('cart');
  }

  function getTotalAmount() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function getTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'transparent'
    },
    header: {
      backgroundColor: 'var(--primary-brand)',
      color: 'var(--text-inverse)',
      boxShadow: 'var(--shadow-md)',
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
      color: 'var(--text-primary)',
      margin: 0,
      cursor: 'pointer',
      textShadow: '0 0 20px rgba(46, 134, 222, 0.5)'
    },
    backBtn: {
      padding: '10px 20px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 'var(--border-radius-md)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '24px'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-sm)'
    },
    cartGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px'
    },
    cartItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    cartItem: {
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '24px',
      display: 'flex',
      gap: '24px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.3s ease'
    },
    itemImage: {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '8px',
      backgroundColor: 'rgba(255,255,255,0.05)'
    },
    itemDetails: {
      flex: 1
    },
    itemName: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    itemPrice: {
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--accent-blue-primary)',
      marginBottom: '12px',
      textShadow: '0 0 10px var(--accent-blue-subtle)'
    },
    quantityControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    quantityBtn: {
      width: '32px',
      height: '32px',
      border: '1px solid var(--glass-border)',
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: 'var(--text-primary)',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    quantityInput: {
      width: '60px',
      padding: '8px',
      textAlign: 'center',
      border: '1px solid var(--glass-border)',
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600'
    },
    removeBtn: {
      padding: '8px 16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      border: '1px solid #ef4444',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '12px',
      transition: 'all 0.2s'
    },
    summary: {
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '32px',
      boxShadow: 'var(--shadow-lg)',
      height: 'fit-content',
      position: 'sticky',
      top: '100px'
    },
    summaryTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '20px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '16px',
      color: 'var(--text-secondary)'
    },
    summaryTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid var(--glass-border)',
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--text-primary)'
    },
    checkoutBtn: {
      width: '100%',
      padding: '16px',
      background: 'var(--gradient-cta)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--border-radius-md)',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '24px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'var(--shadow-md)'
    },
    clearBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '12px',
      transition: 'all 0.2s'
    }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo} onClick={() => window.location.hash = '#dashboard'}>
            🛒 ElectroStore
          </h1>
          <button style={styles.backBtn} onClick={() => window.location.hash = '#dashboard'}>
            ← Back to Shop
          </button>
        </div>
        <div style={styles.content}>
          <EmptyState
            type="cart"
            onAction={() => window.location.hash = '#dashboard'}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo} onClick={() => window.location.hash = '#dashboard'}>
          🛒 ElectroStore
        </h1>
        <button style={styles.backBtn} onClick={() => window.location.hash = '#dashboard'}>
          ← Back to Shop
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Shopping Cart ({getTotalItems()} items)</h1>

        <div style={styles.cartGrid}>
          {/* Cart Items */}
          <div style={styles.cartItems}>
            {cart.map(item => (
              <div 
                key={item._id} 
                style={styles.cartItem}
                className="card-hover-lift"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div className="image-zoom-container" style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    style={styles.itemImage}
                    className="image-zoom"
                  />
                </div>
                <div style={styles.itemDetails}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <div style={styles.itemPrice}>₹{item.price.toFixed(2)}</div>

                  <div style={styles.quantityControl}>
                    <button
                      style={styles.quantityBtn}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                      style={styles.quantityInput}
                      min="1"
                    />
                    <button
                      style={styles.quantityBtn}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>
                      Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    style={styles.removeBtn}
                    onClick={() => removeFromCart(item._id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>

            <div style={styles.summaryRow}>
              <span>Items ({getTotalItems()})</span>
              <span>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>

            <div style={styles.summaryTotal}>
              <span>Total</span>
              <span style={{ color: '#5b21b6' }}>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <button
              style={styles.checkoutBtn}
              onClick={() => window.location.hash = '#checkout'}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px var(--accent-red-glow)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px var(--accent-red-glow)';
              }}
            >
              Proceed to Checkout
            </button>

            <button
              style={styles.clearBtn}
              onClick={() => {
                if (confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
                }
              }}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
