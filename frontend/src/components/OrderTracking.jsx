// Order Tracking Component - Comprehensive real-time order tracking with interactive timeline
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function OrderTracking({ orderId, onClose }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchTracking();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTracking(true); // Silent refresh
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, autoRefresh]);

  async function fetchTracking(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setTracking(data.tracking);
        setError('');
      } else {
        setError(data.msg || 'Failed to load tracking information');
      }
    } catch (err) {
      console.error('Fetch tracking error:', err);
      if (!silent) {
        setError('Failed to load tracking information');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  function getStatusLabel(status) {
    const labels = {
      pending: 'Order Confirmed', // specific requirement: initial status
      confirmed: 'Order Confirmed',
      processing: 'Order Confirmed', // Show confirmed until shipped
      packed: 'Order Confirmed',     // Show confirmed until shipped
      shipped: 'Order Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled',
      returned: 'Order Returned'
    };
    return labels[status] || status.replace(/_/g, ' ');
  }

  function getStatusIcon(status) {
    const icons = {
      pending: '✅',
      confirmed: '✅',
      processing: '✅', // visual consistency
      packed: '✅',
      shipped: '🚚',
      out_for_delivery: '🛵',
      delivered: '📦',
      cancelled: '❌',
      returned: '↩️'
    };
    return icons[status] || '📋';
  }

  function getStatusColor(status) {
    const colors = {
      pending: '#10b981', // green for confirmed
      confirmed: '#10b981',
      processing: '#10b981',
      packed: '#10b981',
      shipped: '#3b82f6', // blue
      out_for_delivery: '#f59e0b', // orange/amber
      delivered: '#22c55e', // green
      cancelled: '#ef4444',
      returned: '#f97316'
    };
    return colors[status] || '#6b7280';
  }

  function getStatusProgress(status) {
    const progress = {
      pending: 25,
      confirmed: 25,
      processing: 25,
      packed: 25,
      shipped: 50,
      out_for_delivery: 75,
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

  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h2>Loading tracking information...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2>{error}</h2>
            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ marginTop: '20px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProgress = getStatusProgress(tracking.currentStatus);
  const statusColor = getStatusColor(tracking.currentStatus);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              📦 Order Tracking
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Order #{tracking.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            style={styles.closeButton}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Current Status Card */}
          <div style={{
            ...styles.statusCard,
            backgroundColor: `${statusColor}15`,
            borderLeft: `4px solid ${statusColor}`
          }}>
            <div style={styles.statusCardContent}>
              <div style={{ fontSize: '48px' }}>
                {getStatusIcon(tracking.currentStatus)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  color: statusColor,
                  textTransform: 'capitalize',
                  fontWeight: '700'
                }}>
                  {getStatusLabel(tracking.currentStatus)}
                </h3>
                {tracking.trackingNumber && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Tracking: <strong>{tracking.trackingNumber}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${currentProgress}%`,
                  backgroundColor: statusColor
                }}
              />
            </div>
            <div style={{
              textAlign: 'right',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }}>
              {currentProgress}% Complete
            </div>
          </div>

          {/* Delivery Information */}
          <div style={styles.infoGrid}>
            {tracking.estimatedDelivery && (
              <div style={styles.infoCard}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Estimated Delivery
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {formatDateTime(tracking.estimatedDelivery)}
                </div>
              </div>
            )}

            {tracking.actualDelivery && (
              <div style={styles.infoCard}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Delivered On
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {formatDateTime(tracking.actualDelivery)}
                </div>
              </div>
            )}

            {tracking.courierPartner?.name && (
              <div style={styles.infoCard}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚚</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Courier Partner
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>
                  {tracking.courierPartner.name}
                </div>
                {tracking.courierPartner.contactNumber && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    📞 {tracking.courierPartner.contactNumber}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div style={styles.timelineSection}>
            <div style={styles.timelineHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                📍 Tracking History
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Auto-refresh
              </label>
            </div>

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
                        {getStatusLabel(entry.status)}
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
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
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
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                  ₹{(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div style={styles.addressCard}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>
              📍 Shipping Address
            </h3>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {tracking.shippingAddress.address}<br />
              {tracking.shippingAddress.city}, {tracking.shippingAddress.postalCode}<br />
              {tracking.shippingAddress.country}
            </div>
          </div>

          {/* Courier Tracking Link */}
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

          {/* Refresh Button */}
          <button
            className="btn btn-secondary"
            onClick={() => fetchTracking()}
            style={{ width: '100%' }}
          >
            🔄 Refresh Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-xl)',
    animation: 'slideUp 0.3s ease-out'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
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
    background: 'var(--glass-background)',
    border: '1px solid var(--glass-border)',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.5s ease-out',
    borderRadius: '9999px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  infoCard: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)'
  },
  timelineSection: {
    marginBottom: '24px'
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  timeline: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--glass-border)'
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
    borderBottom: '1px solid var(--glass-border)'
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
    color: 'var(--color-accent-purple)',
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
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)'
  },
  itemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  addressCard: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    marginBottom: '16px',
    color: 'var(--text-primary)'
  }
};
