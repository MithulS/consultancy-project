import React, { useState, useEffect } from 'react';
import RegisterModern from './components/RegisterModern';
import VerifyOTPEnhanced from './components/VerifyOTPEnhanced';
import LoginModern from './components/LoginModern';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSettings from './components/AdminSettings';
import SalesAnalytics from './components/SalesAnalytics';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import MyOrders from './components/MyOrders';
import Profile from './components/Profile';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import ToastNotification from './components/ToastNotification';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import analytics from './utils/analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      try {
        let hash = window.location.hash.substring(1) || 'login';
        console.log('🔀 Route change:', hash);
        
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
      } catch (error) {
        console.error('❌ Route handling error:', error);
        analytics.error('Route handling failed', error.stack, { hash: window.location.hash });
        setCurrentPage('login'); // Fallback to login on error
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    const validPages = [
      'register', 'verify-otp', 'forgot-password', 'reset-password',
      'dashboard', 'cart', 'checkout', 'my-orders', 'profile',
      'admin', 'secret-admin-login', 'admin-dashboard', 'admin-settings',
      'sales-analytics', 'login'
    ];

    // Show 404 for invalid pages (except login which is default)
    if (currentPage !== 'login' && !validPages.includes(currentPage)) {
      return <NotFound />;
    }

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
        return <Dashboard />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'my-orders':
        return <MyOrders />;
      case 'profile':
        return <Profile />;
      case 'admin':
      case 'secret-admin-login':
        return <AdminLogin />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'sales-analytics':
        return <SalesAnalytics />;
      case 'login':
      default:
        return <LoginModern />;
    }
  };

  return (
    <ErrorBoundary>
      <AccessibilityWrapper>
        <div id="main-content">
          {renderContent()}
          <ToastNotification />
        </div>
      </AccessibilityWrapper>
    </ErrorBoundary>
  );
}
