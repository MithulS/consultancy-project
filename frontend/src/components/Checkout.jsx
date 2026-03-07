// Checkout Component
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

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

  const FREE_SHIPPING_THRESHOLD = 999;

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    country: 'India',
    paymentMethod: 'razorpay'
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
    if (!formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      setError('Please fill in all required shipping address fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        sessionStorage.setItem('redirectAfterLogin', '#checkout');
        setError('Please login to place an order. Click "Back to Cart" and login first.');
        setLoading(false);
        return;
      }

      // If payment method is Razorpay, use Razorpay checkout flow
      if (formData.paymentMethod === 'razorpay') {
        await handleRazorpayPayment(token);
        return;
      }

      // For COD and other methods, use the regular order flow
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
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
        setError(data.msg || data.error || 'Failed to place order. Please try again.');

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
        localStorage.removeItem('cart');
        setCart([]);
      } else {
        setError(data.msg || 'Failed to place order');

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

  async function handleRazorpayPayment(token) {
    try {
      // Step 1: Create Razorpay order on backend
      const createRes = await fetch(`${API}/api/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item._id,
            quantity: item.quantity
          })),
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
            country: formData.country
          }
        })
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(createData.msg || 'Failed to initiate payment');
        if (createData.unavailableItems) {
          const unavailableList = createData.unavailableItems
            .map(item => `${item.product}: requested ${item.requested}, available ${item.available}`)
            .join(', ');
          setError(`Some items are unavailable: ${unavailableList}`);
        }
        setLoading(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      const keyId = createData.key || RAZORPAY_KEY_ID;
      if (!keyId) {
        setError('Razorpay is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      if (!window.Razorpay) {
        setError('Payment gateway failed to load. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: createData.razorpayOrder.amount,
        currency: createData.razorpayOrder.currency,
        name: 'Sri Amman Traders',
        description: `Order Payment - ${cart.length} item(s)`,
        order_id: createData.razorpayOrder.id,
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch(`${API}/api/payments/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: createData.orderId
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setSuccess(true);
              setOrderId(verifyData.order._id);
              localStorage.removeItem('cart');
              setCart([]);
            } else {
              setError(verifyData.msg || 'Payment verification failed. Contact support with your order ID.');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setError('Payment verification failed. If amount was deducted, please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          contact: formData.phone
        },
        theme: {
          color: '#2E86DE'
        },
        modal: {
          ondismiss: function () {
            setError('Payment was cancelled. You can try again.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description || 'Please try again.'}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      setError('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'var(--gradient-navy-primary)',
      color: 'var(--text-primary)'
    },
    header: {
      backgroundColor: 'var(--glass-background)',
      color: 'var(--text-primary)',
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
      gap: '24px',
      alignItems: 'start'
    },
    formSection: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-secondary)',
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
      border: '1px solid var(--border-secondary)',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
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
      backgroundColor: 'rgba(255,255,255,0.05)', // Darker for select visibility
      color: 'var(--text-primary)',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none'
    },
    orderSummary: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-secondary)',
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
      background: 'linear-gradient(135deg, var(--accent-blue-primary) 0%, var(--accent-blue-active) 100%)',
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
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--border-radius-xl)',
      padding: '60px 40px',
      boxShadow: 'var(--shadow-xl)'
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.logo} onClick={() => window.location.hash = '#home'}>
            🏪 Sri Amman Traders
          </h1>
        </div>
        <div style={styles.content}>
          <div style={styles.successCard}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '16px' }}>
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
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--accent-blue-hover)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-blue-primary)'}
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
    <div className="checkout-container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo} onClick={() => window.location.hash = '#home'}>
          🏪 Sri Amman Traders
        </h1>
        <button style={styles.backBtn} onClick={() => window.location.hash = '#cart'}>
          ← Back to Cart
        </button>
      </div>

      <div style={styles.content}>
        <style>{`
          @media (max-width: 768px) {
            .checkout-grid { grid-template-columns: 1fr !important; }
            .checkout-grid > :last-child { position: static !important; top: auto !important; }
          }
        `}</style>
        <h1 style={styles.title}>Checkout</h1>

        {error && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            ❌ {error}
          </div>
        )}

        <div className="checkout-grid" style={styles.grid}>
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
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
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
                    <option value="razorpay" style={{ background: 'var(--navy-dark)', color: 'var(--text-primary)' }}>Pay Online (Razorpay - UPI, Cards, NetBanking)</option>
                    <option value="cod" style={{ background: 'var(--navy-dark)', color: 'var(--text-primary)' }}>Cash on Delivery</option>
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
                  loading="lazy"
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
              {getTotalAmount() >= FREE_SHIPPING_THRESHOLD
                ? <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>FREE</span>
                : <span>₹99.00</span>
              }
            </div>

            {getTotalAmount() < FREE_SHIPPING_THRESHOLD && (
              <div style={{ fontSize: '13px', color: '#F59E0B', marginBottom: '8px', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
                🚚 Add ₹{(FREE_SHIPPING_THRESHOLD - getTotalAmount()).toFixed(2)} more for FREE delivery
              </div>
            )}

            <div className="summaryTotal" style={styles.summaryTotal}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-blue-primary)' }}>₹{(getTotalAmount() + (getTotalAmount() >= FREE_SHIPPING_THRESHOLD ? 0 : 99)).toFixed(2)}</span>
            </div>

            <div className="mobile-fixed-btn-container">
              <button
                className="mobile-fixed-btn"
                style={{
                  ...styles.placeOrderBtn,
                  backgroundColor: loading ? '#9ca3af' : 'var(--accent-blue-primary)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onClick={handleSubmit}
                disabled={loading}
                onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
              >
                {loading ? 'Placing Order...' : `Place Order (₹${(getTotalAmount() + (getTotalAmount() >= FREE_SHIPPING_THRESHOLD ? 0 : 99)).toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

