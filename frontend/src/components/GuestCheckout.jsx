// GuestCheckout.jsx - Allow users to checkout without creating account
import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function GuestCheckout({ cart, onComplete, onCancel }) {
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuestCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API}/api/orders/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestInfo: form,
          items: cart
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Order placed successfully! Check your email for confirmation.');
        localStorage.setItem('guestOrderId', data.orderId);

        setTimeout(() => {
          onComplete(data);
        }, 2000);
      } else {
        setMessage('❌ ' + data.msg);
      }
    } catch (err) {
      setMessage('❌ Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Guest Checkout</h2>
          <p style={styles.subtitle}>Complete your purchase without creating an account</p>
        </div>

        {/* Order Summary */}
        <div style={styles.orderSummary}>
          <h3 style={styles.summaryTitle}>Order Summary</h3>
          <div style={styles.items}>
            {cart.map((item, idx) => (
              <div key={idx} style={styles.item}>
                <span>{item.name} x {item.quantity}</span>
                <span style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={styles.total}>
            <strong>Total:</strong>
            <strong style={styles.totalAmount}>₹{total.toFixed(2)}</strong>
          </div>
        </div>

        {/* Save Account Suggestion */}
        <div style={styles.accountSuggestion}>
          <div style={styles.suggestionIcon}>💡</div>
          <div style={styles.suggestionContent}>
            <strong>Want to track your order easily?</strong>
            <p style={styles.suggestionText}>
              Create an account after checkout to track orders, save addresses, and get exclusive offers!
            </p>
          </div>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleGuestCheckout} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={styles.input}
              disabled={loading}
            />
            <small style={styles.hint}>Order confirmation will be sent here</small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Shipping Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address, apartment, suite, etc."
              required
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              disabled={loading}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>ZIP Code *</label>
              <input
                type="text"
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                placeholder="123456"
                required
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.benefits}>
            <h4 style={styles.benefitsTitle}>✨ What you get:</h4>
            <ul style={styles.benefitsList}>
              <li>Free shipping on orders above ₹1000</li>
              <li>7-day return policy</li>
              <li>Email order tracking</li>
              <li>Secure payment processing</li>
            </ul>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onCancel}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Place Order (₹${total.toFixed(2)})`}
            </button>
          </div>
        </form>

        {/* Create Account After Checkout */}
        {showCreateAccount && (
          <div style={styles.createAccountSection}>
            <p style={styles.createAccountText}>
              ✅ Order placed! Want to track it easily?
            </p>
            <button
              style={styles.createAccountBtn}
              onClick={() => {
                // Store guest email for easy registration
                sessionStorage.setItem('guestEmail', form.email);
                window.location.hash = '#register';
              }}
            >
              Create Account with {form.email}
            </button>
          </div>
        )}

        <p style={styles.privacyText}>
          Your information is secure. We'll only use it to process your order.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'transparent',
    padding: '30px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-xl)',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: 'var(--shadow-xl)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  orderSummary: {
    backgroundColor: 'var(--background-secondary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '16px',
    marginBottom: '24px',
    border: '1px solid var(--border-subtle)'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginTop: 0,
    marginBottom: '12px'
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--glass-border)'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  itemPrice: {
    fontWeight: '600',
    color: 'var(--accent-blue-primary)'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px',
    color: 'var(--text-primary)'
  },
  totalAmount: {
    color: 'var(--accent-blue-primary)'
  },
  accountSuggestion: {
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    border: '1px solid var(--glass-border)'
  },
  suggestionIcon: {
    fontSize: '24px'
  },
  suggestionContent: {
    flex: 1
  },
  suggestionText: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    color: 'var(--text-primary)',
    borderRadius: 'var(--border-radius-md)',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  benefits: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '8px',
    border: '1px solid var(--glass-border)'
  },
  benefitsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginTop: 0,
    marginBottom: '8px'
  },
  benefitsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.8'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  cancelBtn: {
    flex: 1,
    padding: '14px 16px',
    backgroundColor: 'transparent',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  submitBtn: {
    flex: 2,
    padding: '14px 16px',
    background: 'var(--gradient-cta)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'var(--shadow-md)'
  },
  createAccountSection: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid var(--glass-border)'
  },
  createAccountText: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  createAccountBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #2e86de 0%, #2472c4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px var(--accent-blue-glow)'
  },
  privacyText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginTop: '20px',
    lineHeight: '1.5'
  }
};
