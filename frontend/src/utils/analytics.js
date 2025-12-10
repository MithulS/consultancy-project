// Analytics Tracking Utility
class Analytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.startTime = Date.now();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUser(userId, userType) {
    this.userId = userId;
    this.userType = userType;
    this.track('user_identified', { userId, userType });
  }

  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
        userType: this.userType,
        page: window.location.hash,
        url: window.location.href
      }
    };

    this.events.push(event);
    
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', eventName, properties);
    }

    // Send to backend
    this.sendToBackend(event);
    
    // Store locally
    this.storeLocally(event);
  }

  async sendToBackend(event) {
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  storeLocally(event) {
    try {
      const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      stored.push(event);
      // Keep only last 100 events
      if (stored.length > 100) {
        stored.shift();
      }
      localStorage.setItem('analytics_events', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store analytics locally:', error);
    }
  }

  // Page view tracking
  pageView(pageName) {
    this.track('page_view', {
      pageName,
      referrer: document.referrer
    });
  }

  // User interaction tracking
  click(elementName, elementType) {
    this.track('click', { elementName, elementType });
  }

  formSubmit(formName, success, error = null) {
    this.track('form_submit', {
      formName,
      success,
      error: error?.message
    });
  }

  // E-commerce tracking
  productView(productId, productName) {
    this.track('product_view', { productId, productName });
  }

  addToCart(productId, productName, price, quantity) {
    this.track('add_to_cart', {
      productId,
      productName,
      price,
      quantity,
      value: price * quantity
    });
  }

  purchase(orderId, items, totalAmount) {
    this.track('purchase', {
      orderId,
      items,
      totalAmount,
      itemCount: items.length
    });
  }

  // Search tracking
  search(query, resultsCount) {
    this.track('search', { query, resultsCount });
  }

  // Error tracking
  error(errorMessage, errorStack, context) {
    this.track('error', {
      message: errorMessage,
      stack: errorStack,
      context
    });
  }

  // Performance tracking
  performance(metricName, value, unit = 'ms') {
    this.track('performance', {
      metricName,
      value,
      unit
    });
  }

  // Session duration
  getSessionDuration() {
    return Date.now() - this.startTime;
  }

  endSession() {
    this.track('session_end', {
      duration: this.getSessionDuration(),
      eventsCount: this.events.length
    });
  }

  // Get all events
  getEvents() {
    return this.events;
  }

  // Clear events
  clearEvents() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }
}

// Create singleton instance
const analytics = new Analytics();

// Track page unload
window.addEventListener('beforeunload', () => {
  analytics.endSession();
});

// Track hash changes
window.addEventListener('hashchange', () => {
  const pageName = window.location.hash.substring(1) || 'login';
  analytics.pageView(pageName);
});

export default analytics;
