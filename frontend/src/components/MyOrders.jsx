// My Orders Component - Enhanced with Design System
import React, { useState, useEffect } from 'react';
import OrderTracking from './OrderTracking';
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
        alert('✅ Order cancelled successfully');
        fetchOrders();
      } else {
        alert('❌ ' + data.msg);
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('❌ Failed to cancel order');
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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-50)' }}>
        <nav className="navbar">
          <h1 className="text-gradient" style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            🛒 ElectroStore
          </h1>
        </nav>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8)' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <div className="skeleton" style={{ width: '80px', height: '80px', margin: '0 auto var(--space-4)', borderRadius: 'var(--radius-full)' }}></div>
            <h2>Loading orders...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-50)' }}>
      {/* Navigation */}
      <nav className="navbar">
        <h1 
          className="text-gradient" 
          onClick={() => window.location.hash = '#dashboard'}
          style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '700', margin: 0 }}
        >
          🛒 ElectroStore
        </h1>
        <div className="flex items-center gap-4">
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.hash = '#cart'}
          >
            🛒 Cart
          </button>
          <button 
            className="btn btn-ghost"
            onClick={() => window.location.hash = '#dashboard'}
          >
            🏠 Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: '700', marginBottom: 'var(--space-6)' }}>
          My Orders
        </h1>

        {/* Status Filters */}
        <div className="flex gap-3" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '9999px' }}
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
          <div className="card animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>📦</div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-3)' }}>
              No orders found
            </h2>
            <p style={{ color: 'var(--neutral-600)', marginBottom: 'var(--space-6)' }}>
              {statusFilter === 'all' 
                ? 'You haven\'t placed any orders yet' 
                : `No ${statusFilter} orders`}
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => window.location.hash = '#dashboard'}
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
                  marginBottom: 'var(--space-6)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Order Header */}
                <div className="flex justify-between items-center" style={{ 
                  paddingBottom: 'var(--space-4)', 
                  borderBottom: '2px solid var(--neutral-200)',
                  marginBottom: 'var(--space-5)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--neutral-900)', marginBottom: 'var(--space-1)' }}>
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
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  {order.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex gap-4 transition-all"
                      style={{ 
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--neutral-50)'
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
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: 'var(--font-size-base)', 
                          fontWeight: '600', 
                          marginBottom: 'var(--space-1)',
                          color: 'var(--neutral-900)'
                        }}>
                          {item.name}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)', 
                          color: 'var(--neutral-600)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)} = <span className="text-gradient" style={{ fontWeight: '700' }}>₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div style={{ 
                  padding: 'var(--space-4)', 
                  backgroundColor: 'var(--neutral-100)', 
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-5)',
                  fontSize: 'var(--font-size-sm)',
                  borderLeft: '4px solid var(--primary-500)'
                }}>
                  <strong style={{ color: 'var(--neutral-900)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    📍 Shipping Address:
                  </strong>
                  <div style={{ color: 'var(--neutral-700)' }}>
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center" style={{ 
                  paddingTop: 'var(--space-4)', 
                  borderTop: '2px solid var(--neutral-200)' 
                }}>
                  <div className="text-gradient" style={{ 
                    fontSize: 'var(--font-size-2xl)', 
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-primary transition-all"
                      onClick={() => openTracking(order._id)}
                    >
                      📦 Track Order
                    </button>
                    {canCancel && (
                      <button 
                        className="btn btn-error transition-all"
                        onClick={() => cancelOrder(order._id)}
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
