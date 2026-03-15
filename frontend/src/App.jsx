import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ToastNotification from './components/ToastNotification';
import AccessibilityWrapper from './components/AccessibilityWrapper';
import LoadingOverlay from './components/LoadingOverlay';
import ExitIntentPopup from './components/ExitIntentPopup';
import ChatWidget from './components/ChatWidget';
import analytics from './utils/analytics';
import { initializeAuth } from './utils/navigation';
import { initializePerformanceOptimizations, runWhenIdle } from './utils/performanceOptimizations';
import UserRouter from './components/UserRouter';
import AdminRouter from './components/AdminRouter';
import SmoothScrollProvider from './components/SmoothScrollProvider';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authKey, setAuthKey] = useState(() => Date.now()); // Force remount on auth change
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData === true;
    const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
    const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    const lowPerformance = prefersReducedMotion || saveData || lowCpu || lowMemory;

    setIsLowPerformanceMode(lowPerformance);
    document.documentElement.classList.toggle('low-performance-mode', lowPerformance);
    window.__lowPerformanceMode = lowPerformance;
  }, []);

  useEffect(() => {
    // Initialize authentication on app load
    initializeAuth().then(isValid => {
      if (import.meta.env.DEV) {
        console.log('🔐 Auth:', isValid ? 'Authenticated' : 'Guest');
      }
    });

    // Listen for login events to force component remount
    const handleUserLogin = () => {
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
      enableMonitoring: !isLowPerformanceMode,
      logNetwork: import.meta.env.DEV,
      analyticsCallback: (metric, data) => {
        if (import.meta.env.DEV) {
          console.log(`📊 ${metric}:`, data);
        }
        if (import.meta.env.PROD) {
          analytics.track('web_vitals', {
            metric_name: metric,
            metric_value: data.value,
            metric_rating: data.rating
          });
        }
      }
    });
  }, [isLowPerformanceMode]);

  // Lightweight profiling pass in development to inspect scroll jank risks.
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;

    let frameCount = 0;
    let rafId;
    let sampleStart = performance.now();

    const tick = (now) => {
      frameCount += 1;
      if (now - sampleStart >= 2000) {
        const fps = Math.round((frameCount * 1000) / (now - sampleStart));
        console.log('🎯 FPS sample (2s):', fps);
        frameCount = 0;
        sampleStart = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    let longTaskObserver;
    if ('PerformanceObserver' in window) {
      try {
        longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn('⚠️ Long task:', Math.round(entry.duration), 'ms');
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch {
        // longtask observer not supported in all browsers
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      longTaskObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isLowPerformanceMode) {
      setShowDeferredWidgets(false);
      return;
    }

    const id = runWhenIdle(() => setShowDeferredWidgets(true), { timeout: 1500 });
    return () => {
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, [isLowPerformanceMode]);

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

        setIsTransitioning(true);

        setTimeout(() => {
          // Check if it's reset password page with query params
          if (window.location.search.includes('token') && window.location.search.includes('email')) {
            setCurrentPage('reset-password');
          } else {
            setCurrentPage(hash);
          }

          // Track page view in analytics
          analytics.pageView(hash);

          // Use Lenis scrollTo if available, otherwise fall back to native
          if (window.__lenis) {
            window.__lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          setIsTransitioning(false);
          setIsLoading(false);
        }, 300); // Wait for exit animation to complete

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

  // Global scroll animation observer
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Helper: immediately reveal an element without animation
    const revealImmediately = (el) => {
      el.classList.add('is-revealed');
      el.style.willChange = 'auto';
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-animating');
          entry.target.classList.add('is-revealed');

          // Remove animation class after transition so hover states don't get laggy
          setTimeout(() => {
            if (entry.target) {
              entry.target.classList.remove('reveal-animating');
              entry.target.style.willChange = 'auto';
            }
          }, 800);

          observerInstance.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.0,
      rootMargin: '40px 0px 0px 0px'
    });

    // Observer function to attach classes to new elements dynamically
    const applyRevealClasses = () => {
      const targetSelectors = [
        '.product-card:not(.reveal-on-scroll)',
        '.product-card-enhanced:not(.reveal-on-scroll)',
        '.category-card:not(.reveal-on-scroll)',
        '.stat-card:not(.reveal-on-scroll)',
        '.feature-item:not(.reveal-on-scroll)',
        '.info-card:not(.reveal-on-scroll)',
        '.chartCard:not(.reveal-on-scroll)'
      ].join(',');

      const elements = document.querySelectorAll(targetSelectors);
      const viewportHeight = window.innerHeight;
      elements.forEach(el => {
        if (!el.classList.contains('is-revealed') && !el.classList.contains('reveal-on-scroll')) {
          const rect = el.getBoundingClientRect();
          // If the element is already in or above the viewport, reveal it immediately
          // This fixes the blank page issue when navigating back
          if (rect.top < viewportHeight && rect.bottom > 0) {
            revealImmediately(el);
          } else {
            el.classList.add('reveal-on-scroll');
            observer.observe(el);
          }
        }
      });
    };

    if (isLowPerformanceMode) {
      applyRevealClasses();
      return () => observer.disconnect();
    }

    // Use MutationObserver for continuous coverage without heavy re-rendering
    let applyScheduled = false;
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldApply = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldApply = true;
        }
      });
      if (shouldApply && !applyScheduled) {
        applyScheduled = true;
        requestAnimationFrame(() => {
          applyRevealClasses();
          applyScheduled = false;
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Apply immediately and also after a short delay for lazy-loaded content
    applyRevealClasses();
    const delayedApply = setTimeout(applyRevealClasses, 200);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      clearTimeout(delayedApply);
    };
  }, [currentPage, isLowPerformanceMode]);

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
        <SmoothScrollProvider>
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

          <div
            id="main-content"
            tabIndex="-1"
            className={`page-transition ${isTransitioning ? 'is-exiting' : 'is-entering'}`}
          >
            {renderContent()}
            <ToastNotification />
            <LoadingOverlay show={isLoading} message={loadingMessage} />
            {showDeferredWidgets && !isLowPerformanceMode && <ExitIntentPopup />}
            {showDeferredWidgets && <ChatWidget />}
          </div>
        </SmoothScrollProvider>
      </AccessibilityWrapper>
    </ErrorBoundary>
  );
}
