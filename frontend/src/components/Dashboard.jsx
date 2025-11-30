// client/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found. Please login first.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Failed to fetch profile');
      }
      
      setUser(data.user);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message);
      
      // Clear invalid token
      if (err.message.includes('Token') || err.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError('Logged out successfully');
    
    // Redirect to login after 1 second
    setTimeout(() => {
      window.location.hash = '#login';
    }, 1000);
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
        <p style={{ color: '#c62828', margin: 0 }}>❌ {error}</p>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <a href="#login" style={{ color: '#2196f3', textDecoration: 'none' }}>← Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>👤 User Dashboard</h3>
      
      {user ? (
        <div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '6px',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Name:</strong> {user.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Email:</strong> {user.email}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> {' '}
              <span style={{ 
                color: user.isVerified ? '#4caf50' : '#ff9800',
                fontWeight: 'bold'
              }}>
                {user.isVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <button 
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please login to view your dashboard.</p>
      )}
      
      {error && user && (
        <p style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
