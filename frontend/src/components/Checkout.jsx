// Checkout Component
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      window.location.hash = '#cart';
      return;
    }
    setCart(savedCart);
  }, []);

  function getTotalAmount() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.address || !formData.city || !formData.postalCode) {
      setError('Please fill in all shipping address fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        sessionStorage.setItem('redirectAfterLogin', '#checkout');
        setError('Please login to place an order');
        setLoading(false);
        setTimeout(() => {
          window.location.hash = '#login';
        }, 1500);
        return;
      }

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };

      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Order failed - Status:', res.status);
        console.error('Order failed - Response:', data);
        console.error('Order data sent:', orderData);
        setError(data.msg || data.error || 'Failed to place order. Please try again.');

        // Handle stock availability errors
        if (data.unavailableItems) {
          const unavailableList = data.unavailableItems
            .map(item => `${item.product}: requested ${item.requested}, available ${item.available}`)
            .join(', ');
          setError(`Some items are unavailable: ${unavailableList}`);
        }
        return;
      }

      if (data.success) {
        setSuccess(true);
        setOrderId(data.order._id);
        // Clear cart
        localStorage.removeItem('cart');
        setCart([]);
      } else {
        setError(data.msg || 'Failed to place order');

        // Handle stock availability errors
        if (data.unavailableItems) {
          const unavailableList = data.unavailableItems
            .map(item => `${item.product}: requested ${item.requested}, available ${item.available}`)
            .join(', ');
          setError(`Some items are unavailable: ${unavailableList}`);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'transparent'
    },
    header: {
      backgroundColor: 'var(--primary-brand)',
      color: 'var(--text-inverse)',
      borderBottom: 'none',
      boxShadow: 'var(--shadow-md)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
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
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px'
    },
    formSection: {
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '32px',
      boxShadow: 'var(--shadow-sm)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid var(--border-color)',
      backgroundColor: '#ffffff',
      color: 'var(--text-primary)',
      borderRadius: 'var(--border-radius-md)',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid var(--glass-border)',
      backgroundColor: 'rgba(0,0,0,0.2)', // Darker for select visibility
      color: 'var(--text-primary)',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none'
    },
    orderSummary: {
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '32px',
      boxShadow: 'var(--shadow-lg)',
      height: 'fit-content',
      position: 'sticky',
      top: '32px'
    },
    cartItem: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--glass-border)'
    },
    itemImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '6px',
      backgroundColor: 'rgba(255,255,255,0.05)'
    },
    itemDetails: {
      flex: 1
    },
    itemName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '4px'
    },
    itemPrice: {
      fontSize: '14px',
      color: 'var(--text-secondary)'
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
    placeOrderBtn: {
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
    alert: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    alertError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '2px solid #fca5a5'
    },
    alertSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '2px solid #6ee7b7'
    },
    successCard: {
      textAlign: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-xl)',
      padding: '60px 40px',
      boxShadow: 'var(--shadow-xl)'
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo} onClick={() => window.location.hash = '#dashboard'}>
            🛒 ElectroStore
          </h1>
        </div>
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-success)', marginBottom: '16px' }}>
              Order Placed Successfully!
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Your order has been received and is being processed.
            </p>
            <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '32px' }}>
              Order ID: <strong>{orderId}</strong>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                style={{ ...styles.placeOrderBtn, width: 'auto', padding: '12px 32px' }}
                onClick={() => window.location.hash = '#my-orders'}
                onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#5b21b6'}
              >
                View My Orders
              </button>
              <button
                style={{ ...styles.backBtn, padding: '12px 32px' }}
                onClick={() => window.location.hash = '#dashboard'}
              >
                Continue Shopping
              </button>
            </div>
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
        <button style={styles.backBtn} onClick={() => window.location.hash = '#cart'}>
          ← Back to Cart
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Checkout</h1>

        {error && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            ❌ {error}
          </div>
        )}

        <div style={styles.grid}>
          {/* Shipping Form */}
          <div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formSection}>
                <h2 style={styles.sectionTitle}>Shipping Address</h2>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address, apartment, suite, etc."
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal code"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={{ ...styles.formSection, marginTop: '24px' }}>
                <h2 style={styles.sectionTitle}>Payment Method</h2>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="cod" style={{ color: 'black' }}>Cash on Delivery</option>
                    <option value="gpay" style={{ color: 'black' }}>Google Pay</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div style={styles.orderSummary}>
            <h2 style={styles.sectionTitle}>Order Summary</h2>

            {cart.map(item => (
              <div key={item._id} style={styles.cartItem}>
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={`${item.name}, ₹${item.price}, Qty: ${item.quantity}`}
                  title={`${item.name} - ₹${item.price} x ${item.quantity}`}
                  style={styles.itemImage}
                />
                <div style={styles.itemDetails}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemPrice}>
                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: '600', color: 'var(--accent-blue-primary)' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>

            <div style={styles.summaryTotal}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-blue-primary)' }}>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <button
              style={{
                ...styles.placeOrderBtn,
                backgroundColor: loading ? '#9ca3af' : '#5b21b6',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleSubmit}
              disabled={loading}
              onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
            >
              {loading ? 'Placing Order...' : `Place Order (₹${getTotalAmount().toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
