import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ToastNotification from './components/ToastNotification';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import LoadingOverlay from './components/LoadingOverlay';
import ExitIntentPopup from './components/ExitIntentPopup';
import ChatWidget from './components/ChatWidget';
import analytics from './utils/analytics';
import { initializeAuth } from './utils/navigation';
import { initializePerformanceOptimizations } from './utils/performanceOptimizations';
import UserRouter from './components/UserRouter';
import AdminRouter from './components/AdminRouter';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
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

  // Initialize performance optimizations
  useEffect(() => {
    initializePerformanceOptimizations({
      enableMonitoring: true,
      logNetwork: import.meta.env.DEV,
      analyticsCallback: (metric, data) => {
        if (import.meta.env.DEV) {
          console.log(`📊 ${metric}:`, data);
        }
        if (import.meta.env.PROD) {
          analytics.event('web_vitals', {
            metric_name: metric,
            metric_value: data.value,
            metric_rating: data.rating
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      try {
        let hash = window.location.hash.substring(1) || 'home';

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

        // Show loading for protected routes (check AFTER stripping query params)
        if (hash.includes('?')) {
          hash = hash.split('?')[0];
        }

        const protectedRoutes = ['profile', 'my-orders', 'checkout', 'admin-dashboard'];
        if (protectedRoutes.includes(hash)) {
          setIsLoading(true);
          setLoadingMessage('Loading...');
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
        setCurrentPage('home'); // Fallback to home on error
        setIsLoading(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    const adminPages = [
      'admin', 'secret-admin-login', 'admin-forgot-password', 'admin-reset-password',
      'admin-dashboard', 'admin-settings', 'admin-order-tracking', 'sales-analytics'
    ];

    if (adminPages.includes(currentPage)) {
      return <AdminRouter currentPage={currentPage} />;
    }

    return <UserRouter currentPage={currentPage} authKey={authKey} />;
  };

  return (
    <ErrorBoundary>
      <AccessibilityWrapper>
        {/* Skip Navigation Link for Accessibility */}
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            top: '-100px',
            left: '0',
            background: '#000',
            color: '#fff',
            padding: '8px 16px',
            zIndex: 10000,
            textDecoration: 'none',
            fontWeight: 600,
            borderRadius: '0 0 4px 0'
          }}
          onFocus={(e) => e.currentTarget.style.top = '0'}
          onBlur={(e) => e.currentTarget.style.top = '-100px'}
        >
          Skip to main content
        </a>

        <div id="main-content" tabIndex="-1">
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
