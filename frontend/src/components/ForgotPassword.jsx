// client/src/components/ForgotPassword.jsx
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function submit(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setMsg('❌ Please enter a valid email address');
      return;
    }
    
    setMsg('Sending reset link...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      console.log('Forgot password response', res.status, data);
      
      if (!res.ok) throw new Error(data.msg || 'Failed to send reset link');
      
      setMsg('✅ ' + data.msg + ' Please check your email inbox and spam folder.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error', err);
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="forgot-password" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>🔑 Forgot Password</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form onSubmit={submit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email"
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      {msg && <p style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: msg.includes('✅') ? '#e8f5e9' : '#ffebee',
        color: msg.includes('✅') ? '#2e7d32' : '#c62828',
        borderRadius: '4px',
        fontSize: '14px'
      }}>{msg}</p>}
      
      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        <a href="#login" style={{ color: '#2196f3', textDecoration: 'none' }}>← Back to Login</a>
      </div>
    </div>
  );
}
