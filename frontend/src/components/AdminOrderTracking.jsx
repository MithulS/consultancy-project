// Admin Order Management Component - Manage and update order tracking
import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './ToastNotification';
import { useFocusTrap } from '../hooks/useFocusTrap';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    location: '',
    description: '',
    estimatedDelivery: '',
    courierName: '',
    courierContact: '',
    courierTrackingUrl: '',
    trackingNumber: ''
  });

  const modalRef = useRef(null);
  useFocusTrap(modalRef, showUpdateModal, closeUpdateModal);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/orders?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  function openUpdateModal(order) {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      location: '',
      description: '',
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().slice(0, 16) : '',
      courierName: order.courierPartner?.name || '',
      courierContact: order.courierPartner?.contactNumber || '',
      courierTrackingUrl: order.courierPartner?.trackingUrl || '',
      trackingNumber: order.trackingNumber || ''
    });
    setShowUpdateModal(true);
  }

  function closeUpdateModal() {
    setShowUpdateModal(false);
    setSelectedOrder(null);
    setUpdateForm({
      status: '',
      location: '',
      description: '',
      estimatedDelivery: '',
      courierName: '',
      courierContact: '',
      courierTrackingUrl: '',
      trackingNumber: ''
    });
  }

  async function handleBulkUpdate(newStatus) {
    if (!confirm(`Are you sure you want to mark ${selectedOrders.length} orders as ${newStatus.replace(/_/g, ' ')}?`)) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const token = localStorage.getItem('token');

      for (const orderId of selectedOrders) {
        try {
          const res = await fetch(`${API}/api/orders/${orderId}/tracking/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          const data = await res.json();
          if (data.success) successCount++;
          else failCount++;
        } catch (err) {
          failCount++;
        }
      }

      showToast(`Bulk update: ${successCount} successful, ${failCount} failed`, successCount > 0 ? 'success' : 'error');
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      console.error('Bulk update error:', err);
      showToast('❌ Bulk update process failed', 'error');
      setLoading(false);
    }
  }

  async function handleUpdateTracking(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const payload = {
        status: updateForm.status,
        location: updateForm.location,
        description: updateForm.description,
        estimatedDelivery: updateForm.estimatedDelivery || undefined,
        trackingNumber: updateForm.trackingNumber || undefined,
        courierPartner: {
          name: updateForm.courierName,
          contactNumber: updateForm.courierContact,
          trackingUrl: updateForm.courierTrackingUrl
        }
      };

      const res = await fetch(`${API}/api/orders/${selectedOrder._id}/tracking/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        showToast('✅ Tracking updated successfully', 'success');
        closeUpdateModal();
        fetchOrders();
      } else {
        showToast('❌ ' + data.msg, 'error');
      }
    } catch (err) {
      console.error('Update tracking error:', err);
      showToast('❌ Failed to update tracking', 'error');
    }
  }

  async function generateTrackingNumber(orderId) {
    if (!confirm('Generate a new tracking number for this order?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/orders/${orderId}/tracking/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        showToast(`✅ Tracking number generated: ${data.trackingNumber}`, 'success');
        fetchOrders();
      } else {
        showToast('❌ ' + data.msg, 'error');
      }
    } catch (err) {
      console.error('Generate tracking number error:', err);
      showToast('❌ Failed to generate tracking number', 'error');
    }
  }

  function getStatusBadgeClass(status) {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      processing: 'badge-info',
      packed: 'badge-info',
      shipped: 'badge-primary',
      out_for_delivery: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-error',
      returned: 'badge-error'
    };
    return badges[status] || 'badge-warning';
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          📦 Order Tracking Management
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage and update order tracking information
        </p>
      </div>

      {/* Status Filters & Bulk Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '9999px', textTransform: 'capitalize' }}
              onClick={() => {
                setStatusFilter(status);
                setSelectedOrders([]); // Clear selection on filter change
              }}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Bulk Actions UI */}
        {selectedOrders.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: '#f3f4f6',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              {selectedOrders.length} selected
            </span>
            <select
              className="form-control"
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}
              onChange={(e) => {
                if (e.target.value) handleBulkUpdate(e.target.value);
                e.target.value = ''; // Reset select after action
              }}
            >
              <option value="">Bulk Update Status...</option>
              <option value="confirmed">Mark as Confirmed</option>
              <option value="processing">Mark as Processing</option>
              <option value="packed">Mark as Packed</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
            </select>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert-error" style={{ marginBottom: '24px' }}>
          ❌ {error}
        </div>
      )}

      {/* Orders Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tracking #</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: selectedOrders.includes(order._id) ? '#f0f9ff' : 'transparent' }}>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '14px' }}>{order.user?.name || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.user?.email}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{order.items.length} items</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ fontSize: '11px' }}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {order.trackingNumber ? (
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          backgroundColor: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {order.trackingNumber}
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => generateTrackingNumber(order._id)}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          Generate
                        </button>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openUpdateModal(order)}
                        style={{ fontSize: '12px' }}
                      >
                        📝 Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedOrder && (
        <div style={styles.overlay} onClick={closeUpdateModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()} ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div style={styles.modalHeader}>
              <h2 id="modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Update Order Tracking
              </h2>
              <button onClick={closeUpdateModal} style={styles.closeButton}>✕</button>
            </div>

            <form onSubmit={handleUpdateTracking} style={styles.modalBody}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Order Status *</label>
                <select
                  className="form-control"
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  required
                  style={styles.input}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={updateForm.location}
                  onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                  placeholder="e.g., Mumbai Warehouse, Chennai Hub"
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Description</label>
                <textarea
                  className="form-control"
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  placeholder="Describe the current status update..."
                  rows="3"
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Tracking Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={updateForm.trackingNumber}
                  onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })}
                  placeholder="e.g., TRK123456789"
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Estimated Delivery</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={updateForm.estimatedDelivery}
                  onChange={(e) => setUpdateForm({ ...updateForm, estimatedDelivery: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Courier Partner Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={updateForm.courierName}
                  onChange={(e) => setUpdateForm({ ...updateForm, courierName: e.target.value })}
                  placeholder="e.g., Blue Dart, FedEx"
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Courier Contact Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={updateForm.courierContact}
                  onChange={(e) => setUpdateForm({ ...updateForm, courierContact: e.target.value })}
                  placeholder="e.g., +91 1800-XXX-XXXX"
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={styles.label}>Courier Tracking URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={updateForm.courierTrackingUrl}
                  onChange={(e) => setUpdateForm({ ...updateForm, courierTrackingUrl: e.target.value })}
                  placeholder="https://example.com/track?id=..."
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  ✅ Update Tracking
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeUpdateModal}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1f2937'
  },
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
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '2px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px 8px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  }
};
