// client/src/components/Login.jsx
import React, { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  async function submit(e) {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMsg('');
      return;
    }
    
    setErrors({});
    setMsg('Logging in...');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      console.log('Login response', res.status, data);
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMsg(`✅ Welcome back, ${data.user.name || data.user.email}!`);
      setForm({ email: '', password: '' });
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.hash = '#dashboard';
      }, 1000);
    } catch (err) {
      console.error('Login error', err);
      if (err.message === 'Email not verified') {
        setMsg('❌ Please verify your email first. Check the Verify OTP section.');
      } else {
        setMsg('❌ ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>🔐 Login</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email"
            placeholder="Email" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.email ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {errors.email && <small style={{ color: '#f44336' }}>{errors.email}</small>}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })} 
            style={{
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              borderRadius: '4px',
              border: errors.password ? '2px solid #f44336' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            required 
          />
          {errors.password && <small style={{ color: '#f44336' }}>{errors.password}</small>}
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
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
      
      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
        <a href="#forgot-password" style={{ color: '#2196f3', textDecoration: 'none' }}>Forgot Password?</a>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        <span style={{ color: '#666' }}>Don't have an account? </span>
        <a href="#register" style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 'bold' }}>Register here</a>
      </div>
    </div>
  );
}
