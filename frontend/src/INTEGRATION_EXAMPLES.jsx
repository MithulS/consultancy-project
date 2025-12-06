// INTEGRATION EXAMPLES - How to use new UX/UI components
// Copy these patterns into your existing components

// ============================================
// EXAMPLE 1: Enhanced Dashboard with All Features
// ============================================

import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import LoadingSpinner from './LoadingSpinner';
import OnboardingTour from './OnboardingTour';
import { showToast } from './ToastNotification';
import analytics from '../utils/analytics';

export default function EnhancedDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track page view
    analytics.pageView('dashboard');
    
    // Set user for analytics
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      analytics.setUser(userData.id, 'customer');
    }
    
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      
      // Track successful load
      analytics.performance('products_load', Date.now() - startTime);
    } catch (error) {
      // Show error toast
      showToast('Failed to load products. Please try again.', 'error');
      
      // Track error
      analytics.error('Product load failed', error.stack, { page: 'dashboard' });
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product) {
    try {
      // Your add to cart logic here
      
      // Show success toast
      showToast(`${product.name} added to cart!`, 'success');
      
      // Track analytics
      analytics.addToCart(product._id, product.name, product.price, 1);
      analytics.click('add_to_cart', 'button');
    } catch (error) {
      showToast('Failed to add item to cart', 'error');
    }
  }

  function handleProductView(product) {
    analytics.productView(product._id, product.name);
    analytics.click('product_card', 'card');
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your store..." />;
  }

  return (
    <>
      {/* Navigation with breadcrumbs */}
      <Navigation 
        currentPage="dashboard" 
        userName={user?.name}
        isAdmin={false}
      />

      {/* Onboarding tour for new users */}
      <OnboardingTour userType="customer" />

      {/* Your existing dashboard content */}
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1>Welcome, {user?.name}!</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {products.map(product => (
            <div 
              key={product._id}
              onClick={() => handleProductView(product)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer'
              }}
            >
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================
// EXAMPLE 2: Form with Toast Notifications
// ============================================

import { showToast } from './ToastNotification';
import analytics from '../utils/analytics';

export function CheckoutForm() {
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });

      if (response.ok) {
        const order = await response.json();
        
        // Show success toast
        showToast('Order placed successfully! 🎉', 'success', 5000);
        
        // Track purchase
        analytics.purchase(order.id, order.items, order.totalAmount);
        analytics.formSubmit('checkout', true);
        
        // Redirect to success page
        setTimeout(() => {
          window.location.hash = '#my-orders';
        }, 2000);
      } else {
        throw new Error('Order failed');
      }
    } catch (error) {
      // Show error toast
      showToast('Payment failed. Please check your information.', 'error');
      
      // Track error
      analytics.formSubmit('checkout', false, error);
      analytics.error('Checkout failed', error.stack, { step: 'payment' });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit">Place Order</button>
    </form>
  );
}

// ============================================
// EXAMPLE 3: Admin Dashboard with Analytics
// ============================================

import Navigation from './Navigation';
import LoadingSpinner from './LoadingSpinner';
import OnboardingTour from './OnboardingTour';
import { showToast } from './ToastNotification';
import analytics from '../utils/analytics';

export function EnhancedAdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.pageView('admin-dashboard');
    
    const adminData = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (adminData.id) {
      analytics.setUser(adminData.id, 'admin');
    }
    
    fetchProducts();
  }, []);

  async function handleDeleteProduct(productId) {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        // Update UI
        setProducts(products.filter(p => p._id !== productId));
        
        // Show success toast
        showToast('Product deleted successfully', 'success');
        
        // Track action
        analytics.click('delete_product', 'button');
        analytics.track('product_deleted', { productId });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      showToast('Failed to delete product', 'error');
      analytics.error('Product deletion failed', error.stack, { productId });
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading admin panel..." />;
  }

  return (
    <>
      <Navigation 
        currentPage="admin-dashboard" 
        userName={admin?.name}
        isAdmin={true}
      />
      
      <OnboardingTour userType="admin" />

      {/* Your admin dashboard content */}
    </>
  );
}

// ============================================
// EXAMPLE 4: Search with Analytics
// ============================================

export function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  async function handleSearch(searchQuery) {
    try {
      const response = await fetch(`/api/products/search?q=${searchQuery}`);
      const data = await response.json();
      setResults(data);

      // Track search
      analytics.search(searchQuery, data.length);
      
      // Show feedback
      if (data.length === 0) {
        showToast('No products found. Try different keywords.', 'info');
      } else {
        showToast(`Found ${data.length} products`, 'success', 2000);
      }
    } catch (error) {
      showToast('Search failed. Please try again.', 'error');
      analytics.error('Search failed', error.stack, { query: searchQuery });
    }
  }

  return (
    <div>
      <input 
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch(query);
          }
        }}
        placeholder="Search products..."
        style={{
          padding: '12px 16px',
          fontSize: '15px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          width: '100%'
        }}
      />
      {/* Display results */}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Mobile Responsive Component
// ============================================

import { useIsMobile, useIsTablet } from '../utils/responsive';

export function ResponsiveProductGrid() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const gridColumns = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
      gap: isMobile ? '12px' : '20px',
      padding: isMobile ? '12px' : '20px'
    }}>
      {/* Your products */}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Accessible Button Component
// ============================================

export function AccessibleButton({ onClick, children, type = 'button', loading = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      aria-label={children}
      style={{
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.3s ease',
        minHeight: '44px', // Touch-friendly
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
      }}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  );
}

// ============================================
// EXAMPLE 7: Error Handling Pattern
// ============================================

export function SafeComponent() {
  const [error, setError] = useState(null);

  async function riskyOperation() {
    try {
      setError(null);
      // Your risky code here
      const result = await someApiCall();
      return result;
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      analytics.error(err.message, err.stack, { component: 'SafeComponent' });
      return null;
    }
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        background: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        color: '#991b1b'
      }}>
        <h3>⚠️ Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return <div>{/* Your component content */}</div>;
}

// ============================================
// USAGE NOTES
// ============================================

/*
1. TOAST NOTIFICATIONS
   - Use for all user actions (add to cart, form submit, errors)
   - Types: 'success', 'error', 'warning', 'info'
   - Duration: default 3000ms, customize as needed

2. ANALYTICS TRACKING
   - Track all user interactions
   - Track page views on component mount
   - Track errors for debugging
   - Track performance metrics

3. LOADING STATES
   - Always show loading spinner during API calls
   - Use fullScreen prop for page-level loading
   - Customize message for context

4. NAVIGATION
   - Include on all authenticated pages
   - Pass currentPage for breadcrumbs
   - Handles logout automatically

5. ONBOARDING
   - Add to main pages (Dashboard, AdminDashboard)
   - Automatically shows to new users
   - Users can skip or restart

6. ACCESSIBILITY
   - Use semantic HTML (button, nav, main, etc.)
   - Add ARIA labels to interactive elements
   - Ensure 44px minimum touch targets
   - Test with keyboard navigation

7. MOBILE RESPONSIVENESS
   - Use responsive utility hooks
   - Test on real devices
   - Ensure touch-friendly interactions

8. ERROR HANDLING
   - Wrap app in ErrorBoundary (done in App.jsx)
   - Show user-friendly error messages
   - Track errors for debugging
*/

export {
  EnhancedDashboard,
  CheckoutForm,
  EnhancedAdminDashboard,
  ProductSearch,
  ResponsiveProductGrid,
  AccessibleButton,
  SafeComponent
};
