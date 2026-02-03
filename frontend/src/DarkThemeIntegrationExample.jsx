/**
 * ============================================
 * DARK NAVY THEME INTEGRATION EXAMPLE
 * ============================================
 * 
 * This file demonstrates how to integrate the dark navy theme
 * into your existing React application
 */

import React from 'react';
import DarkNavyHomePage from './components/DarkNavyHomePage';
import DarkThemeProductCard from './components/DarkThemeProductCard';

// ============================================
// OPTION 1: Full Page Dark Theme
// ============================================
// Apply dark theme to entire application

function App() {
  return (
    <div className="dark-navy-theme">
      <DarkNavyHomePage />
    </div>
  );
}

export default App;

// ============================================
// OPTION 2: Specific Routes Only
// ============================================
// Apply dark theme to specific pages using React Router

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'; // Regular light theme
import DarkNavyHomePage from './components/DarkNavyHomePage'; // Dark theme

function AppWithRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Light theme pages */}
        <Route path="/" element={<HomePage />} />
        
        {/* Dark theme pages */}
        <Route path="/premium" element={<DarkNavyHomePage />} />
        <Route 
          path="/products/featured" 
          element={
            <div className="dark-navy-theme">
              <FeaturedProducts />
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================
// OPTION 3: Theme Toggle
// ============================================
// Allow users to switch between light and dark themes

import { useState } from 'react';

function AppWithThemeToggle() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  return (
    <div className={isDarkTheme ? 'dark-navy-theme' : ''}>
      <header>
        <button 
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className={isDarkTheme ? 'btn-blue' : 'btn-ghost'}
        >
          {isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>
      
      <main>
        {isDarkTheme ? <DarkNavyHomePage /> : <HomePage />}
      </main>
    </div>
  );
}

// ============================================
// OPTION 4: Dark Theme Product Grid Only
// ============================================
// Use dark theme for product listings within light-themed site

function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  }

  return (
    <div>
      {/* Regular light-themed header */}
      <header className="light-header">
        <h1>Our Products</h1>
      </header>

      {/* Dark-themed product grid */}
      <div className="dark-navy-theme" style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={styles.grid}>
            {products.map(product => (
              <DarkThemeProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Regular light-themed footer */}
      <footer className="light-footer">
        <p>© 2026 HomeHardware</p>
      </footer>
    </div>
  );
}

// ============================================
// OPTION 5: Dark Theme Modal/Overlay
// ============================================
// Use dark theme for modals and popups

function ProductQuickView({ product, onClose }) {
  return (
    <div className="dark-navy-theme" style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <button 
          className="btn-ghost"
          onClick={onClose}
          style={styles.closeBtn}
        >
          ✕
        </button>
        
        <h2 className="heading-2">{product.name}</h2>
        
        <img 
          src={product.image} 
          alt={product.name}
          style={styles.modalImage}
        />
        
        <p className="body-text">{product.description}</p>
        
        <div className="product-price">
          <span className="price-current">₹{product.price}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn-buy-now" style={{ flex: 1 }}>
            Buy Now
          </button>
          <button className="btn-add-cart" style={{ flex: 1 }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function handleAddToCart(product) {
  // Your add to cart logic
  console.log('Adding to cart:', product);
  
  // Example: dispatch to Redux store
  // dispatch({ type: 'ADD_TO_CART', payload: product });
  
  // Example: call API
  // await fetch('/api/cart', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ productId: product._id, quantity: 1 })
  // });
}

function handleBuyNow(product) {
  // Your buy now logic
  console.log('Buy now:', product);
  
  // Example: navigate to checkout
  // navigate('/checkout', { state: { product } });
}

// ============================================
// STYLES
// ============================================

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 22, 40, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContent: {
    background: 'rgba(26, 41, 66, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(74, 102, 133, 0.25)',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '40px',
    height: '40px',
  },
  modalImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '16px',
    marginBottom: '24px',
  },
};

// ============================================
// CUSTOM HOOK FOR THEME MANAGEMENT
// ============================================

import { useEffect } from 'react';

function useThemePreference() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to body
    if (theme === 'dark') {
      document.body.classList.add('dark-navy-theme');
    } else {
      document.body.classList.remove('dark-navy-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}

// Usage:
function AppWithThemeHook() {
  const { theme, toggleTheme, isDark } = useThemePreference();

  return (
    <>
      <button onClick={toggleTheme}>
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
      
      {isDark ? <DarkNavyHomePage /> : <HomePage />}
    </>
  );
}

// ============================================
// INTEGRATION WITH EXISTING APP.JSX
// ============================================

// If you have an existing App.jsx, you can add a route for the dark theme:

/*
// In your existing App.jsx:

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EcommerceHomePage from './components/EcommerceHomePage'; // Existing
import DarkNavyHomePage from './components/DarkNavyHomePage';   // New

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EcommerceHomePage />} />
        <Route path="/premium" element={<DarkNavyHomePage />} />
        
        // Add more routes as needed
      </Routes>
    </BrowserRouter>
  );
}

export default App;
*/

// ============================================
// CSS IMPORT ORDER (IMPORTANT!)
// ============================================

/*
In your src/index.css or src/main.jsx:

// 1. Import color system first
@import './styles/colorSystem.css';

// 2. Import dark navy theme
@import './styles/darkNavyTheme.css';

// 3. Import other styles
@import './styles/responsive.css';
@import './App.css';
*/

// ============================================
// VERCEL DEPLOYMENT NOTE
// ============================================

/*
If deploying to Vercel, ensure your vercel.json includes:

{
  "routes": [
    { "src": "/premium", "dest": "/" },
    { "src": "/(.*)", "dest": "/" }
  ]
}

This ensures the dark-themed routes work correctly with client-side routing.
*/

// ============================================
// TESTING CHECKLIST
// ============================================

/*
Before deploying:

✓ Test on Chrome, Firefox, Safari, Edge
✓ Test on mobile devices (iOS, Android)
✓ Verify contrast ratios with accessibility tools
✓ Check keyboard navigation (Tab, Enter, Escape)
✓ Test with screen readers (NVDA, JAWS, VoiceOver)
✓ Verify performance (Lighthouse score >90)
✓ Test hover states on desktop
✓ Test touch interactions on mobile
✓ Verify responsive layout at all breakpoints
✓ Check loading states and error messages
*/
