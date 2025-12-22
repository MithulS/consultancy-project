// Product Reports Component - Download reports with various filters
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductReports({ onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('all'); // 'all' or 'individual'
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dateRange, setDateRange] = useState('monthly'); // 'monthly', 'yearly', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API}/api/products?limit=1000`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  }

  function showMessage(msg, duration = 3000) {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }

  async function downloadReport() {
    console.log('📥 Download Report Started');
    console.log('Report Type:', reportType);
    console.log('Selected Product:', selectedProduct);
    console.log('Date Range:', dateRange);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (reportType === 'individual' && !selectedProduct) {
      showMessage('❌ Please select a product');
      return;
    }

    if (dateRange === 'custom' && (!startDate || !endDate)) {
      showMessage('❌ Please select both start and end dates');
      return;
    }

    if (dateRange === 'custom' && new Date(startDate) > new Date(endDate)) {
      showMessage('❌ Start date must be before end date');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      console.log('Token exists:', !!token);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (reportType === 'individual') {
        params.append('productId', selectedProduct);
      }
      params.append('dateRange', dateRange);
      if (dateRange === 'custom') {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `${API}/api/reports/products?${params.toString()}`;
      console.log('📡 Request URL:', url);

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📡 Response Status:', res.status);
      console.log('📡 Response OK:', res.ok);
      console.log('📡 Response Headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error Response:', errorText);
        throw new Error(`Failed to generate report: ${res.status} - ${errorText}`);
      }

      const blob = await res.blob();
      console.log('📦 Blob received, size:', blob.size, 'type:', blob.type);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      // Generate filename
      const productName = reportType === 'individual' 
        ? products.find(p => p._id === selectedProduct)?.name.replace(/[^a-z0-9]/gi, '_')
        : 'All_Products';
      const dateStr = dateRange === 'custom' 
        ? `${startDate}_to_${endDate}`
        : dateRange;
      a.download = `Product_Report_${productName}_${dateStr}_${Date.now()}.csv`;
      
      console.log('💾 Downloading file:', a.download);
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('✅ Download completed successfully');
      showMessage('✅ Report downloaded successfully!');
    } catch (err) {
      console.error('❌ Download error:', err);
      console.error('❌ Error stack:', err.stack);
      showMessage(`❌ Failed to download report: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
      zIndex: 10000,
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.3s ease-out'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'scaleIn 0.3s ease-out',
      position: 'relative'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #e5e7eb'
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    closeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    section: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    radioGroup: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px'
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.3s',
      flex: 1,
      backgroundColor: 'white'
    },
    radioOptionActive: {
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.05)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
    },
    radio: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    radioLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      cursor: 'pointer'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    dateGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    dateInput: {
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s',
      backgroundColor: 'white'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '32px'
    },
    button: {
      flex: 1,
      padding: '14px 24px',
      fontSize: '15px',
      fontWeight: '700',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    downloadBtn: {
      backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '16px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      animation: 'slideDown 0.3s ease-out'
    },
    infoBox: {
      backgroundColor: 'rgba(102, 126, 234, 0.05)',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '24px'
    },
    infoTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoText: {
      fontSize: '13px',
      color: '#6b7280',
      lineHeight: '1.6',
      margin: '4px 0'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>📊 Download Product Reports</h2>
          <button 
            style={styles.closeBtn}
            onClick={onClose}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.color = '#dc2626';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        {/* Report Type Selection */}
        <div style={styles.section}>
          <label style={styles.label}>📋 Report Type</label>
          <div style={styles.radioGroup}>
            <div 
              style={{
                ...styles.radioOption,
                ...(reportType === 'all' ? styles.radioOptionActive : {})
              }}
              onClick={() => setReportType('all')}
            >
              <input
                type="radio"
                name="reportType"
                value="all"
                checked={reportType === 'all'}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>All Products</label>
            </div>
            <div 
              style={{
                ...styles.radioOption,
                ...(reportType === 'individual' ? styles.radioOptionActive : {})
              }}
              onClick={() => setReportType('individual')}
            >
              <input
                type="radio"
                name="reportType"
                value="individual"
                checked={reportType === 'individual'}
                onChange={(e) => setReportType(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>Individual Product</label>
            </div>
          </div>
        </div>

        {/* Product Selection (only for individual) */}
        {reportType === 'individual' && (
          <div style={styles.section}>
            <label style={styles.label}>🏷️ Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">-- Choose a product --</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Selection */}
        <div style={styles.section}>
          <label style={styles.label}>📅 Date Range</label>
          <div style={styles.radioGroup}>
            <div 
              style={{
                ...styles.radioOption,
                ...(dateRange === 'monthly' ? styles.radioOptionActive : {})
              }}
              onClick={() => setDateRange('monthly')}
            >
              <input
                type="radio"
                name="dateRange"
                value="monthly"
                checked={dateRange === 'monthly'}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>This Month</label>
            </div>
            <div 
              style={{
                ...styles.radioOption,
                ...(dateRange === 'yearly' ? styles.radioOptionActive : {})
              }}
              onClick={() => setDateRange('yearly')}
            >
              <input
                type="radio"
                name="dateRange"
                value="yearly"
                checked={dateRange === 'yearly'}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.radio}
              />
              <label style={styles.radioLabel}>This Year</label>
            </div>
          </div>
          <div 
            style={{
              ...styles.radioOption,
              ...(dateRange === 'custom' ? styles.radioOptionActive : {}),
              marginTop: '12px'
            }}
            onClick={() => setDateRange('custom')}
          >
            <input
              type="radio"
              name="dateRange"
              value="custom"
              checked={dateRange === 'custom'}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.radio}
            />
            <label style={styles.radioLabel}>Custom Date Range</label>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {dateRange === 'custom' && (
          <div style={styles.section}>
            <div style={styles.dateGroup}>
              <div>
                <label style={{...styles.label, fontSize: '12px'}}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.dateInput}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{...styles.label, fontSize: '12px'}}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.dateInput}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div style={styles.infoBox}>
          <div style={styles.infoTitle}>
            <span>💡</span>
            <span>Report Details</span>
          </div>
          <p style={styles.infoText}>
            • Report includes product details, stock levels, sales data, and revenue
          </p>
          <p style={styles.infoText}>
            • Monthly: Current month data (from 1st to today)
          </p>
          <p style={styles.infoText}>
            • Yearly: Current year data (from Jan 1st to today)
          </p>
          <p style={styles.infoText}>
            • Custom: Select any date range for detailed analysis
          </p>
          <p style={styles.infoText}>
            • Format: CSV file (can be opened in Excel, Google Sheets)
          </p>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            style={{...styles.button, ...styles.cancelBtn}}
            onClick={onClose}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
          <button
            style={{...styles.button, ...styles.downloadBtn}}
            onClick={downloadReport}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Generating...' : '📥 Download Report'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
