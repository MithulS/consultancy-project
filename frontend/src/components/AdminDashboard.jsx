// Admin Dashboard - Product Management Interface
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0, totalValue: 0 });

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('isAdmin');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!isAdmin || !adminToken) {
      window.location.hash = '#secret-admin-login';
      return;
    }

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    setAdmin(adminUser);
    
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [products]);

  function calculateStats() {
    const total = products.length;
    const inStock = products.filter(p => p.inStock).length;
    const outOfStock = total - inStock;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    setStats({ total, inStock, outOfStock, totalValue });
  }

  async function fetchProducts() {
    try {
      const res = await fetch(`${API}/api/products?limit=100`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Product deleted successfully');
        fetchProducts();
      } else {
        alert('❌ ' + data.msg);
      }
    } catch (err) {
      alert('❌ Error deleting product');
    }
  }

  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    window.location.hash = '#secret-admin-login';
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    },
    header: {
      backgroundColor: '#1e1b4b',
      color: 'white',
      padding: '20px 32px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    adminName: {
      fontSize: '14px',
      color: '#e0e7ff'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    logoutBtn: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      padding: '32px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px',
      fontWeight: '500'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1e1b4b'
    },
    content: {
      padding: '0 32px 32px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    actionBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    addBtn: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    table: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      textAlign: 'left',
      borderBottom: '2px solid #e5e7eb'
    },
    tableCell: {
      padding: '16px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px',
      color: '#1f2937'
    },
    productImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    editBtn: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px'
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>⏳ Loading admin panel...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🛡️ Admin Dashboard</h1>
        <div style={styles.headerRight}>
          {admin && <span style={styles.adminName}>👤 {admin.name || admin.email}</span>}
          <button 
            style={{...styles.button, ...styles.logoutBtn}}
            onClick={logout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>📦 Total Products</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>✅ In Stock</div>
          <div style={{...styles.statValue, color: '#10b981'}}>{stats.inStock}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>❌ Out of Stock</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.outOfStock}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>💰 Total Inventory Value</div>
          <div style={{...styles.statValue, fontSize: '28px'}}>${stats.totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.actionBar}>
          <h2 style={{ margin: 0, color: '#1e1b4b' }}>Product Management</h2>
          <button 
            style={{...styles.button, ...styles.addBtn}}
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Image</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Category</th>
                <th style={styles.tableHeader}>Price</th>
                <th style={styles.tableHeader}>Stock</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td style={styles.tableCell}>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <strong>{product.name}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{product.brand}</span>
                  </td>
                  <td style={styles.tableCell}>{product.category}</td>
                  <td style={styles.tableCell}>
                    <strong style={{ color: '#5b21b6' }}>${product.price.toFixed(2)}</strong>
                  </td>
                  <td style={styles.tableCell}>
                    <strong style={{ color: product.stock > 10 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444' }}>
                      {product.stock}
                    </strong>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: product.inStock ? '#d1fae5' : '#fee2e2',
                      color: product.inStock ? '#065f46' : '#991b1b'
                    }}>
                      {product.inStock ? '✓ In Stock' : '✗ Out'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.editBtn}
                        onClick={() => setEditingProduct(product)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        style={styles.deleteBtn}
                        onClick={() => deleteProduct(product._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
