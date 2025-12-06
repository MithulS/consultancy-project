/**
 * Accessibility Enhancements Guide for ElectroStore
 * 
 * This file contains examples and patterns for implementing
 * WCAG 2.1 Level AA accessibility standards across all components.
 */

// ============================================================
// 1. SEMANTIC HTML & ARIA ATTRIBUTES
// ============================================================

/**
 * Example: Enhanced Button with ARIA
 * Add aria-label for icon-only buttons
 * Add aria-pressed for toggle buttons
 * Add aria-expanded for dropdown/collapse buttons
 */
const AccessibleButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Icon-only button */}
      <button aria-label="Close dialog">
        <span aria-hidden="true">×</span>
      </button>
      
      {/* Toggle button */}
      <button 
        aria-pressed={isOpen}
        aria-label="Show filters"
        onClick={() => setIsOpen(!isOpen)}
      >
        Filters
      </button>
      
      {/* Dropdown button */}
      <button
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
        aria-haspopup="true"
      >
        Categories
      </button>
    </>
  );
};

/**
 * Example: Accessible Images
 * All images must have meaningful alt text
 */
const AccessibleImage = ({ product }) => {
  return (
    <>
      {/* Decorative image */}
      <img src={product.icon} alt="" aria-hidden="true" />
      
      {/* Informative image */}
      <img 
        src={product.image} 
        alt={`${product.name} - ${product.category}`}
        loading="lazy"
      />
      
      {/* Product thumbnail */}
      <img
        src={product.thumbnail}
        alt={`View ${product.name} details. Price: $${product.price}`}
      />
    </>
  );
};

/**
 * Example: Form Labels & Associations
 * Every form input MUST have a label
 * Use htmlFor/id association
 */
const AccessibleForm = () => {
  return (
    <form>
      {/* Explicit label association */}
      <label htmlFor="email-input">Email Address</label>
      <input 
        id="email-input"
        type="email"
        aria-required="true"
        aria-describedby="email-hint"
      />
      <span id="email-hint" className="hint">
        We'll never share your email
      </span>
      
      {/* Error state */}
      <input
        id="password-input"
        type="password"
        aria-required="true"
        aria-invalid="true"
        aria-describedby="password-error"
      />
      <span id="password-error" role="alert">
        Password must be at least 8 characters
      </span>
    </form>
  );
};

/**
 * Example: Accessible Notifications/Toasts
 * Use role="status" or role="alert"
 */
const AccessibleToast = ({ message, type }) => {
  return (
    <div 
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      aria-atomic="true"
      className="toast"
    >
      {message}
    </div>
  );
};

// ============================================================
// 2. KEYBOARD NAVIGATION
// ============================================================

/**
 * Example: Keyboard-accessible Dropdown
 * Support Arrow keys, Enter, Escape
 */
const AccessibleDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const items = ['Item 1', 'Item 2', 'Item 3'];
  
  const handleKeyDown = (e) => {
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        // Select item
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div role="combobox" aria-expanded={isOpen}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-controls="dropdown-list"
      >
        Select
      </button>
      {isOpen && (
        <ul id="dropdown-list" role="listbox">
          {items.map((item, index) => (
            <li
              key={index}
              role="option"
              aria-selected={index === focusedIndex}
              tabIndex={index === focusedIndex ? 0 : -1}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Example: Skip Navigation Link
 * Already added to index.html, ensure target exists
 */
const MainContent = ({ children }) => {
  return (
    <main id="main-content" tabIndex="-1">
      {children}
    </main>
  );
};

// ============================================================
// 3. FOCUS MANAGEMENT
// ============================================================

/**
 * Example: Focus trap for modals
 */
const useFocusTrap = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    ref.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      ref.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [ref]);
};

// ============================================================
// 4. LIVE REGIONS FOR DYNAMIC CONTENT
// ============================================================

/**
 * Example: Accessible Product Grid with Loading State
 */
const AccessibleProductGrid = ({ products, loading }) => {
  return (
    <>
      {/* Screen reader announcement for loading */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {loading ? 'Loading products...' : `${products.length} products loaded`}
      </div>
      
      {/* Product grid */}
      <div 
        role="region"
        aria-label="Product list"
        aria-busy={loading}
      >
        {products.map(product => (
          <article 
            key={product._id}
            aria-labelledby={`product-${product._id}-name`}
          >
            <h3 id={`product-${product._id}-name`}>
              {product.name}
            </h3>
            <img 
              src={product.image} 
              alt={`${product.name} product image`}
            />
            <button 
              aria-label={`Add ${product.name} to cart. Price: $${product.price}`}
            >
              Add to Cart
            </button>
          </article>
        ))}
      </div>
    </>
  );
};

// ============================================================
// 5. COLOR CONTRAST & VISUAL INDICATORS
// ============================================================

/**
 * Ensure all text meets WCAG AA standards:
 * - Normal text: 4.5:1 contrast ratio
 * - Large text (18pt+): 3:1 contrast ratio
 * 
 * Don't rely on color alone - use icons/text too
 */
const AccessibleStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch(status) {
      case 'success':
        return { icon: '✓', text: 'Success', color: '#059669' };
      case 'error':
        return { icon: '✗', text: 'Error', color: '#dc2626' };
      case 'warning':
        return { icon: '⚠', text: 'Warning', color: '#d97706' };
      default:
        return { icon: 'ℹ', text: 'Info', color: '#2563eb' };
    }
  };
  
  const info = getStatusInfo();
  
  return (
    <div 
      role="status"
      style={{ color: info.color }}
    >
      <span aria-hidden="true">{info.icon}</span>
      <span>{info.text}</span>
    </div>
  );
};

// ============================================================
// 6. IMPLEMENTATION CHECKLIST FOR ALL COMPONENTS
// ============================================================

/**
 * Dashboard.jsx:
 * ✓ Add main element with id="main-content"
 * ✓ Add aria-label to search input
 * ✓ Add alt text to all product images
 * ✓ Add aria-label to cart button with count
 * ✓ Add keyboard navigation to category filters
 * ✓ Add role="status" to notification messages
 * 
 * LoginModern.jsx / RegisterModern.jsx:
 * ✓ Add htmlFor/id associations to all form fields
 * ✓ Add aria-required to required fields
 * ✓ Add aria-invalid and aria-describedby for errors
 * ✓ Add aria-label to password visibility toggle
 * 
 * Cart.jsx:
 * ✓ Add aria-label to quantity increment/decrement
 * ✓ Add aria-live region for cart total updates
 * ✓ Add alt text to product images
 * 
 * Checkout.jsx:
 * ✓ Add proper form labels
 * ✓ Add fieldset/legend for payment method selection
 * ✓ Add aria-describedby for field hints
 * 
 * Profile.jsx:
 * ✓ Add proper form labels
 * ✓ Add aria-describedby for validation messages
 * ✓ Use PasswordStrength component
 * 
 * Toast.jsx:
 * ✓ Add role="alert" for errors
 * ✓ Add role="status" for success/info
 * ✓ Add aria-live="polite"
 */

export default {
  AccessibleButton,
  AccessibleImage,
  AccessibleForm,
  AccessibleToast,
  AccessibleDropdown,
  MainContent,
  AccessibleProductGrid,
  AccessibleStatus,
  useFocusTrap
};
