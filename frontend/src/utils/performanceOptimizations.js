/**
 * Core Web Vitals Optimization Utilities
 * Improves LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift)
 */

// ======================
// 1. LCP Optimization
// ======================

/**
 * Preload critical resources for faster LCP
 * Call this in index.html or App component
 */
export function preloadCriticalResources() {
  const criticalResources = [
    { href: '/logo.png', as: 'image' },
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
    document.head.appendChild(link);
  });
}

/**
 * Preconnect to external domains for faster resource loading
 */
export function preconnectDomains() {
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    // Add your API domain
    import.meta.env.VITE_API_URL || 'http://localhost:5000'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Measure and report LCP
 */
export function measureLCP(callback) {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      callback({
        metric: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: lastEntry.renderTime < 2500 ? 'good' : lastEntry.renderTime < 4000 ? 'needs-improvement' : 'poor',
        element: lastEntry.element
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.error('LCP measurement error:', error);
  }
}

// ======================
// 2. INP Optimization
// ======================

/**
 * Debounce function to prevent excessive event handler calls
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for high-frequency events (scroll, resize)
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Use requestIdleCallback for non-critical tasks
 */
export function runWhenIdle(callback, options = {}) {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options);
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 1);
}

/**
 * Measure INP (Interaction to Next Paint)
 */
export function measureINP(callback) {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Filter for interaction events
        if (entry.name === 'click' || entry.name === 'keydown' || entry.name === 'pointerdown') {
          const duration = entry.processingEnd - entry.processingStart;

          callback({
            metric: 'INP',
            value: duration,
            rating: duration < 200 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor',
            eventType: entry.name
          });
        }
      }
    });

    observer.observe({ entryTypes: ['event'] });
  } catch (error) {
    console.error('INP measurement error:', error);
  }
}

// ======================
// 3. CLS Optimization
// ======================

/**
 * Reserve space for images to prevent layout shifts
 * Returns an aspect ratio padding box style
 */
export function reserveImageSpace(width, height) {
  const paddingTop = (height / width) * 100;
  return {
    position: 'relative',
    paddingTop: `${paddingTop}%`,
    overflow: 'hidden'
  };
}

/**
 * Measure CLS (Cumulative Layout Shift)
 */
export function measureCLS(callback) {
  if (!('PerformanceObserver' in window)) return;

  let clsScore = 0;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;

          callback({
            metric: 'CLS',
            value: clsScore,
            rating: clsScore < 0.1 ? 'good' : clsScore < 0.25 ? 'needs-improvement' : 'poor',
            entries: entry
          });
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    console.error('CLS measurement error:', error);
  }
}

// ======================
// 4. FID Optimization (First Input Delay)
// ======================

/**
 * Measure FID
 */
export function measureFID(callback) {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback({
          metric: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: entry.processingStart - entry.startTime < 100 ? 'good' :
            entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor',
          eventType: entry.name
        });
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    console.error('FID measurement error:', error);
  }
}

// ======================
// 5. TTFB Optimization (Time to First Byte)
// ======================

/**
 * Measure TTFB
 */
export function measureTTFB() {
  if (!('performance' in window) || !('timing' in performance)) return;

  const { responseStart, requestStart } = performance.timing;
  const ttfb = responseStart - requestStart;

  return {
    metric: 'TTFB',
    value: ttfb,
    rating: ttfb < 600 ? 'good' : ttfb < 1500 ? 'needs-improvement' : 'poor'
  };
}

// ======================
// 6. Comprehensive Performance Monitor
// ======================

/**
 * Monitor all Core Web Vitals and send to analytics
 */
export function monitorCoreWebVitals(analyticsCallback) {
  // Measure LCP
  measureLCP((data) => {
    console.log('✅ LCP:', data);
    analyticsCallback?.('core_web_vital', data);
  });

  // Measure INP
  measureINP((data) => {
    console.log('✅ INP:', data);
    analyticsCallback?.('core_web_vital', data);
  });

  // Measure CLS
  measureCLS((data) => {
    console.log('✅ CLS:', data);
    analyticsCallback?.('core_web_vital', data);
  });

  // Measure FID
  measureFID((data) => {
    console.log('✅ FID:', data);
    analyticsCallback?.('core_web_vital', data);
  });

  // Measure TTFB
  window.addEventListener('load', () => {
    const ttfb = measureTTFB();
    if (ttfb) {
      console.log('✅ TTFB:', ttfb);
      analyticsCallback?.('core_web_vital', ttfb);
    }
  });
}

// ======================
// 7. Resource Hints
// ======================

/**
 * Add dns-prefetch for faster DNS lookups
 */
export function dnsPrefetch(domains) {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch resources that will be needed soon
 */
export function prefetchResource(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

// ======================
// 8. Code Splitting Utilities
// ======================

/**
 * Dynamically import components with loading state
 */
export async function loadComponentWhenVisible(
  importFunc,
  elementId,
  options = {}
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        importFunc().then(module => {
          options.onLoad?.(module);
        });
        observer.disconnect();
      }
    });
  }, { rootMargin: '50px' });

  observer.observe(element);
}

// ======================
// 9. Network Information API
// ======================

/**
 * Adapt resource loading based on network speed
 */
export function getNetworkSpeed() {
  if (!('connection' in navigator)) {
    return { effectiveType: '4g', saveData: false };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return {
    effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // Round trip time in ms
    saveData: connection.saveData // User has enabled data saver
  };
}

/**
 * Load images based on connection speed
 */
export function shouldLoadHighQuality() {
  const network = getNetworkSpeed();

  // Don't load high-quality if:
  // - User has data saver enabled
  // - Connection is slow (2g or slow-2g)
  // - Downlink is less than 1 Mbps
  if (network.saveData) return false;
  if (['2g', 'slow-2g'].includes(network.effectiveType)) return false;
  if (network.downlink && network.downlink < 1) return false;

  return true;
}

// ======================
// 10. Performance Budget Monitoring
// ======================

/**
 * Check if page exceeds performance budgets
 */
export function checkPerformanceBudget() {
  if (!('performance' in window)) return null;

  // Adjusted budgets for development bundle sizes
  const budgets = {
    totalJSSize: 2000 * 1024, // 2MB
    totalCSSSize: 200 * 1024,  // 200 KB
    totalImageSize: 2000 * 1024, // 2MB
    totalResources: 150,
    domNodes: 2500
  };

  const resources = performance.getEntriesByType('resource');
  const navigation = performance.getEntriesByType('navigation')[0];

  let totalJS = 0;
  let totalCSS = 0;
  let totalImages = 0;

  resources.forEach(resource => {
    if (resource.initiatorType === 'script') {
      totalJS += resource.transferSize || 0;
    } else if (resource.initiatorType === 'css' || resource.initiatorType === 'link') {
      totalCSS += resource.transferSize || 0;
    } else if (resource.initiatorType === 'img') {
      totalImages += resource.transferSize || 0;
    }
  });

  const domNodes = document.getElementsByTagName('*').length;

  const results = {
    passed: true,
    details: {
      javascript: {
        size: totalJS,
        budget: budgets.totalJSSize,
        exceeded: totalJS > budgets.totalJSSize
      },
      css: {
        size: totalCSS,
        budget: budgets.totalCSSSize,
        exceeded: totalCSS > budgets.totalCSSSize
      },
      images: {
        size: totalImages,
        budget: budgets.totalImageSize,
        exceeded: totalImages > budgets.totalImageSize
      },
      resources: {
        count: resources.length,
        budget: budgets.totalResources,
        exceeded: resources.length > budgets.totalResources
      },
      domNodes: {
        count: domNodes,
        budget: budgets.domNodes,
        exceeded: domNodes > budgets.domNodes
      }
    }
  };

  results.passed = !Object.values(results.details).some(item => item.exceeded);

  return results;
}

// ======================
// 11. Initialize All Optimizations
// ======================

/**
 * Call this in your App.jsx to enable all optimizations
 */
export function initializePerformanceOptimizations(options = {}) {
  // Preconnect to domains
  preconnectDomains();

  // Start monitoring Core Web Vitals
  if (options.enableMonitoring !== false) {
    monitorCoreWebVitals(options.analyticsCallback);
  }

  // Check performance budget on load
  window.addEventListener('load', () => {
    runWhenIdle(() => {
      const budget = checkPerformanceBudget();
      if (budget && !budget.passed) {
        console.warn('⚠️ Performance budget exceeded:', budget.details);
      }
    });
  });

  // Log network conditions
  if (options.logNetwork) {
    const network = getNetworkSpeed();
    console.log('📡 Network:', network);
  }

  console.log('✅ Performance optimizations initialized');
}

export default {
  preloadCriticalResources,
  preconnectDomains,
  measureLCP,
  measureINP,
  measureCLS,
  measureFID,
  measureTTFB,
  debounce,
  throttle,
  runWhenIdle,
  reserveImageSpace,
  monitorCoreWebVitals,
  dnsPrefetch,
  prefetchResource,
  loadComponentWhenVisible,
  getNetworkSpeed,
  shouldLoadHighQuality,
  checkPerformanceBudget,
  initializePerformanceOptimizations
};
