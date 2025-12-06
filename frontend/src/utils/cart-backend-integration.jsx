/**
 * Cart Backend Integration Update
 * 
 * This patch updates the Cart component to sync with backend API
 * while maintaining localStorage for offline functionality.
 */

// ============================================================
// UPDATE: Cart.jsx - Add Backend Sync Functions
// ============================================================

/* Add at the top with other imports */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* Add these new state variables */
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'error'

/* Add this useEffect to check login status and sync cart */
useEffect(() => {
  const token = localStorage.getItem('token');
  setIsLoggedIn(!!token);
  
  if (token) {
    // User is logged in - sync cart with backend
    syncCartWithBackend();
  } else {
    // Not logged in - load from localStorage
    loadCart();
  }
}, []);

/**
 * Sync localStorage cart with backend on login
 */
async function syncCartWithBackend() {
  const token = localStorage.getItem('token');
  if (!token) return;

  setSyncStatus('syncing');
  
  try {
    // Get local cart
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (localCart.length > 0) {
      // Sync local cart to backend
      const res = await fetch(`${API}/api/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: localCart })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update cart with synced data
        setCart(data.cart.items || []);
        localStorage.setItem('cart', JSON.stringify(data.cart.items || []));
        setSyncStatus('synced');
        console.log('✅ Cart synced with backend');
      } else {
        throw new Error(data.message || 'Failed to sync cart');
      }
    } else {
      // No local cart - fetch from backend
      fetchCartFromBackend();
    }
  } catch (error) {
    console.error('Cart sync error:', error);
    setSyncStatus('error');
    // Fallback to localStorage
    loadCart();
  }
}

/**
 * Fetch cart from backend
 */
async function fetchCartFromBackend() {
  const token = localStorage.getItem('token');
  if (!token) {
    loadCart();
    return;
  }

  try {
    const res = await fetch(`${API}/api/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success && data.cart) {
      const items = data.cart.items || [];
      setCart(items);
      localStorage.setItem('cart', JSON.stringify(items));
      setSyncStatus('synced');
    } else {
      loadCart();
    }
  } catch (error) {
    console.error('Fetch cart error:', error);
    loadCart();
  }
}

/**
 * Update quantity (with backend sync)
 */
async function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) return;
  
  // Optimistic update
  const updatedCart = cart.map(item =>
    item._id === productId || item.product?._id === productId 
      ? { ...item, quantity: newQuantity } 
      : item
  );
  setCart(updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));

  // Sync with backend if logged in
  const token = localStorage.getItem('token');
  if (token && isLoggedIn) {
    try {
      const res = await fetch(`${API}/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        console.error('Failed to update cart on backend:', data.message);
        // Revert on failure
        loadCart();
      }
    } catch (error) {
      console.error('Update cart error:', error);
      // Keep local change even if backend fails
    }
  }
}

/**
 * Remove item from cart (with backend sync)
 */
async function removeFromCart(productId) {
  // Optimistic update
  const updatedCart = cart.filter(item => 
    item._id !== productId && item.product?._id !== productId
  );
  setCart(updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));

  // Sync with backend if logged in
  const token = localStorage.getItem('token');
  if (token && isLoggedIn) {
    try {
      const res = await fetch(`${API}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!data.success) {
        console.error('Failed to remove item from backend:', data.message);
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  }
}

/**
 * Clear entire cart (with backend sync)
 */
async function clearCart() {
  // Optimistic update
  setCart([]);
  localStorage.removeItem('cart');

  // Sync with backend if logged in
  const token = localStorage.getItem('token');
  if (token && isLoggedIn) {
    try {
      const res = await fetch(`${API}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (!data.success) {
        console.error('Failed to clear cart on backend:', data.message);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  }
}

/* Add sync status indicator in JSX */
{syncStatus === 'syncing' && (
  <div style={styles.syncStatus}>
    <span>🔄 Syncing cart...</span>
  </div>
)}

{syncStatus === 'synced' && isLoggedIn && (
  <div style={styles.syncStatus}>
    <span>✅ Cart synced</span>
  </div>
)}

{syncStatus === 'error' && (
  <div style={styles.syncStatus}>
    <span>⚠️ Cart sync failed (using local data)</span>
  </div>
)}

/* Add styles for sync status */
const styles = {
  // ... existing styles ...
  
  syncStatus: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out'
  }
};

// ============================================================
// UPDATE: Dashboard.jsx - Sync Cart on Login
// ============================================================

/* Add after successful login/register */
async function syncCartAfterLogin() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (localCart.length === 0) return;

  try {
    const res = await fetch(`${API}/api/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items: localCart })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Update localStorage with synced cart
      localStorage.setItem('cart', JSON.stringify(data.cart.items || []));
      console.log('✅ Cart synced after login');
    }
  } catch (error) {
    console.error('Cart sync after login failed:', error);
  }
}

/* Call this function after successful login */
// In LoginModern.jsx:
if (res.ok) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Sync cart
  await syncCartAfterLogin();
  
  window.location.hash = '#dashboard';
}

// ============================================================
// UPDATE: Checkout.jsx - Clear Cart After Order
// ============================================================

/* After successful order creation */
async function clearCartAfterOrder() {
  const token = localStorage.getItem('token');
  
  // Clear localStorage
  localStorage.removeItem('cart');
  
  // Clear backend cart if logged in
  if (token) {
    try {
      await fetch(`${API}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to clear backend cart:', error);
    }
  }
}

/* Call after order success */
if (orderRes.ok) {
  await clearCartAfterOrder();
  window.location.hash = `#order-confirmation?orderId=${orderData.order._id}`;
}

// ============================================================
// HELPER: Get Cart Item Count (works with both formats)
// ============================================================

function getCartItemCount(cart) {
  return cart.reduce((total, item) => {
    // Handle both formats: direct product or nested product
    return total + (item.quantity || 0);
  }, 0);
}

function getTotalAmount(cart) {
  return cart.reduce((total, item) => {
    // Handle both formats
    const price = item.price || item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
}

// ============================================================
// TESTING CHECKLIST
// ============================================================

/**
 * Test Scenarios:
 * 
 * 1. Guest User (Not Logged In):
 *    ✓ Add items to cart
 *    ✓ Items stored in localStorage only
 *    ✓ Cart persists on page refresh
 *    ✓ No backend calls made
 * 
 * 2. User Logs In with Empty Cart:
 *    ✓ Local cart syncs to backend
 *    ✓ Cart appears on other devices after login
 *    ✓ Sync status shows "✅ Cart synced"
 * 
 * 3. User Logs In with Existing Backend Cart:
 *    ✓ Local cart merges with backend cart
 *    ✓ Duplicate items have quantities combined
 *    ✓ All items preserved
 * 
 * 4. User Updates Cart While Logged In:
 *    ✓ Changes sync to backend immediately
 *    ✓ localStorage updated
 *    ✓ Changes visible on other devices
 * 
 * 5. User Logs Out:
 *    ✓ Cart remains in localStorage
 *    ✓ Cart cleared from memory/state
 *    ✓ On next login, cart syncs again
 * 
 * 6. Network Failure:
 *    ✓ Cart operations continue with localStorage
 *    ✓ Sync status shows "⚠️ Cart sync failed"
 *    ✓ No data loss
 * 
 * 7. Order Completion:
 *    ✓ Cart cleared from both localStorage and backend
 *    ✓ Fresh cart ready for next order
 */

export default {
  // This file is for reference only
  // Apply these updates to actual Cart.jsx
};
