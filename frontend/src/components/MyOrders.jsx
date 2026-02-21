// My Orders Component - Enhanced with Design System
import React, { useState, useEffect } from 'react';
import OrderTracking from './OrderTracking';
import Skeleton from './Skeleton';
import { showToast } from './ToastNotification';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Store the intended destination before redirecting
        sessionStorage.setItem('redirectAfterLogin', '#my-orders');
        setError('Please login to view your orders');
        setLoading(false);
        setTimeout(() => {
          window.location.replace('#login');
        }, 1000);
        return;
      }

      const res = await fetch(`${API}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.setItem('redirectAfterLogin', '#my-orders');
        setError('Session expired. Please login again');
        setLoading(false);
        setTimeout(() => {
          window.location.replace('#login');
        }, 1000);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.msg || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Cancelled by customer'
        })
      });

      const data = await res.json();

      if (data.success) {
        showToast('✅ Order cancelled successfully', 'success');
        fetchOrders();
      } else {
        showToast('❌ ' + data.msg, 'error');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      showToast('❌ Failed to cancel order', 'error');
    }
  }

  function getStatusBadgeClass(status) {
    const badges = {
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-error'
    };
    return badges[status] || 'badge-warning';
  }

  function openTracking(orderId) {
    setSelectedOrderId(orderId);
    setShowTracking(true);
  }

  function closeTracking() {
    setShowTracking(false);
    setSelectedOrderId(null);
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
        <nav style={{
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--glass-background)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h1 className="text-gradient" style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
            🛒 ElectroStore
          </h1>
        </nav>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
          <Skeleton type="text" width="60%" height="40px" style={{ marginBottom: '20px' }} />
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{
              padding: '32px',
              background: 'var(--glass-background)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Skeleton type="text" width="200px" height="24px" />
                <Skeleton type="text" width="100px" height="24px" />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <Skeleton type="image" width="80px" height="80px" style={{ borderRadius: '8px', marginBottom: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skeleton type="text" width="60%" height="24px" />
                  <Skeleton type="text" width="40%" height="20px" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <Skeleton type="text" width="150px" height="30px" />
                <Skeleton type="text" width="120px" height="40px" style={{ borderRadius: '8px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      {/* Navigation */}
      <nav style={{
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--glass-background)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '32px'
      }}>
        <h1
          className="text-gradient"
          onClick={() => window.location.hash = '#dashboard'}
          style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          🛒 ElectroStore
        </h1>
        <div className="flex items-center gap-4">
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => window.location.hash = '#cart'}
          >
            🛒 Cart
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => window.location.hash = '#dashboard'}
          >
            🏠 Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 32px 32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)' }}>
          My Orders
        </h1>

        {/* Status Filters */}
        <div className="flex gap-3" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                borderRadius: '9999px',
                padding: '10px 20px',
                background: statusFilter === status ? 'linear-gradient(135deg, var(--accent-blue-primary) 0%, var(--accent-blue-active) 100%)' : 'var(--glass-background)',
                backdropFilter: statusFilter === status ? 'none' : 'var(--glass-blur)',
                color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                border: statusFilter === status ? 'none' : '1px solid var(--border-secondary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: statusFilter === status ? 'var(--shadow-md)' : 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert-error" style={{ marginBottom: 'var(--space-6)' }}>
            ❌ {error}
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="card animate-fadeIn" style={{
            textAlign: 'center',
            padding: '64px',
            background: 'var(--glass-background)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              No orders found
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {statusFilter === 'all'
                ? 'You haven\'t placed any orders yet'
                : `No ${statusFilter} orders`}
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => window.location.hash = '#dashboard'}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #2e86de 0%, #2472c4 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px var(--accent-blue-glow)'
              }}
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          // Orders List
          filteredOrders.map((order, index) => {
            const badgeClass = getStatusBadgeClass(order.status);
            const canCancel = ['pending', 'processing'].includes(order.status);

            return (
              <div
                key={order._id}
                className="card animate-fadeIn shadow-md hover-lift transition-all"
                style={{
                  marginBottom: '24px',
                  animationDelay: `${index * 0.1}s`,
                  background: 'var(--glass-background)',
                  backdropFilter: 'var(--glass-blur)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="flex justify-between items-center" style={{
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--glass-border)',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div>📅 Placed: {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</div>
                    {order.deliveredAt && (
                      <div>✅ Delivered: {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</div>
                    )}
                  </div>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Order Items */}
                <div style={{ marginBottom: '20px' }}>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 transition-all"
                      style={{
                        marginBottom: '16px',
                        padding: '16px',
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: 'var(--glass-background-light)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={`${item.name}, ₹${item.price}, Qty: ${item.quantity}`}
                        title={`${item.name} - ₹${item.price} x ${item.quantity}`}
                        className="rounded-lg shadow-sm"
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          backgroundColor: 'rgba(255,255,255,0.05)'
                        }}
                        loading="lazy"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px',
                          color: 'var(--text-primary)'
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace'
                        }}>
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)} = <span className="text-gradient" style={{ fontWeight: '700', color: 'var(--accent-blue-primary)' }}>₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div style={{
                  padding: '20px',
                  backgroundColor: 'var(--glass-background-light)',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: '24px',
                  fontSize: '14px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    📍 Shipping Address:
                  </strong>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center" style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--glass-border)'
                }}>
                  <div className="text-gradient" style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    color: 'var(--accent-blue-primary)'
                  }}>
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      className="btn btn-primary transition-all"
                      onClick={() => openTracking(order._id)}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, var(--accent-blue-primary) 0%, var(--accent-blue-active) 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-md)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-md)',
                        fontWeight: '600'
                      }}
                    >
                      📦 Track Order
                    </button>
                    {canCancel && (
                      <button
                        className="btn btn-error transition-all"
                        onClick={() => cancelOrder(order._id)}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, var(--accent-red-primary) 0%, var(--accent-red-active) 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--border-radius-md)',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-md)',
                          fontWeight: '600'
                        }}
                      >
                        ❌ Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Tracking Modal */}
      {showTracking && selectedOrderId && (
        <OrderTracking
          orderId={selectedOrderId}
          onClose={closeTracking}
        />
      )}
    </div>
  );
}

