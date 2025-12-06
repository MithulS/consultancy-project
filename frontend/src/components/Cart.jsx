// Shopping Cart Component
import React, { useState, useEffect } from 'react';
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
      margin: 0,
      cursor: 'pointer'
    },
    backBtn: {
      padding: '8px 16px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '24px'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
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
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      gap: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    itemImage: {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '8px',
      backgroundColor: '#f9fafb'
    },
    itemDetails: {
      flex: 1
    },
    itemName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    itemPrice: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#5b21b6',
      marginBottom: '12px'
    },
    quantityControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    quantityBtn: {
      width: '32px',
      height: '32px',
      border: '2px solid #e5e7eb',
      backgroundColor: 'white',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    quantityInput: {
      width: '60px',
      padding: '8px',
      textAlign: 'center',
      border: '2px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600'
    },
    removeBtn: {
      padding: '8px 16px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '12px'
    },
    summary: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      height: 'fit-content',
      position: 'sticky',
      top: '100px'
    },
    summaryTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '20px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '16px',
      color: '#6b7280'
    },
    summaryTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '2px solid #e5e7eb',
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937'
    },
    checkoutBtn: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#5b21b6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background-color 0.2s'
    },
    clearBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'white',
      color: '#ef4444',
      border: '2px solid #ef4444',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '12px'
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
          <div style={styles.emptyCart}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Your cart is empty</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Add some products to get started!</p>
            <button 
              style={{...styles.checkoutBtn, width: 'auto', padding: '12px 32px'}}
              onClick={() => window.location.hash = '#dashboard'}
            >
              Continue Shopping
            </button>
          </div>
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
              <div key={item._id} style={styles.cartItem}>
                <img 
                  src={getImageUrl(item.imageUrl)} 
                  alt={item.name}
                  style={styles.itemImage}
                />
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
                    <span style={{ marginLeft: '12px', color: '#6b7280' }}>
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
              onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#5b21b6'}
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
