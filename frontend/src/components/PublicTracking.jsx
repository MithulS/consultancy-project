// Public Order Tracking - Track order by tracking number without login
import React, { useState } from 'react';
import OrderTracking from './OrderTracking';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PublicTracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTrack(e) {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    setTracking(null);

    try {
      const res = await fetch(`${API}/api/orders/public/track/${trackingNumber.trim()}`);
      const data = await res.json();

      if (data.success) {
        setTracking(data.tracking);
      } else {
        setError(data.msg || 'Invalid tracking number');
      }
    } catch (err) {
      console.error('Track order error:', err);
      setError('Failed to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '📦',
      packed: '📦',
      shipped: '🚚',
      out_for_delivery: '🛵',
      delivered: '✅',
      cancelled: '❌',
      returned: '↩️'
    };
    return icons[status] || '📋';
  }

  function getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      processing: '#4285F4',
      packed: '#8b5cf6',
      shipped: '#06b6d4',
      out_for_delivery: '#ec4899',
      delivered: '#22c55e',
      cancelled: '#ef4444',
      returned: '#f97316'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusProgress(status) {
    const progress = {
      pending: 10,
      confirmed: 20,
      processing: 40,
      packed: 50,
      shipped: 70,
      out_for_delivery: 90,
      delivered: 100,
      cancelled: 0,
      returned: 0
    };
    return progress[status] || 0;
  }

  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${API}${imageUrl}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <nav style={styles.nav}>
        <h1
          style={styles.logo}
          onClick={() => window.location.hash = '#dashboard'}
        >
          🛒 ElectroStore
        </h1>
        <button
          className="btn btn-ghost"
          onClick={() => window.location.hash = '#dashboard'}
        >
          🏠 Home
        </button>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        {!tracking ? (
          <div style={styles.searchCard}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📦</div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
              Track Your Order
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
              Enter your tracking number to see real-time updates
            </p>

            <form onSubmit={handleTrack} style={styles.form}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., TRK123456)"
                  style={styles.input}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ minWidth: '150px' }}
              >
                {loading ? '⏳ Tracking...' : '🔍 Track Order'}
              </button>
            </form>

            {error && (
              <div className="alert-error" style={{ marginTop: '24px' }}>
                ❌ {error}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.trackingCard}>
            {/* Back Button */}
            <button
              className="btn btn-ghost"
              onClick={() => {
                setTracking(null);
                setTrackingNumber('');
                setError('');
              }}
              style={{ alignSelf: 'flex-start', marginBottom: '24px' }}
            >
              ← Back to Search
            </button>

            {/* Status Header */}
            <div style={{
              ...styles.statusCard,
              backgroundColor: `${getStatusColor(tracking.currentStatus)}15`,
              borderLeft: `4px solid ${getStatusColor(tracking.currentStatus)}`
            }}>
              <div style={styles.statusCardContent}>
                <div style={{ fontSize: '48px' }}>
                  {getStatusIcon(tracking.currentStatus)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '24px',
                    color: getStatusColor(tracking.currentStatus),
                    textTransform: 'capitalize',
                    fontWeight: '700'
                  }}>
                    {tracking.currentStatus.replace(/_/g, ' ')}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Order #{tracking.orderNumber} • Tracking: <strong>{tracking.trackingNumber}</strong>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressBarContainer}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${getStatusProgress(tracking.currentStatus)}%`,
                    backgroundColor: getStatusColor(tracking.currentStatus)
                  }}
                />
              </div>
              <div style={{
                textAlign: 'right',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}>
                {getStatusProgress(tracking.currentStatus)}% Complete
              </div>
            </div>

            {/* Delivery Information */}
            {tracking.estimatedDelivery && (
              <div style={styles.infoCard}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Estimated Delivery
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {formatDateTime(tracking.estimatedDelivery)}
                </div>
              </div>
            )}

            {tracking.courierPartner?.name && (
              <div style={styles.infoCard}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚚</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Courier Partner
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {tracking.courierPartner.name}
                </div>
                {tracking.courierPartner.contactNumber && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    📞 {tracking.courierPartner.contactNumber}
                  </div>
                )}
              </div>
            )}

            {/* Tracking Timeline */}
            <div style={styles.timelineSection}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
                📍 Tracking History
              </h3>

              <div style={styles.timeline}>
                {tracking.trackingHistory && tracking.trackingHistory.length > 0 ? (
                  [...tracking.trackingHistory].reverse().map((entry, index) => (
                    <div
                      key={index}
                      style={styles.timelineItem}
                      className="animate-fadeIn"
                    >
                      <div style={{
                        ...styles.timelineIcon,
                        backgroundColor: getStatusColor(entry.status)
                      }}>
                        {getStatusIcon(entry.status)}
                      </div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineStatus}>
                          {entry.status.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        {entry.description && (
                          <div style={styles.timelineDescription}>
                            {entry.description}
                          </div>
                        )}
                        {entry.location && (
                          <div style={styles.timelineLocation}>
                            📍 {entry.location}
                          </div>
                        )}
                        <div style={styles.timelineTimestamp}>
                          {formatDateTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    No tracking history available yet
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div style={styles.itemsSection}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
                📦 Order Items
              </h3>
              {tracking.items.map((item, index) => (
                <div key={index} style={styles.itemCard}>
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    style={styles.itemImage}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Quantity: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Courier Link */}
            {tracking.courierPartner?.trackingUrl && (
              <a
                href={tracking.courierPartner.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                🔗 Track on Courier Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'transparent'
  },
  nav: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    padding: '16px 24px',
    borderBottom: '1px solid var(--glass-border)',
    boxShadow: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  searchCard: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '48px 32px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)'
  },
  form: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: 'transparent',
    color: 'var(--text-primary)'
  },
  trackingCard: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column'
  },
  statusCard: {
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  statusCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.5s ease-out',
    borderRadius: '9999px'
  },
  infoCard: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    marginBottom: '16px',
    color: 'var(--text-primary)'
  },
  timelineSection: {
    marginBottom: '24px'
  },
  timeline: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--border-subtle)'
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    position: 'relative'
  },
  timelineIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
    border: '3px solid white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  timelineContent: {
    flex: 1,
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  timelineStatus: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  timelineDescription: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '4px'
  },
  timelineLocation: {
    fontSize: '12px',
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: '4px'
  },
  timelineTimestamp: {
    fontSize: '11px',
    color: 'var(--text-tertiary)'
  },
  itemsSection: {
    marginBottom: '24px'
  },
  itemCard: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    marginBottom: '8px',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)'
  },
  itemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  }
};
