// Admin Dashboard - Product Management Interface
import React, { useState, useEffect } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/60x60?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0, totalValue: 0 });
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', originalPrice: '', imageUrl: '',
    category: '', brand: '', stock: '', featured: false, rating: 0
  });
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
    // Count products where stock > 0 OR inStock is true (fallback)
    const inStock = products.filter(p => p.stock > 0 || p.inStock).length;
    const outOfStock = total - inStock;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    console.log('📊 Stats calculated:', { total, inStock, outOfStock, totalValue: totalValue.toFixed(2) });
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

  function openAddModal() {
    setFormData({
      name: '', description: '', price: '', originalPrice: '', imageUrl: '',
      category: '', brand: '', stock: '', featured: false, rating: 0
    });
    setShowAddModal(true);
    setEditingProduct(null);
  }

  function openEditModal(product) {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      imageUrl: product.imageUrl,
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      featured: product.featured || false,
      rating: product.rating || 0
    });
    setImageFile(null);
    setImagePreview(''); // Will show existing imageUrl from formData
    setUploadError('');
    setEditingProduct(product);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      name: '', description: '', price: '', originalPrice: '', imageUrl: '',
      category: '', brand: '', stock: '', featured: false, rating: 0
    });
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
  }

  // Handle image file selection
  function handleImageSelect(e) {
    const file = e.target.files[0];
    setUploadError('');
    
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPG, PNG, GIF, or WEBP images only.');
      e.target.value = '';
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }
    
    // Set file and create preview
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Upload image to server
  async function uploadImage() {
    if (!imageFile) return null;
    
    setUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.msg || 'Upload failed');
      }
      
      console.log('✅ Image uploaded:', data.imageUrl);
      return data.imageUrl;
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadError(error.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  // Remove selected image
  function removeImage() {
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
    // Reset file input
    const fileInput = document.getElementById('imageUploadInput');
    if (fileInput) fileInput.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Upload image first if a new file is selected
    let imageUrl = formData.imageUrl;
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) {
        alert('❌ Failed to upload image. Please try again.');
        return;
      }
      imageUrl = uploadedUrl;
    }
    
    const productData = {
      ...formData,
      imageUrl: imageUrl,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      stock: parseInt(formData.stock),
      rating: parseFloat(formData.rating)
    };

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingProduct 
        ? `${API}/api/products/${editingProduct._id}`
        : `${API}/api/products`;
      
      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Product ${editingProduct ? 'updated' : 'created'} successfully`);
        fetchProducts();
        closeModal();
      } else {
        alert('❌ ' + data.msg);
      }
    } catch (err) {
      alert('❌ Error saving product');
    }
  }

  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    window.location.hash = '#secret-admin-login';
  }

  function goToSettings() {
    window.location.hash = '#admin-settings';
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
    settingsBtn: {
      backgroundColor: '#6366f1',
      color: 'white',
      marginRight: '12px'
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
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderCollapse: 'collapse',
      tableLayout: 'auto'
    },
    tableWrapper: {
      overflowX: 'auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      textAlign: 'left',
      borderBottom: '2px solid #e5e7eb',
      whiteSpace: 'nowrap'
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
      gap: '8px',
      justifyContent: 'center',
      alignItems: 'center'
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
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e1b4b',
      marginBottom: '24px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      padding: '10px 12px',
      borderRadius: '8px',
      border: '2px solid #e5e7eb',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    textarea: {
      padding: '10px 12px',
      borderRadius: '8px',
      border: '2px solid #e5e7eb',
      fontSize: '14px',
      outline: 'none',
      minHeight: '80px',
      fontFamily: 'inherit',
      resize: 'vertical'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    uploadButton: {
      display: 'inline-block',
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      transition: 'all 0.2s',
      cursor: 'pointer'
    },
    submitBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    cancelBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
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
            style={{...styles.button, ...styles.settingsBtn}}
            onClick={goToSettings}
          >
            ⚙️ Settings
          </button>
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
        <div style={{...styles.statCard, borderLeft: '4px solid #5b21b6'}}>
          <div style={styles.statLabel}>📦 Total Products</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #10b981'}}>
          <div style={styles.statLabel}>✅ In Stock</div>
          <div style={{...styles.statValue, color: '#10b981'}}>{stats.inStock}</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #ef4444'}}>
          <div style={styles.statLabel}>❌ Out of Stock</div>
          <div style={{...styles.statValue, color: '#ef4444'}}>{stats.outOfStock}</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #f59e0b'}}>
          <div style={styles.statLabel}>💰 Total Inventory Value</div>
          <div style={{...styles.statValue, fontSize: '28px', color: '#5b21b6'}}>₹{stats.totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.actionBar}>
          <h2 style={{ margin: 0, color: '#1e1b4b' }}>Product Management</h2>
          <button 
            style={{...styles.button, ...styles.addBtn}}
            onClick={openAddModal}
          >
            ➕ Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.tableHeader, width: '80px'}}>Image</th>
                <th style={{...styles.tableHeader, minWidth: '200px'}}>Name</th>
                <th style={{...styles.tableHeader, minWidth: '120px'}}>Category</th>
                <th style={{...styles.tableHeader, minWidth: '100px'}}>Price (₹)</th>
                <th style={{...styles.tableHeader, width: '80px', textAlign: 'center'}}>Stock</th>
                <th style={{...styles.tableHeader, width: '120px', textAlign: 'center'}}>Status</th>
                <th style={{...styles.tableHeader, minWidth: '180px', textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isOutOfStock = product.stock === 0 || !product.inStock;
                return (
                <tr key={product._id} style={{ backgroundColor: isOutOfStock ? '#fef2f2' : 'transparent' }}>
                  <td style={styles.tableCell}>
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.name}
                      style={{...styles.productImage, opacity: isOutOfStock ? 0.6 : 1}}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <strong style={{ color: isOutOfStock ? '#991b1b' : 'inherit' }}>{product.name}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{product.brand}</span>
                    {isOutOfStock && (
                      <><br /><span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>⚠️ OUT OF STOCK</span></>
                    )}
                  </td>
                  <td style={styles.tableCell}>{product.category}</td>
                  <td style={styles.tableCell}>
                    <strong style={{ color: '#5b21b6' }}>₹{product.price.toFixed(2)}</strong>
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'center'}}>
                    <strong style={{ 
                      color: product.stock > 10 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                      fontSize: product.stock === 0 ? '16px' : '14px'
                    }}>
                      {product.stock}
                    </strong>
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'center'}}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: !isOutOfStock ? '#d1fae5' : '#fee2e2',
                      color: !isOutOfStock ? '#065f46' : '#991b1b',
                      display: 'inline-block'
                    }}>
                      {!isOutOfStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </span>
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.editBtn}
                        onClick={() => openEditModal(product)}
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
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  style={styles.textarea}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    style={styles.input}
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    style={styles.input}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Product Image *
                  <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', marginLeft: '8px' }}>
                    (JPG, PNG, GIF, WEBP • Max 5MB)
                  </span>
                </label>
                
                {/* Upload Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label 
                    htmlFor="imageUploadInput"
                    style={{
                      ...styles.uploadButton,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.6 : 1
                    }}
                    aria-label="Upload image from device"
                  >
                    <input
                      id="imageUploadInput"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                      disabled={uploading}
                      aria-describedby="imageUploadHelp"
                    />
                    📤 {uploading ? 'Uploading...' : 'Upload from Device'}
                  </label>
                  
                  {/* Helper Text */}
                  <p id="imageUploadHelp" style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Select an image file from your computer
                  </p>
                  
                  {/* Upload Error */}
                  {uploadError && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#991b1b'
                    }} role="alert">
                      ⚠️ {uploadError}
                    </div>
                  )}
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.imageUrl) && (
                    <div style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                          Image Preview
                        </span>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={removeImage}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            aria-label="Remove selected image"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                      <img
                        src={imagePreview || getImageUrl(formData.imageUrl)}
                        alt="Product preview"
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    style={styles.input}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Brand</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock Quantity *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                    min="0"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    style={styles.input}
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  />
                </div>
              </div>

              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                />
                <label htmlFor="featured" style={{...styles.label, margin: 0}}>Featured Product</label>
              </div>

              <div style={styles.modalButtons}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
