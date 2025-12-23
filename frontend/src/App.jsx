import React, { useState, useEffect, Suspense, lazy } from 'react';
import RegisterModern from './components/RegisterModern';
import VerifyOTPEnhanced from './components/VerifyOTPEnhanced';
import LoginModern from './components/LoginModern';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import ToastNotification from './components/ToastNotification';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import LoadingOverlay from './components/LoadingOverlay';
import ExitIntentPopup from './components/ExitIntentPopup';
import ChatWidget from './components/ChatWidget';
import analytics from './utils/analytics';
import { initializeAuth } from './utils/navigation';

// Lazy load heavy components
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminForgotPassword = lazy(() => import('./components/AdminForgotPassword'));
const AdminResetPassword = lazy(() => import('./components/AdminResetPassword'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminSettings = lazy(() => import('./components/AdminSettings'));
const AdminOrderTracking = lazy(() => import('./components/AdminOrderTracking'));
const SalesAnalytics = lazy(() => import('./components/SalesAnalytics'));
const Cart = lazy(() => import('./components/Cart'));
const Checkout = lazy(() => import('./components/Checkout'));
const GuestCheckout = lazy(() => import('./components/GuestCheckout'));
const MyOrders = lazy(() => import('./components/MyOrders'));
const Profile = lazy(() => import('./components/Profile'));
const PublicTracking = lazy(() => import('./components/PublicTracking'));

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authKey, setAuthKey] = useState(Date.now()); // Force remount on auth change
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  useEffect(() => {
    // Initialize authentication on app load
    initializeAuth().then(isValid => {
      if (import.meta.env.DEV) {
        console.log('🔐 Auth:', isValid ? 'Authenticated' : 'Guest');
      }
    });

    // Listen for login events to force component remount
    const handleUserLogin = (event) => {
      if (import.meta.env.DEV) {
        console.log('🔐 Login: Remounting dashboard');
      }
      setLoadingMessage('Welcome back! Loading your dashboard...');
      setIsLoading(true);
      
      setTimeout(() => {
        setAuthKey(Date.now()); // Change key to force remount
        setIsLoading(false);
      }, 500);
    };
    
    const handleUserLogout = () => {
      if (import.meta.env.DEV) {
        console.log('🔓 Logout');
      }
      setAuthKey(Date.now());
    };
    
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleUserLogout);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, []);

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      try {
        let hash = window.location.hash.substring(1) || 'dashboard';
        
        // Ignore accessibility anchor links (skip links, in-page navigation)
        // These are for screen readers and keyboard navigation, not routing
        const anchorLinks = ['main-content', 'content', 'navigation', 'footer', 'header'];
        if (anchorLinks.includes(hash)) {
          return; // Don't change route for anchor links
        }
        
        // Remove leading slash if present (from OAuth redirects)
        if (hash.startsWith('/')) {
          hash = hash.substring(1);
        }
        
        // Only log route changes in development
        if (import.meta.env.DEV) {
          console.log('🔀 Route:', hash);
        }
        
        // Show loading for protected routes
        const protectedRoutes = ['profile', 'my-orders', 'checkout', 'admin-dashboard'];
        if (protectedRoutes.includes(hash)) {
          setIsLoading(true);
          setLoadingMessage('Loading...');
        }
        
        // Extract just the path part before any query parameters
        // E.g., "verify-otp?email=..." becomes "verify-otp"
        if (hash.includes('?')) {
          hash = hash.split('?')[0];
        }
        
        // Check if it's reset password page with query params
        if (window.location.search.includes('token') && window.location.search.includes('email')) {
          setCurrentPage('reset-password');
        } else {
          setCurrentPage(hash);
        }

        // Track page view in analytics
        analytics.pageView(hash);
        
        // Hide loading after route change
        setTimeout(() => setIsLoading(false), 300);
      } catch (error) {
        console.error('❌ Route handling error:', error);
        analytics.error('Route handling failed', error.stack, { hash: window.location.hash });
        setCurrentPage('dashboard'); // Fallback to dashboard on error
        setIsLoading(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    const validPages = [
      'register', 'verify-otp', 'forgot-password', 'reset-password',
      'dashboard', 'cart', 'checkout', 'guest-checkout', 'my-orders', 'profile',
      'admin', 'secret-admin-login', 'admin-forgot-password', 'admin-reset-password',
      'admin-dashboard', 'admin-settings', 'admin-order-tracking', 'sales-analytics',
      'track-order', 'login'
    ];

    // Show 404 for invalid pages (except login which is default)
    if (currentPage !== 'login' && !validPages.includes(currentPage)) {
      return <NotFound />;
    }

    const content = (() => {
      switch(currentPage) {
        case 'register':
          return <RegisterModern />;
        case 'verify-otp':
          return <VerifyOTPEnhanced />;
        case 'forgot-password':
          return <ForgotPassword />;
        case 'reset-password':
          return <ResetPassword />;
        case 'dashboard':
          return <Dashboard key={authKey} />;
        case 'cart':
          return <Cart />;
        case 'checkout':
          return <Checkout />;
        case 'guest-checkout':
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          return <GuestCheckout 
            cart={guestCart} 
            onComplete={() => {
              localStorage.removeItem('guestCart');
              window.location.hash = '#dashboard';
            }}
            onCancel={() => window.location.hash = '#dashboard'}
          />;
        case 'my-orders':
          return <MyOrders />;
        case 'profile':
          return <Profile />;
        case 'admin':
        case 'secret-admin-login':
          return <AdminLogin />;
        case 'admin-forgot-password':
          return <AdminForgotPassword />;
        case 'admin-reset-password':
          return <AdminResetPassword />;
        case 'admin-dashboard':
          return <AdminDashboard />;
        case 'admin-settings':
          return <AdminSettings />;
        case 'admin-order-tracking':
          return <AdminOrderTracking />;
        case 'sales-analytics':
          return <SalesAnalytics />;
        case 'track-order':
          return <PublicTracking />;
        case 'login':
          return <LoginModern />;
        default:
          return <Dashboard key={authKey} />;
      }
    })();

    // Wrap lazy-loaded components in Suspense
    const lazyPages = ['cart', 'checkout', 'guest-checkout', 'my-orders', 'profile',
      'admin', 'secret-admin-login', 'admin-forgot-password', 'admin-reset-password',
      'admin-dashboard', 'admin-settings', 'admin-order-tracking', 'sales-analytics',
      'track-order'];
    
    if (lazyPages.includes(currentPage)) {
      return (
        <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}>
          {content}
        </Suspense>
      );
    }

    return content;
  };

  return (
    <ErrorBoundary>
      <AccessibilityWrapper>
        <div id="main-content">
          {renderContent()}
          <ToastNotification />
          <LoadingOverlay show={isLoading} message={loadingMessage} />
          <ExitIntentPopup />
          <ChatWidget />
        </div>
      </AccessibilityWrapper>
    </ErrorBoundary>
  );
}
