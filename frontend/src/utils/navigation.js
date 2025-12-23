// Navigation utility for smooth transitions
export const smoothNavigate = (route, delay = 300) => {
  return new Promise((resolve) => {
    // Add loading state if needed
    document.body.style.cursor = 'wait';
    
    setTimeout(() => {
      window.location.hash = `#${route}`;
      document.body.style.cursor = 'default';
      resolve();
    }, delay);
  });
};

// Check authentication status
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Failed to parse user data:', err);
    return null;
  }
};

// Clear auth data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  sessionStorage.clear();
};

// Auth event emitter
export const emitAuthEvent = (type, data) => {
  window.dispatchEvent(new CustomEvent(type, { detail: data }));
};

// Subscribe to auth events
export const onAuthChange = (callback) => {
  const handler = (event) => callback(event.detail);
  
  window.addEventListener('userLoggedIn', handler);
  window.addEventListener('userLoggedOut', handler);
  
  return () => {
    window.removeEventListener('userLoggedIn', handler);
    window.removeEventListener('userLoggedOut', handler);
  };
};

// Preload route data
export const preloadRoute = async (route) => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  switch(route) {
    case 'dashboard':
      try {
        await fetch(`${API}/api/products?limit=12`);
        console.log('✅ Dashboard data preloaded');
      } catch (err) {
        console.warn('⚠️ Failed to preload dashboard:', err);
      }
      break;
    
    case 'cart':
      // Preload cart data if needed
      break;
    
    case 'profile':
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${API}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ Profile data preloaded');
        } catch (err) {
          console.warn('⚠️ Failed to preload profile:', err);
        }
      }
      break;
  }
};

// Enhanced navigation with preloading
export const navigateWithPreload = async (route, delay = 300) => {
  // Start preloading
  preloadRoute(route);
  
  // Show loading indicator
  document.body.style.cursor = 'wait';
  
  // Wait for delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Navigate
  window.location.hash = `#${route}`;
  
  // Reset cursor
  document.body.style.cursor = 'default';
};

// Token validation
export const validateToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  try {
    const response = await fetch(`${API}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      clearAuth();
      return false;
    }
    
    return response.ok;
  } catch (err) {
    console.error('Token validation failed:', err);
    return false;
  }
};

// Initialize auth on app load
export const initializeAuth = async () => {
  const isValid = await validateToken();
  
  if (!isValid && window.location.hash.includes('dashboard')) {
    console.log('⚠️ Invalid token on protected route, redirecting to home');
    window.location.hash = '#dashboard'; // Guest mode dashboard
  }
  
  return isValid;
};

// Redirect to login with return URL
export const redirectToLogin = (returnUrl = null) => {
  const currentHash = returnUrl || window.location.hash || '#dashboard';
  
  // Don't store login/register pages as return URLs
  const excludedRoutes = ['#login', '#register', '#verify-otp', '#forgot-password', '#reset-password'];
  if (!excludedRoutes.includes(currentHash)) {
    sessionStorage.setItem('redirectAfterLogin', currentHash);
  }
  
  window.location.hash = '#login';
};

// Handle authentication errors (401) consistently
export const handleAuthError = (message = 'Please login to continue') => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Store current page for return after login
  const currentHash = window.location.hash || '#dashboard';
  const excludedRoutes = ['#login', '#register', '#verify-otp', '#forgot-password', '#reset-password'];
  
  if (!excludedRoutes.includes(currentHash)) {
    sessionStorage.setItem('redirectAfterLogin', currentHash);
  }
  
  // Show notification if available
  if (window.showToast) {
    window.showToast(message, 'error');
  }
  
  // Redirect to login
  setTimeout(() => {
    window.location.hash = '#login';
  }, 1500);
};

// Get and clear redirect URL after login
export const getAndClearRedirectUrl = () => {
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  if (redirectTo) {
    sessionStorage.removeItem('redirectAfterLogin');
    return redirectTo;
  }
  return '#dashboard'; // Default redirect
};

// Check if route requires authentication
export const isProtectedRoute = (route) => {
  const protectedRoutes = [
    'profile',
    'my-orders',
    'wishlist',
    'checkout',
    'admin-dashboard',
    'admin-settings',
    'inventory-management',
    'sales-analytics'
  ];
  
  return protectedRoutes.includes(route.replace('#', ''));
};

// Navigate with authentication check
export const navigateWithAuth = (route) => {
  const routeWithoutHash = route.replace('#', '');
  
  if (isProtectedRoute(routeWithoutHash) && !isAuthenticated()) {
    // Protected route but not authenticated - redirect to login
    sessionStorage.setItem('redirectAfterLogin', `#${routeWithoutHash}`);
    window.location.hash = '#login';
  } else {
    // Either public route or authenticated - navigate normally
    window.location.hash = `#${routeWithoutHash}`;
  }
};
