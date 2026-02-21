// Product Comparison Component
import React, { useState, useEffect } from 'react';
import { showToast } from './ToastNotification';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { getImageUrl } from '../utils/imageHandling';

export default function ProductComparison({ productIds, onNavigate }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productIds && productIds.length > 0) {
      fetchComparison();
    }
  }, [productIds]);

  async function fetchComparison() {
    try {
      const ids = productIds.join(',');
      const res = await fetch(`${API}/api/comparison?ids=${ids}`);
      const data = await res.json();

      if (data.success) {
        setComparison(data.comparison);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      console.error('Comparison error:', error);
      setError('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading comparison...</div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>❌ {error || 'No comparison data'}</h2>
          <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { products, insights } = comparison;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>🔍 Product Comparison</h1>
        <p style={styles.subtitle}>Compare {products.length} products side-by-side</p>
      </div>

      {/* Insights Panel */}
      <div style={styles.insights}>
        <div style={styles.insightCard}>
          <div style={styles.insightIcon}>💰</div>
          <div style={styles.insightLabel}>Lowest Price</div>
          <div style={styles.insightValue}>${insights.lowestPrice}</div>
        </div>
        <div style={styles.insightCard}>
          <div style={styles.insightIcon}>⭐</div>
          <div style={styles.insightLabel}>Best Rated</div>
          <div style={styles.insightValue}>{insights.bestRated}/5</div>
        </div>
        <div style={styles.insightCard}>
          <div style={styles.insightIcon}>💬</div>
          <div style={styles.insightLabel}>Most Reviewed</div>
          <div style={styles.insightValue}>{insights.mostReviewed}</div>
        </div>
        <div style={styles.insightCard}>
          <div style={styles.insightIcon}>📊</div>
          <div style={styles.insightLabel}>Avg Price</div>
          <div style={styles.insightValue}>${insights.averagePrice}</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Feature</th>
              {products.map(product => (
                <th key={product.id} style={styles.th}>
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={`${product.name}, ${product.category}, ₹${product.price}${product.brand ? ' by ' + product.brand : ''}`}
                    title={`${product.name} - ${product.brand || ''} - ₹${product.price}`}
                    style={styles.productImage}
                  />
                  <div style={styles.productName}>{product.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price Row */}
            <tr>
              <td style={styles.td}>💰 Price</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>
                  <div style={{
                    ...styles.priceCell,
                    background: product.highlights.lowestPrice ?
                      'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                    color: product.highlights.lowestPrice ? 'white' : '#333'
                  }}>
                    ${product.price}
                    {product.highlights.lowestPrice && <span style={styles.badge}>BEST</span>}
                  </div>
                </td>
              ))}
            </tr>

            {/* Brand Row */}
            <tr>
              <td style={styles.td}>🏷️ Brand</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>{product.brand}</td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr>
              <td style={styles.td}>⭐ Rating</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>
                  <div style={{
                    fontWeight: product.highlights.bestRated ? '800' : '400',
                    color: product.highlights.bestRated ? '#f59e0b' : '#333'
                  }}>
                    {product.rating || 'N/A'}
                    {product.highlights.bestRated && ' 🏆'}
                  </div>
                </td>
              ))}
            </tr>

            {/* Reviews Row */}
            <tr>
              <td style={styles.td}>💬 Reviews</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>
                  <div style={{
                    fontWeight: product.highlights.mostReviewed ? '700' : '400'
                  }}>
                    {product.numReviews || 0}
                    {product.highlights.mostReviewed && ' 🔥'}
                  </div>
                </td>
              ))}
            </tr>

            {/* Stock Row */}
            <tr>
              <td style={styles.td}>📦 Availability</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>
                  <span style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                    {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Savings Row */}
            <tr>
              <td style={styles.td}>💸 Savings</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>
                  {product.savings > 0 ? (
                    <div style={{
                      color: '#10b981',
                      fontWeight: product.highlights.bestValue ? '800' : '400'
                    }}>
                      ${product.savings} ({product.savingsPercent}% off)
                      {product.highlights.bestValue && ' 💰'}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>No discount</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Category Row */}
            <tr>
              <td style={styles.td}>📂 Category</td>
              {products.map(product => (
                <td key={product.id} style={styles.td}>{product.category}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => {
              // Add to cart logic
              const cart = JSON.parse(localStorage.getItem('cart') || '[]');
              cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
                stock: product.stock
              });
              localStorage.setItem('cart', JSON.stringify(cart));
              showToast(`✅ ${product.name} added to cart`, 'success');
            }}
            disabled={product.stock === 0}
            style={{
              ...styles.addBtn,
              opacity: product.stock === 0 ? 0.5 : 1,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            🛒 Add {product.name.substring(0, 20)}...
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'transparent',
    padding: '30px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  backBtn: {
    background: 'var(--glass-background)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    padding: '12px 24px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '20px',
    backdropFilter: 'var(--glass-blur)',
  },
  title: {
    color: 'var(--text-primary)',
    fontSize: '42px',
    margin: '10px 0',
    fontWeight: '800'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '18px'
  },
  loading: {
    color: 'white',
    textAlign: 'center',
    fontSize: '18px',
    padding: '50px'
  },
  error: {
    background: 'var(--glass-background)',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '50px auto'
  },
  insights: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
    maxWidth: '1200px',
    margin: '0 auto 30px'
  },
  insightCard: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center'
  },
  insightIcon: {
    fontSize: '40px',
    marginBottom: '10px'
  },
  insightLabel: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    fontWeight: '600'
  },
  insightValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  tableContainer: {
    background: 'var(--glass-background)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '20px',
    overflowX: 'auto',
    maxWidth: '1200px',
    margin: '0 auto 30px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '20px 15px',
    textAlign: 'center',
    borderBottom: '2px solid var(--glass-border)',
    fontWeight: '700',
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  td: {
    padding: '15px',
    textAlign: 'center',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  productImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '10px'
  },
  productName: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    maxWidth: '200px',
    margin: '0 auto'
  },
  priceCell: {
    padding: '10px 15px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    display: 'inline-block'
  },
  badge: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '800',
    marginTop: '5px',
    letterSpacing: '1px'
  },
  inStock: {
    color: '#10b981',
    fontWeight: '600'
  },
  outOfStock: {
    color: '#ef4444',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  addBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '15px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    flex: 1,
    minWidth: '200px',
    maxWidth: '300px'
  }
};
