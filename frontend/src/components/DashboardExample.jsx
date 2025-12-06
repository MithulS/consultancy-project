// Example Dashboard Enhancement - Add Wishlist & Comparison
import React, { useState, useEffect } from 'react';
import { LazyImage } from '../utils/lazyLoad';
import PWA from '../utils/pwa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EnhancedDashboard() {
  // Existing state
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  
  // NEW: Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  
  // NEW: Comparison state
  const [compareList, setCompareList] = useState([]);
  
  // NEW: PWA install state
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    fetchWishlist();
    setupPWAInstall();
  }, []);

  // NEW: Fetch user's wishlist
  async function fetchWishlist() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        const ids = new Set(data.wishlist.items.map(item => item.product._id));
        setWishlistIds(ids);
        setWishlist(data.wishlist.items);
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    }
  }

  // NEW: Toggle wishlist
  async function toggleWishlist(product, e) {
    e.stopPropagation(); // Prevent card click
    
    try {
      const token = localStorage.getItem('token');
      const isInWishlist = wishlistIds.has(product._id);

      if (isInWishlist) {
        // Remove from wishlist
        const res = await fetch(`${API}/api/wishlist/remove/${product._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const newIds = new Set(wishlistIds);
          newIds.delete(product._id);
          setWishlistIds(newIds);
          showNotification('Removed from wishlist');
        }
      } else {
        // Add to wishlist
        const res = await fetch(`${API}/api/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product._id })
        });

        if (res.ok) {
          const newIds = new Set(wishlistIds);
          newIds.add(product._id);
          setWishlistIds(newIds);
          showNotification('❤️ Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  }

  // NEW: Toggle comparison
  function toggleCompare(productId) {
    if (compareList.includes(productId)) {
      setCompareList(compareList.filter(id => id !== productId));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, productId]);
    } else {
      alert('You can compare up to 4 products at once');
    }
  }

  // NEW: Navigate to comparison
  function navigateToComparison() {
    window.location.hash = `#comparison?ids=${compareList.join(',')}`;
  }

  // NEW: Setup PWA install
  function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });

    // Check if already installed
    if (PWA.isInstalled()) {
      console.log('✅ App is already installed');
    }
  }

  // NEW: Handle PWA install
  async function handleInstall() {
    if (!deferredPrompt) return;

    const result = await PWA.install(deferredPrompt);
    
    if (result.outcome === 'accepted') {
      setShowInstallButton(false);
      showNotification('✅ App installed successfully!');
    }
    
    setDeferredPrompt(null);
  }

  function showNotification(msg) {
    // Use your existing notification system
    alert(msg); // Replace with your ToastNotification
  }

  return (
    <div style={styles.container}>
      {/* Header with new buttons */}
      <div style={styles.header}>
        <h1>ElectroStore</h1>
        
        <div style={styles.headerActions}>
          {/* NEW: Wishlist button */}
          <button 
            onClick={() => window.location.hash = '#wishlist'}
            style={styles.wishlistBtn}
          >
            ❤️ Wishlist ({wishlistIds.size})
          </button>

          {/* NEW: Compare button (shows when 2+ selected) */}
          {compareList.length >= 2 && (
            <button 
              onClick={navigateToComparison}
              style={styles.compareBtn}
            >
              🔍 Compare ({compareList.length})
            </button>
          )}

          {/* NEW: PWA Install button */}
          {showInstallButton && (
            <button 
              onClick={handleInstall}
              style={styles.installBtn}
            >
              📱 Install App
            </button>
          )}

          {/* Existing: Cart button */}
          <button onClick={() => window.location.hash = '#cart'}>
            🛒 Cart ({cart.length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product._id} style={styles.card}>
            {/* NEW: Wishlist heart button */}
            <button 
              onClick={(e) => toggleWishlist(product, e)}
              style={{
                ...styles.heartBtn,
                color: wishlistIds.has(product._id) ? '#ef4444' : '#999'
              }}
            >
              {wishlistIds.has(product._id) ? '❤️' : '🤍'}
            </button>

            {/* NEW: Compare checkbox */}
            <label style={styles.compareCheckbox}>
              <input
                type="checkbox"
                checked={compareList.includes(product._id)}
                onChange={() => toggleCompare(product._id)}
              />
              <span>Compare</span>
            </label>

            {/* NEW: Lazy loaded image */}
            <LazyImage
              src={product.imageUrl}
              alt={product.name}
              style={styles.image}
              placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='18'%3ELoading...%3C/text%3E%3C/svg%3E"
            />

            <div style={styles.cardContent}>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              
              <button 
                onClick={() => addToCart(product)}
                style={styles.addBtn}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  header: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  wishlistBtn: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  compareBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  installBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    padding: '30px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  heartBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 10
  },
  compareCheckbox: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'white',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '20px'
  },
  addBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700'
  }
};
