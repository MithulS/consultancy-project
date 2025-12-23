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
      backgroundColor: '#f5f7fa'
    },
    header: {
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
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
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px'
    },
    formSection: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      backgroundColor: 'white'
    },
    orderSummary: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      height: 'fit-content',
      position: 'sticky',
      top: '32px'
    },
    cartItem: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e5e7eb'
    },
    itemImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '6px',
      backgroundColor: '#f9fafb'
    },
    itemDetails: {
      flex: 1
    },
    itemName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    itemPrice: {
      fontSize: '14px',
      color: '#6b7280'
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
    placeOrderBtn: {
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
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '60px 40px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
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
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '16px' }}>
              Order Placed Successfully!
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              Your order has been received and is being processed.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px' }}>
              Order ID: <strong>{orderId}</strong>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                style={{...styles.placeOrderBtn, width: 'auto', padding: '12px 32px'}}
                onClick={() => window.location.hash = '#my-orders'}
                onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#5b21b6'}
              >
                View My Orders
              </button>
              <button 
                style={{...styles.backBtn, padding: '12px 32px'}}
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
          <div style={{...styles.alert, ...styles.alertError}}>
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

              <div style={{...styles.formSection, marginTop: '24px'}}>
                <h2 style={styles.sectionTitle}>Payment Method</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="gpay">Google Pay</option>
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
                <div style={{ fontWeight: '600', color: '#5b21b6' }}>
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
              <span style={{ color: '#5b21b6' }}>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <button 
              style={{
                ...styles.placeOrderBtn,
                backgroundColor: loading ? '#9ca3af' : '#5b21b6',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleSubmit}
              disabled={loading}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#6d28d9')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#5b21b6')}
            >
              {loading ? 'Placing Order...' : `Place Order (₹${getTotalAmount().toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
