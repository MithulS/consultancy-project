// client/src/components/VerifyOTP.jsx
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyOTP() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function verify(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setMsg('❌ Invalid email format');
      return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setMsg('❌ OTP must be 6 digits');
      return;
    }
    
    setMsg('Verifying...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      console.log('Verify response', res.status, data);
      if (!res.ok) throw new Error(data.msg || 'Verification failed');
      setMsg('✅ Email verified successfully! You can now login.');
      setEmail('');
      setOtp('');
    } catch (err) {
      console.error('Verify error', err);
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!validateEmail(email)) {
      setMsg('❌ Please enter a valid email first');
      return;
    }
    
    setMsg('Resending OTP...');
    setResending(true);
    
    try {
      const res = await fetch(`${API}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      console.log('Resend response', res.status, data);
      if (!res.ok) throw new Error(data.msg || 'Resend failed');
      setMsg('✅ OTP resent to your email. Please check your inbox.');
    } catch (err) {
      console.error('Resend error', err);
      setMsg('❌ ' + err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>✉️ Verify OTP</h3>
      <form onSubmit={verify}>
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
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            placeholder="6-digit OTP" 
            value={otp} 
            onChange={e => setOtp(e.target.value.slice(0, 6))} 
            maxLength="6"
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              boxSizing: 'border-box',
              letterSpacing: '4px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
            required 
          />
          <small style={{ color: '#666', fontSize: '12px' }}>Enter the 6-digit code sent to your email</small>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              flex: 1,
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
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button 
            type="button" 
            onClick={resend}
            disabled={resending || !email}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: (resending || !email) ? '#ccc' : '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (resending || !email) ? 'not-allowed' : 'pointer'
            }}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </form>
      {msg && <p style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: msg.includes('✅') ? '#e8f5e9' : '#ffebee',
        color: msg.includes('✅') ? '#2e7d32' : '#c62828',
        borderRadius: '4px',
        fontSize: '14px'
      }}>{msg}</p>}
    </div>
  );
}
