// User Profile Component - Edit profile, change password, view stats
import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import PasswordStrength from './PasswordStrength';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    wishlistItems: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('redirectAfterLogin', '#profile');
      window.location.hash = '#login';
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.setItem('redirectAfterLogin', '#profile');
        showToast('Please login to view profile', 'error');
        setTimeout(() => {
          window.location.hash = '#login';
        }, 1500);
        return;
      }

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email
        });
      }
      setLoading(false);
    } catch (err) {
      showToast('Failed to load profile', 'error');
      setLoading(false);
    }
  }

  async function fetchStats() {
    const token = localStorage.getItem('token');
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        fetch(`${API}/api/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API}/api/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (ordersRes.status === 401 || wishlistRes.status === 401) {
        return;
      }

      const ordersData = await ordersRes.json();
      const wishlistData = await wishlistRes.json();

      if (ordersData.success) {
        const orders = ordersData.orders || [];
        const completed = orders.filter(o => o.status === 'delivered');
        const totalSpent = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setStats({
          totalOrders: orders.length,
          completedOrders: completed.length,
          totalSpent,
          wishlistItems: wishlistData.success ? (wishlistData.wishlist?.items?.length || 0) : 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handlePasswordChange(e) {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setEditMode(false);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(data.msg || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showToast('Password changed successfully!', 'success');
      } else {
        showToast(data.msg || 'Failed to change password', 'error');
      }
    } catch (err) {
      showToast('Failed to change password', 'error');
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'transparent',
      padding: '40px 20px'
    },
    content: {
      maxWidth: '900px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      color: 'var(--text-primary)',
      marginBottom: '40px'
    },
    title: {
      fontSize: '36px',
      fontWeight: '800',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: 'var(--text-secondary)',
      opacity: 0.9
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '24px',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform 0.3s ease',
      cursor: 'default'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '800',
      color: 'var(--accent-blue-primary)',
      margin: '0 0 8px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: 'var(--text-secondary)',
      fontWeight: '600'
    },
    card: {
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '32px',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '24px'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--border-subtle)'
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: '700',
      margin: 0,
      color: 'var(--text-primary)'
    },
    infoGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-secondary)',
      marginBottom: '8px'
    },
    value: {
      fontSize: '16px',
      color: 'var(--text-primary)',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid var(--border-color)',
      background: 'var(--glass-background)',
      backdropFilter: 'var(--glass-blur)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--border-radius-md)',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      outline: 'none',
      fontFamily: 'inherit'
    },
    btnPrimary: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, var(--accent-blue-primary) 0%, var(--accent-blue-active) 100%)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--border-radius-md)',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: 'var(--shadow-md)'
    },
    btnSecondary: {
      padding: '12px 24px',
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-md)',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginLeft: '12px'
    },
    btnDanger: {
      background: 'linear-gradient(135deg, var(--accent-red-primary) 0%, var(--accent-red-active) 100%)',
      boxShadow: 'var(--shadow-md)'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '8px'
    },
    adminBadge: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white'
    },
    userBadge: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white'
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your account settings and preferences</p>
        </div>

        {/* Stats Grid */}
        <div style={styles.grid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalOrders}</div>
            <div style={styles.statLabel}>Total Orders</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.completedOrders}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>₹{stats.totalSpent.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.wishlistItems}</div>
            <div style={styles.statLabel}>Wishlist Items</div>
          </div>
        </div>

        {/* Profile Information */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              Profile Information
              <span style={{ ...styles.badge, ...(user?.role === 'admin' ? styles.adminBadge : styles.userBadge) }}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </h2>
            {!editMode && (
              <button
                style={styles.btnPrimary}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdate}>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div>
                <button type="submit" style={styles.btnPrimary}>Save Changes</button>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => {
                    setEditMode(false);
                    setFormData({ name: user.name, email: user.email });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Name</label>
                <div style={styles.value}>{user?.name}</div>
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.value}>{user?.email}</div>
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Member Since</label>
                <div style={styles.value}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Change Password */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Security</h2>
            {!passwordMode && !user?.googleId && (
              <button
                style={{ ...styles.btnPrimary, ...styles.btnDanger }}
                onClick={() => setPasswordMode(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {user?.googleId ? (
            <div style={{
              padding: '24px',
              backgroundColor: 'var(--glass-background-light)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                Google Account
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0'
              }}>
                You're signed in with Google. Your password is managed by Google.<br />
                To change your password, please visit your Google Account settings.
              </p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent-blue-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease',
                  boxShadow: '0 4px 12px var(--accent-blue-glow)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--accent-blue-active)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-blue-primary)'}
              >
                Manage Google Account →
              </a>
            </div>
          ) : passwordMode ? (
            <form onSubmit={handlePasswordUpdate}>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                  minLength="6"
                />
                {passwordData.newPassword && <PasswordStrength password={passwordData.newPassword} />}
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                  minLength="6"
                />
              </div>
              <div>
                <button type="submit" style={{ ...styles.btnPrimary, ...styles.btnDanger }}>
                  Update Password
                </button>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.infoGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.value}>••••••••</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

