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
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 999;

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  useEffect(() => {
    loadCart();
  }, []);

  function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    if (newQuantity > 99) return;

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

  function handleRemove(productId, event) {
    const element = event.currentTarget.closest('.cart-item-row');
    if (element) {
      element.style.animation = 'none'; // reset
      // Trigger reflow
      void element.offsetWidth;
      element.classList.add('animate-slide-out-collapse');
      setTimeout(() => {
        removeFromCart(productId);
      }, 350);
    } else {
      removeFromCart(productId);
    }
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
      background: 'var(--gradient-navy-primary)',
      color: 'var(--text-primary)'
    },
    header: {
      background: 'rgba(16, 30, 53, 0.8)',
      backdropFilter: 'var(--glass-blur)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    logo: {
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      margin: 0,
      cursor: 'pointer',
      textShadow: '0 0 20px var(--accent-blue-glow)'
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
      backgroundColor: 'rgba(16, 30, 53, 0.6)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-md)'
    },
    cartGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px',
      alignItems: 'start'
    },
    cartItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    cartItem: {
      backgroundColor: 'rgba(16, 30, 53, 0.6)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
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
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255,255,255,0.05)',
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
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
      backgroundColor: 'rgba(16, 30, 53, 0.6)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
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
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
          <h1 style={styles.logo} onClick={() => window.location.hash = '#home'}>
            🏪 Sri Amman Traders
          </h1>
          <button style={styles.backBtn} onClick={() => window.location.hash = '#home'}>
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
        <h1 style={styles.logo} onClick={() => window.location.hash = '#home'}>
          🏪 Sri Amman Traders
        </h1>
        <button style={styles.backBtn} onClick={() => window.location.hash = '#home'}>
          ← Back to Shop
        </button>
      </div>

      <div style={styles.content}>
        <style>{`
          @media (max-width: 768px) {
            .cart-responsive-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <h1 style={styles.title}>Shopping Cart ({getTotalItems()} items)</h1>

        <div style={styles.cartGrid} className="cart-responsive-grid">
          {/* Cart Items */}
          <div style={styles.cartItems}>
            {cart.map((item, index) => (
              <div
                key={item._id}
                style={{ ...styles.cartItem, animationDelay: `${index * 0.1}s` }}
                className="card-hover-lift cart-item-row animate-staggered-glide"
                onMouseEnter={(e) => {
                  if (e.currentTarget.classList.contains('animate-slide-out-collapse')) return;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget.classList.contains('animate-slide-out-collapse')) return;
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
                    loading="lazy"
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
                    <span style={{ marginLeft: '12px', color: 'var(--text-primary)' }}>
                      Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    style={styles.removeBtn}
                    onClick={(e) => handleRemove(item._id, e)}
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

            {(() => {
              const subtotal = getTotalAmount();
              const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
              const amountToFree = FREE_SHIPPING_THRESHOLD - subtotal;
              const grandTotal = subtotal + shippingCost;
              return (
                <>
                  <div style={styles.summaryRow}>
                    <span>Items ({getTotalItems()})</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span>Shipping</span>
                    {shippingCost === 0
                      ? <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
                      : <span>₹{shippingCost.toFixed(2)}</span>
                    }
                  </div>

                  {shippingCost > 0 && (
                    <div style={{ fontSize: '13px', color: '#F59E0B', marginBottom: '8px', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
                      🚚 Add ₹{amountToFree.toFixed(2)} more for FREE delivery
                    </div>
                  )}

                  <div style={styles.summaryTotal}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-blue-primary)' }}>₹{grandTotal.toFixed(2)}</span>
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

                  {showClearConfirm ? (
                    <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '14px', color: '#FCA5A5', marginBottom: '12px', textAlign: 'center' }}>Clear all items from cart?</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                          onClick={() => { clearCart(); setShowClearConfirm(false); }}
                        >Yes, clear</button>
                        <button
                          style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                          onClick={() => setShowClearConfirm(false)}
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      style={styles.clearBtn}
                      onClick={() => setShowClearConfirm(true)}
                    >
                      Clear Cart
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
